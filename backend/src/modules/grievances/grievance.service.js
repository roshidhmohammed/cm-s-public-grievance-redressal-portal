import { createHttpError } from '../../utils/api-response.js';
import createReferenceNumber from '../../utils/reference-number.js';
import Grievance from './grievance.model.js';
import {
  assignGrievanceToDepartment,
  findGrievanceIdsForDepartment,
  getAssignmentHistory,
  getAssignmentsForGrievances,
  getCurrentAssignment
} from '../department-assignments/department-assignment.service.js';
import {
  addStatusHistory,
  getHistoryForGrievances,
  recordGrievanceHistory
} from '../grievance-history/grievance-history.service.js';
import {
  getAttachmentsForGrievances,
  registerUploadedFiles
} from '../attachments/attachment.service.js';
import {
  getReportsForGrievances,
  markActionTakenReportsReviewed,
  submitActionTakenReport
} from '../action-taken-reports/action-taken-report.service.js';
import {
  getRemarksForGrievances,
  hasPublicCmoRemark
} from '../grievance-remarks/grievance-remark.service.js';
import Feedback from '../citizen-feedback/feedback.model.js';

const terminalStatuses = ['RESOLVED', 'REJECTED'];

function attachmentView(attachment) {
  return {
    id: attachment._id.toString(),
    filename: attachment.filename,
    originalName: attachment.originalName,
    mimeType: attachment.mimeType,
    size: attachment.size
  };
}

async function relatedData(grievanceIds) {
  const [historyByGrievance, assignmentByGrievance, attachmentsByGrievance, reportsByGrievance, remarksByGrievance, feedbackRecords] = await Promise.all([
    getHistoryForGrievances(grievanceIds),
    getAssignmentsForGrievances(grievanceIds),
    getAttachmentsForGrievances(grievanceIds),
    getReportsForGrievances(grievanceIds),
    getRemarksForGrievances(grievanceIds),
    Feedback.find({ grievance: { $in: grievanceIds } }).select('grievance').lean()
  ]);
  const feedbackByGrievance = new Set(feedbackRecords.map((record) => record.grievance.toString()));
  return { historyByGrievance, assignmentByGrievance, attachmentsByGrievance, reportsByGrievance, remarksByGrievance, feedbackByGrievance };
}

function toGrievanceView(grievance, related, { publicView = false, user } = {}) {
  const id = grievance._id.toString();
  const history = related.historyByGrievance.get(id) || [];
  const assignment = related.assignmentByGrievance.get(id) || null;
  const attachments = related.attachmentsByGrievance.get(id) || [];
  const reports = related.reportsByGrievance.get(id) || [];
  const remarks = related.remarksByGrievance.get(id) || [];
  const visibleRemarks = user?.role === 'cmo'
    ? remarks
    : remarks.filter((remark) => remark.visibility === 'public');
  const result = {
    id,
    referenceNumber: grievance.referenceNumber,
    district: grievance.district,
    category: grievance.category,
    subject: grievance.subject,
    description: grievance.description,
    status: grievance.status,
    submittedAt: grievance.createdAt,
    priority: grievance.priority,
    assignedDepartment: assignment?.department?.name || 'CMO Review',
    resolution: grievance.resolution,
    remarks: visibleRemarks.map((remark) => ({
      content: remark.content,
      author: remark.createdBy?.fullName || 'Portal officer',
      authorRole: remark.authorRole,
      visibility: remark.visibility,
      createdAt: remark.createdAt
    })),
    statusHistory: history.map((entry) => ({
      status: entry.status,
      date: entry.createdAt,
      assignedBy: user?.role === 'cmo' ? entry.assignedBy?.fullName || null : null
    })),
    attachments: attachments.filter((item) => item.purpose !== 'action_report').map(attachmentView),
    actionReports: reports.map((report) => ({
      id: report._id.toString(),
      details: report.details,
      submittedAt: report.createdAt,
      reviewedAt: report.reviewedAt,
      attachments: report.attachments.map(attachmentView)
    }))
  };

  if (user?.role === 'citizen') {
    result.feedbackSubmitted = related.feedbackByGrievance.has(id);
  }

  if (!publicView) {
    result.citizen = grievance.citizen;
    result.assignedOfficer = assignment?.officer || null;
    if (user?.role === 'cmo') result.assignmentHistory = related.assignmentHistory || [];
    result.dueAt = assignment?.dueAt || grievance.dueAt;
    result.escalatedAt = grievance.escalatedAt;
  }
  return result;
}

