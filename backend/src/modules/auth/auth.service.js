import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';
import { jwtExpiresIn, jwtSecret, cookieSameSite, cookieSecure } from '../../config/env.js';
import { createHttpError } from '../../utils/api-response.js';

export function publicUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    department: user.department || null
  };
}

export function setAccessCookie(res, user) {
  const cookieNamesByRole = {
    citizen: 'citizenAccessToken',
    cmo: 'cmoAccessToken',
    department_officer: 'departmentAccessToken'
  };
  const cookieName = cookieNamesByRole[user.role];
  if (!cookieName) throw createHttpError(500, 'Cannot create an access token for this account role.');

  const signedToken = jwt.sign({ sub: user._id.toString() }, jwtSecret, { expiresIn: jwtExpiresIn });
  const decoded = jwt.decode(signedToken);
  res.cookie(cookieName, signedToken, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: '/api',
    maxAge: Math.max(0, decoded.exp * 1000 - Date.now())
  });
}

export function clearAccessCookie(res, role) {
  const cookieNamesByRole = {
    citizen: 'citizenAccessToken',
    cmo: 'cmoAccessToken',
    department_officer: 'departmentAccessToken'
  };
  const cookieName = cookieNamesByRole[role];
  if (!cookieName) throw createHttpError(500, 'Cannot clear an access token for this account role.');

  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: '/api'
  });
}

export async function registerCitizen(input) {
  const existing = await User.exists({ email: input.email.toLowerCase() });
  if (existing) throw createHttpError(409, 'An account with this email already exists.');
  return User.create({ ...input, role: 'citizen' });
}

export async function login(input) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(input.password))) {
    throw createHttpError(401, 'Invalid email or password.');
  }
  return user;
}

export async function createDepartmentOfficer(input) {
  const existing = await User.exists({ email: input.email.toLowerCase() });
  if (existing) throw createHttpError(409, 'An account with this email already exists.');
  return User.create({ ...input, role: 'department_officer' });
}
