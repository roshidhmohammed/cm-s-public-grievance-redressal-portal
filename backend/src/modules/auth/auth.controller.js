import Department from '../departments/department.model.js';
import {
  clearAccessCookie,
  createDepartmentOfficer,
  login,
  publicUser,
  registerCitizen,
  setAccessCookie
} from './auth.service.js';
import { createHttpError } from '../../utils/api-response.js';

export async function register(req, res) {
  const user = await registerCitizen(req.body);
  setAccessCookie(res, user);
  return res.status(201).json({ success: true, data: { user: publicUser(user) } });
}

export async function signIn(req, res) {
  const user = await login(req.body);
  setAccessCookie(res, user);
  return res.json({ success: true, data: { user: publicUser(user) } });
}

export function signOut(req, res) {
  clearAccessCookie(res, req.user.role);
  return res.json({ success: true, message: 'Signed out successfully.' });
}

export function currentUser(req, res) {
  return res.json({ success: true, data: { user: publicUser(req.user) } });
}

export async function createOfficer(req, res) {
  let department = null;
  if (req.body.department) {
    department = await Department.findOne({ _id: req.body.department, isActive: true });
    if (!department) throw createHttpError(400, 'Select an active department.');
  }
  const user = await createDepartmentOfficer({ ...req.body, department: department?._id || null });
  return res.status(201).json({ success: true, data: { user: publicUser(user) } });
}