export async function serializeGrievance(grievance, options = {}) {
  const related = await relatedData([grievance._id]);
  const assignmentHistory = options.publicView || options.user?.role !== 'cmo'
    ? []
    : await getAssignmentHistory(grievance._id);
  related.assignmentHistory = assignmentHistory;
  return toGrievanceView(grievance, related, options);
}

export async function createGrievance(input, user, files = []) {
  const grievance = await Grievance.create({
    ...input,
    referenceNumber: createReferenceNumber(),
    citizen: user._id
  });
  await Promise.all([
    recordGrievanceHistory(grievance._id, {
      status: 'SUBMITTED',
      assignedBy: user._id
    }),
    registerUploadedFiles(grievance._id, user._id, files, 'grievance')
  ]);
  return grievance;
}

export async function findGrievanceForUser(id, user) {
  const grievance = await Grievance.findById(id)
    .populate('citizen', 'fullName email mobile')
    .populate({
      path: 'assignment',
      populate: [
        { path: 'department', select: 'name' },
        { path: 'officer', select: 'fullName email' }
      ]
    });
  if (!grievance) throw createHttpError(404, 'Grievance not found.');
  if (user.role === 'citizen' && grievance.citizen._id.toString() !== user._id.toString()) {
    throw createHttpError(403, 'You cannot access this grievance.');
  }
  const departmentId = grievance.assignment?.department?._id || grievance.assignment?.department;
  if (user.role === 'department_officer' && departmentId?.toString() !== user.department?.toString()) {
    throw createHttpError(403, 'This grievance is not assigned to your department.');
  }
  return grievance;
}

export async function listGrievances(query, user) {
  const filter = {};
  if (user.role === 'citizen') filter.citizen = user._id;
  if (user.role === 'department_officer') {
    filter._id = { $in: await findGrievanceIdsForDepartment(user.department) };
  }

  for (const key of ['district', 'category', 'status', 'priority']) {
    if (query[key]) filter[key] = query[key];
  }

  const { page, limit } = query;
  const [items, total] = await Promise.all([
    Grievance.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('assignment').populate('citizen', 'fullName'),
    Grievance.countDocuments(filter)
  ]);
  const related = await relatedData(items.map((item) => item._id));
  return {
    items: items.map((item) => toGrievanceView(item, related, { user })),
    page,
    limit,
    total
  };
}

export async function trackByReference(referenceNumber, user) {
  const grievance = await Grievance.findOne({ referenceNumber: referenceNumber.trim().toUpperCase() })
    .populate('assignment');
  if (!grievance) throw createHttpError(404, 'No grievance was found with that reference number.');
  if (user.role !== 'citizen' || grievance.citizen.toString() !== user._id.toString()) {
    throw createHttpError(403, 'You can only track grievances submitted from your account.');
  }
  return serializeGrievance(grievance, { user });
}

export async function assignGrievance(grievance, input, user) {
  return assignGrievanceToDepartment(grievance, input, user);
}

export async function submitActionReport(grievance, input, user, files) {
  return submitActionTakenReport(grievance, input, user, files);
}

export async function reviewResolution(grievance, input, user) {
  if (grievance.status !== 'IN_PROGRESS') {
    throw createHttpError(409, 'Only an in-progress grievance can be resolved by the CMO.');
  }
  if (!await hasPublicCmoRemark(grievance._id)) {
    throw createHttpError(409, 'Add a public CMO remark before resolving this grievance.');
  }
  grievance.resolution = input.resolution;
  await grievance.save();
  await markActionTakenReportsReviewed(grievance._id);
  return addStatusHistory(grievance, 'RESOLVED', user._id);
}

export async function escalateGrievance(grievance) {
  if (terminalStatuses.includes(grievance.status)) throw createHttpError(409, 'Closed grievances cannot be escalated.');
  grievance.escalatedAt = new Date();
  await grievance.save();
  return grievance;
}
