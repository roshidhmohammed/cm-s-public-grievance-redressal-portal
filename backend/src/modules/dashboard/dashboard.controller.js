import Grievance from '../grievances/grievance.model.js';
import { findGrievanceIdsForDepartment } from '../department-assignments/department-assignment.service.js';

const closed = ['RESOLVED'];

export async function cmoDashboard(req, res) {
  const [total, pending, resolved, overdue, districtStats, departmentStats, groupedStatuses] = await Promise.all([
    Grievance.countDocuments(),
    Grievance.countDocuments({ status: { $nin: closed } }),
    Grievance.countDocuments({ status: 'RESOLVED' }),
    Grievance.countDocuments({ status: { $nin: closed }, dueAt: { $lt: new Date() } }),
    Grievance.aggregate([{ $group: { _id: '$district', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Grievance.aggregate([
      { $match: { assignment: { $ne: null } } },
      { $lookup: { from: 'departmentassignments', localField: 'assignment', foreignField: '_id', as: 'assignment' } },
      { $unwind: '$assignment' },
      { $group: { _id: '$assignment.department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
      { $unwind: '$department' },
      { $project: { _id: 0, department: '$department.name', count: 1 } },
      { $sort: { count: -1 } }
    ]),
    Grievance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  return res.json({
    success: true,
    data: {
      totalGrievances: total,
      pendingGrievances: pending,
      resolvedGrievances: resolved,
      overdueGrievances: overdue,
      districtStats: districtStats.map(({ _id, count }) => ({ district: _id, count })),
      departmentStats,
      statusDistribution: groupedStatuses.map(({ _id, count }) => ({ status: _id, count }))
    }
  });
}

export async function departmentDashboard(req, res) {
  const grievanceIds = await findGrievanceIdsForDepartment(req.user.department);
  const base = { _id: { $in: grievanceIds } };
  const [assignedGrievances, underReview, inProgress, resolvedGrievances] = await Promise.all([
    Grievance.countDocuments(base),
    Grievance.countDocuments({ ...base, status: 'UNDER_REVIEW' }),
    Grievance.countDocuments({ ...base, status: 'IN_PROGRESS' }),
    Grievance.countDocuments({ ...base, status: 'RESOLVED' })
  ]);
  return res.json({
    success: true,
    data: { assignedGrievances, underReview, inProgress, resolvedGrievances }
  });
}
