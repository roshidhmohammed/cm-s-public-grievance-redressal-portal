import GrievanceRemark from './grievance-remark.model.js';

export async function createGrievanceRemark(grievanceId, input, user, { visibility = 'public' } = {}) {
  return GrievanceRemark.create({
    grievance: grievanceId,
    content: input.content.trim(),
    createdBy: user._id,
    authorRole: user.role,
    visibility
  });
}

export async function getRemarksForGrievances(grievanceIds) {
  if (!grievanceIds.length) return new Map();
  const remarks = await GrievanceRemark.find({ grievance: { $in: grievanceIds } })
    .sort({ createdAt: 1 })
    .populate('createdBy', 'fullName')
    .lean();
  const grouped = new Map();
  for (const remark of remarks) {
    const key = remark.grievance.toString();
    const list = grouped.get(key) || [];
    list.push(remark);
    grouped.set(key, list);
  }
  return grouped;
}

export async function hasPublicCmoRemark(grievanceId) {
  return GrievanceRemark.exists({
    grievance: grievanceId,
    authorRole: 'cmo',
    visibility: 'public'
  });
}
