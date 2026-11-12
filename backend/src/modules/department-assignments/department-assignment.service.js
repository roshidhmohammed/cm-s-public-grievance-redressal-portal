import { createHttpError } from '../../utils/api-response.js';
import Department from '../departments/department.model.js';
import User from '../users/user.model.js';
import DepartmentAssignment from './department-assignment.model.js';
import Grievance from '../grievances/grievance.model.js';
import { recordGrievanceHistory } from '../grievance-history/grievance-history.service.js';

export async function assignGrievanceToDepartment(grievance, input, user) {
  if (grievance.status !== 'SUBMITTED') {
    throw createHttpError(409, 'Only submitted grievances can be assigned to a department.');
  }

  const department = await Department.findOne({ _id: input.department, isActive: true });
  if (!department) throw createHttpError(400, 'Select an active department.');

  let officer = null;
  if (input.officer) {
    officer = await User.findOne({
      _id: input.officer,
      role: 'department_officer',
      department: department._id,
      isActive: true
    });
    if (!officer) throw createHttpError(400, 'The selected officer is not active in that department.');
  }

  const dueAt = input.dueAt || grievance.dueAt || null;

  const assignment = await DepartmentAssignment.create({
    grievance: grievance._id,
    department: department._id,
    officer: officer?._id || null,
    assignedBy: user._id,
    dueAt
  });

  grievance.assignment = assignment._id;
  grievance.priority = input.priority;
  grievance.status = 'UNDER_REVIEW';
  if (dueAt) grievance.dueAt = dueAt;
  await grievance.save();
  await recordGrievanceHistory(grievance._id, {
    status: grievance.status,
    assignedBy: user._id
  });
  return assignment;
}

export async function getCurrentAssignment(grievanceId) {
  const grievance = await Grievance.findById(grievanceId).select('assignment').lean();
  if (!grievance?.assignment) return null;
  return DepartmentAssignment.findById(grievance.assignment)
    .populate('department', 'name')
    .populate('officer', 'fullName email')
    .lean();
}

export async function getAssignmentsForGrievances(grievanceIds) {
  if (!grievanceIds.length) return new Map();
  const grievances = await Grievance.find({ _id: { $in: grievanceIds }, assignment: { $ne: null } })
    .select('_id assignment')
    .lean();
  if (!grievances.length) return new Map();
  const assignments = await DepartmentAssignment.find({
    _id: { $in: grievances.map((item) => item.assignment) }
  })
    .populate('department', 'name')
    .populate('officer', 'fullName email')
    .lean();
  const byId = new Map(assignments.map((assignment) => [assignment._id.toString(), assignment]));
  const current = new Map();
  for (const grievance of grievances) {
    const assignment = byId.get(grievance.assignment.toString());
    if (assignment) current.set(grievance._id.toString(), assignment);
  }
  return current;
}

export async function findGrievanceIdsForDepartment(departmentId) {
  const assignments = await DepartmentAssignment.distinct('_id', { department: departmentId });
  return Grievance.distinct('_id', { assignment: { $in: assignments } });
}

export async function getAssignmentHistory(grievanceId) {
  return DepartmentAssignment.find({ grievance: grievanceId })
    .sort({ createdAt: 1 })
    .populate('department', 'name')
    .populate('officer', 'fullName email')
    .populate('assignedBy', 'fullName email')
    .lean();
}
