import { findGrievanceForUser } from '../grievances/grievance.service.js';
import { getGrievanceHistory } from './grievance-history.service.js';

export async function listGrievanceHistory(req, res) {
  const grievance = await findGrievanceForUser(req.params.grievanceId, req.user);
  const history = await getGrievanceHistory(grievance._id);
  return res.json({
    success: true,
    data: {
      history: history.map(({ status, assignedBy, createdAt }) => ({
        status, assignedBy, date: createdAt
      }))
    }
  });
}
