import mongoose from 'mongoose';
import '../config/env.js';
import Grievance from '../modules/grievances/grievance.model.js';
import GrievanceHistory from '../modules/grievance-history/grievance-history.model.js';
import DepartmentAssignment from '../modules/department-assignments/department-assignment.model.js';
import Attachment from '../modules/attachments/attachment.model.js';
import ActionTakenReport from '../modules/action-taken-reports/action-taken-report.model.js';

const legacyStatusMap = {
  UNDER_CMO_REVIEW: 'SUBMITTED',
  FORWARDED_TO_DEPARTMENT: 'UNDER_REVIEW',
  UNDER_DEPARTMENT_REVIEW: 'IN_PROGRESS',
  ACTION_REPORT_SUBMITTED: 'IN_PROGRESS',
  UNDER_CMO_RESOLUTION_REVIEW: 'IN_PROGRESS',
  RETURNED_FOR_FURTHER_ACTION: 'UNDER_REVIEW'
};

function currentStatus(status) {
  return legacyStatusMap[status] || status;
}

function attachmentDocument(grievanceId, file, uploadedBy, purpose) {
  return {
    grievance: grievanceId,
    uploadedBy: uploadedBy || grievanceId,
    purpose,
    filename: file.filename,
    originalName: file.originalName || file.originalname || file.filename,
    mimeType: file.mimeType || file.mimetype || 'application/octet-stream',
    size: file.size || 0
  };
}

