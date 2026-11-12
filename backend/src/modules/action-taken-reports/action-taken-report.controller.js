import { findGrievanceForUser, serializeGrievance } from '../grievances/grievance.service.js';
import { submitActionTakenReport } from './action-taken-report.service.js';

export async function authorizeActionReport(req, res, next) {
  req.grievance = await findGrievanceForUser(req.params.grievanceId, req.user);
  return next();
}

export async function submitActionReport(req, res) {
  const grievance = req.grievance;
  const report = await submitActionTakenReport(grievance, req.body, req.user, req.files);
  const updated = await findGrievanceForUser(grievance._id, req.user);
  return res.status(201).json({
    success: true,
    data: {
      reportId: report._id.toString(),
      grievance: await serializeGrievance(updated, { user: req.user })
    }
  });
}
