import { createHttpError } from '../../utils/api-response.js';
import Grievance from '../grievances/grievance.model.js';
import GrievanceHistory from './grievance-history.model.js';

export async function recordGrievanceHistory(grievanceId, entry) {
  return GrievanceHistory.create({
    grievance: grievanceId,
    status: entry.status,
    assignedBy: entry.assignedBy || null
  });
}

export async function getGrievanceHistory(grievanceId) {
  if (!await Grievance.exists({ _id: grievanceId })) {
    throw createHttpError(404, 'Grievance not found.');
  }
  return GrievanceHistory.find({ grievance: grievanceId })
    .sort({ createdAt: 1 })
    .populate('assignedBy', 'fullName email')
    .lean();
}

export async function getHistoryForGrievances(grievanceIds) {
  if (!grievanceIds.length) return new Map();
  const entries = await GrievanceHistory.find({ grievance: { $in: grievanceIds } })
    .sort({ createdAt: 1 })
    .populate('assignedBy', 'fullName email')
    .lean();
  const byGrievance = new Map();
  for (const entry of entries) {
    const key = entry.grievance.toString();
    const current = byGrievance.get(key) || [];
    current.push(entry);
    byGrievance.set(key, current);
  }
  return byGrievance;
}

export async function addStatusHistory(grievance, status, assignedBy) {
  grievance.status = status;
  await grievance.save();
  await recordGrievanceHistory(grievance._id, {
    status,
    assignedBy
  });
  return grievance;
}
