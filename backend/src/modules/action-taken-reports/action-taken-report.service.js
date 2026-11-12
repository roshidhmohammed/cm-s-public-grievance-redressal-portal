import { createHttpError } from '../../utils/api-response.js';
import { registerUploadedFiles } from '../attachments/attachment.service.js';
import { addStatusHistory } from '../grievance-history/grievance-history.service.js';
import ActionTakenReport from './action-taken-report.model.js';

export async function submitActionTakenReport(grievance, input, user, files = []) {
  if (!['UNDER_REVIEW', 'IN_PROGRESS'].includes(grievance.status)) {
    throw createHttpError(409, 'An action report cannot be submitted at the current stage.');
  }
  const assignment = grievance.assignment;
  const departmentId = assignment?.department?._id || assignment?.department;
  if (!departmentId) throw createHttpError(409, 'The grievance has no assigned department.');
  const assignedOfficer = assignment?.officer?._id || assignment?.officer;
  if (assignedOfficer && assignedOfficer.toString() !== user._id.toString()) {
    throw createHttpError(403, 'This grievance is assigned to another officer.');
  }

  const attachments = await registerUploadedFiles(grievance._id, user._id, files, 'action_report');
  const report = await ActionTakenReport.create({
    grievance: grievance._id,
    departmentId,
    details: input.details.trim(),
    attachments: attachments.map((attachment) => attachment._id),
    submittedBy: user._id
  });

  if (grievance.status === 'UNDER_REVIEW') {
    await addStatusHistory(grievance, 'IN_PROGRESS', user._id);
  }

  return report;
}

export async function getReportsForGrievances(grievanceIds) {
  if (!grievanceIds.length) return new Map();
  const reports = await ActionTakenReport.find({ grievance: { $in: grievanceIds } })
    .sort({ createdAt: 1 })
    .populate('attachments', 'filename originalName mimeType size')
    .lean();
  const grouped = new Map();
  for (const report of reports) {
    const key = report.grievance.toString();
    const list = grouped.get(key) || [];
    list.push(report);
    grouped.set(key, list);
  }
  return grouped;
}

export async function markActionTakenReportsReviewed(grievanceId) {
  await ActionTakenReport.updateMany(
    { grievance: grievanceId, reviewedAt: null },
    { $set: { reviewedAt: new Date() } }
  );
}
