import { findGrievanceForUser } from '../grievances/grievance.service.js';
import { createGrievanceRemark } from './grievance-remark.service.js';

export async function addCmoRemark(req, res) {
  const grievance = await findGrievanceForUser(req.params.grievanceId, req.user);
  if (grievance.status !== 'IN_PROGRESS') {
    throw createHttpError(409, 'CMO remarks can be added after the department starts work.');
  }
  const remark = await createGrievanceRemark(grievance._id, req.body, req.user, {
    visibility: req.body.visibility
  });
  return res.status(201).json({
    success: true,
    data: {
      id: remark._id.toString(),
      content: remark.content,
      authorRole: remark.authorRole,
      visibility: remark.visibility,
      createdAt: remark.createdAt
    }
  });
}
