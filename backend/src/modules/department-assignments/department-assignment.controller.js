import { findGrievanceForUser, serializeGrievance } from '../grievances/grievance.service.js';
import { assignGrievanceToDepartment, getAssignmentHistory } from './department-assignment.service.js';

export async function assignDepartment(req, res) {
  const grievance = await findGrievanceForUser(req.params.grievanceId, req.user);
  const assignment = await assignGrievanceToDepartment(grievance, req.body, req.user);
  const updatedGrievance = await findGrievanceForUser(grievance._id, req.user);
  return res.json({
    success: true,
    data: {
      grievance: await serializeGrievance(updatedGrievance, { user: req.user }),
      assignment: {
        id: assignment._id.toString(),
        department: assignment.department,
        officer: assignment.officer,
        dueAt: assignment.dueAt
      }
    }
  });
}

export async function listAssignmentHistory(req, res) {
  const grievance = await findGrievanceForUser(req.params.grievanceId, req.user);
  const assignments = await getAssignmentHistory(grievance._id);
  return res.json({ success: true, data: { assignments } });
}