async function migrateGrievance(raw) {
  const set = {};
  const unset = {};

  if (Array.isArray(raw.history)) {
    for (const entry of raw.history) {
      await GrievanceHistory.collection.updateOne(
        { _id: entry._id || new mongoose.Types.ObjectId() },
        {
          $setOnInsert: {
            grievance: raw._id,
            status: currentStatus(entry.status || raw.status),
            assignedBy: entry.assignedBy || entry.actor || null,
            createdAt: entry.createdAt || raw.createdAt || new Date(),
            updatedAt: entry.updatedAt || entry.createdAt || raw.createdAt || new Date()
          }
        },
        { upsert: true }
      );
    }
    unset.history = '';
  }

  const allAttachments = [
    ...(Array.isArray(raw.attachments) ? raw.attachments.map((file) => ({ file, purpose: 'grievance' })) : []),
    ...(Array.isArray(raw.actionReports)
      ? raw.actionReports.flatMap((report) => (report.attachments || []).map((file) => ({ file, purpose: 'action_report' })))
      : [])
  ];

  for (const { file, purpose } of allAttachments) {
    if (!file.filename) continue;
    await Attachment.updateOne(
      { filename: file.filename },
      { $setOnInsert: attachmentDocument(raw._id, file, raw.citizen, purpose) },
      { upsert: true }
    );
  }

  for (const report of raw.actionReports || []) {
    let departmentId = raw.department || report.departmentId || null;
    if (!departmentId && raw.assignment) {
      const currentAssignment = await DepartmentAssignment.findById(raw.assignment).select('department').lean();
      departmentId = currentAssignment?.department || null;
    }
    if (!departmentId) {
      const priorAssignment = await DepartmentAssignment.findOne({ grievance: raw._id })
        .sort({ createdAt: -1 }).select('department').lean();
      departmentId = priorAssignment?.department || null;
    }
    if (!departmentId) {
      throw new Error(`Cannot migrate action report ${report._id || '(unknown)'} for grievance ${raw._id}: department is unavailable.`);
    }
    const reportAttachments = [];
    for (const file of report.attachments || []) {
      if (!file.filename) continue;
      const attachment = await Attachment.findOne({ filename: file.filename }).select('_id').lean();
      if (attachment) reportAttachments.push(attachment._id);
    }
    const reportId = report._id || new mongoose.Types.ObjectId();
    await ActionTakenReport.collection.updateOne(
      { _id: reportId },
      {
        $setOnInsert: {
          grievance: raw._id,
          departmentId,
          details: report.details || 'Migrated action-taken report.',
          attachments: reportAttachments,
          submittedBy: report.submittedBy || raw.citizen,
          reviewedAt: null,
          createdAt: report.submittedAt || report.createdAt || raw.createdAt || new Date(),
          updatedAt: report.updatedAt || report.submittedAt || raw.createdAt || new Date()
        }
      },
      { upsert: true }
    );
  }

  if (raw.department && !raw.assignment) {
    const legacyKey = `${raw._id}:initial-assignment`;
    await DepartmentAssignment.updateOne(
      { legacyKey },
      {
        $setOnInsert: {
          grievance: raw._id,
          department: raw.department,
          officer: raw.assignedOfficer || null,
          assignedBy: null,
          dueAt: raw.dueAt || null,
          legacyKey,
          createdAt: raw.updatedAt || raw.createdAt || new Date(),
          updatedAt: raw.updatedAt || raw.createdAt || new Date()
        }
      },
      { upsert: true }
    );
    const assignment = await DepartmentAssignment.findOne({ legacyKey }).select('_id').lean();
    set.assignment = assignment._id;
  }

  if (Array.isArray(raw.attachments)) unset.attachments = '';
  if (Array.isArray(raw.actionReports)) unset.actionReports = '';
  if (raw.department !== undefined) unset.department = '';
  if (raw.assignedOfficer !== undefined) unset.assignedOfficer = '';

  if (Object.keys(set).length || Object.keys(unset).length) {
    await Grievance.collection.updateOne(
      { _id: raw._id },
      {
        ...(Object.keys(set).length ? { $set: set } : {}),
        ...(Object.keys(unset).length ? { $unset: unset } : {})
      }
    );
  }
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  let statusesUpdated = 0;
  for (const [legacyStatus, status] of Object.entries(legacyStatusMap)) {
    const [grievances, histories] = await Promise.all([
      Grievance.collection.updateMany({ status: legacyStatus }, { $set: { status } }),
      GrievanceHistory.collection.updateMany({ status: legacyStatus }, { $set: { status } })
    ]);
    statusesUpdated += grievances.modifiedCount + histories.modifiedCount;
  }

  const historyCursor = GrievanceHistory.collection.find({
    $or: [
      { actor: { $exists: true } },
      { note: { $exists: true } },
      { actorName: { $exists: true } },
      { isInternal: { $exists: true } }
    ]
  });
  let historiesUpdated = 0;
  for await (const history of historyCursor) {
    const update = { $unset: { note: '', actor: '', actorName: '', isInternal: '' } };
    if (history.assignedBy === undefined && history.actor) {
      update.$set = { assignedBy: history.actor };
    }
    await GrievanceHistory.collection.updateOne({ _id: history._id }, update);
    historiesUpdated += 1;
  }

  const reportCursor = ActionTakenReport.collection.find({ departmentId: { $exists: false } });
  let reportsUpdated = 0;
  for await (const report of reportCursor) {
    const grievance = await Grievance.collection.findOne(
      { _id: report.grievance },
      { projection: { assignment: 1, department: 1 } }
    );
    let departmentId = grievance?.department || null;
    if (!departmentId && grievance?.assignment) {
      const assignment = await DepartmentAssignment.findById(grievance.assignment).select('department').lean();
      departmentId = assignment?.department || null;
    }
    if (!departmentId) {
      throw new Error(`Cannot migrate action report ${report._id}: department is unavailable.`);
    }
    await ActionTakenReport.collection.updateOne(
      { _id: report._id },
      { $set: { departmentId } }
    );
    reportsUpdated += 1;
  }

  const cursor = Grievance.collection.find({
    $or: [
      { history: { $type: 'array' } },
      { attachments: { $type: 'array' } },
      { actionReports: { $type: 'array' } },
      { department: { $exists: true } },
      { assignedOfficer: { $exists: true } }
    ]
  });

  let migrated = 0;
  for await (const grievance of cursor) {
    await migrateGrievance(grievance);
    migrated += 1;
  }
  console.log(`Migrated ${statusesUpdated} legacy status value(s), related data for ${migrated} grievance(s), ${historiesUpdated} history record(s), and ${reportsUpdated} action report(s).`);
}

migrate()
  .catch((error) => {
    console.error('Grievance relation migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
