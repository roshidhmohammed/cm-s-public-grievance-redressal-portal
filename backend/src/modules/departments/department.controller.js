import Department from './department.model.js';
import User from '../users/user.model.js';
import { createHttpError } from '../../utils/api-response.js';
import { createDepartmentOfficer, publicUser } from '../auth/auth.service.js';

export async function listDepartments(req, res) {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 }).lean();
  return res.json({ success: true, data: { departments } });
}

export async function listDepartmentOfficers(req, res) {
  const officers = await User.find({
    department: req.params.id,
    role: 'department_officer',
    isActive: true
  }).select('_id fullName email').sort({ fullName: 1 }).lean();
  return res.json({ success: true, data: { officers } });
}

export async function listUnassignedDepartmentOfficers(req, res) {
  const officers = await User.find({
    role: 'department_officer',
    isActive: true,
    $or: [{ department: null }, { department: { $exists: false } }]
  }).select('_id fullName email mobile').sort({ fullName: 1 }).lean();
  return res.json({ success: true, data: { officers } });
}

export async function createOfficer(req, res) {
  let department = null;
  if (req.body.department) {
    department = await Department.findOne({ _id: req.body.department, isActive: true });
    if (!department) throw createHttpError(400, 'Select an active department.');
  }
  const user = await createDepartmentOfficer({
    ...req.body,
    department: department?._id || null
  });
  return res.status(201).json({ success: true, data: { user: publicUser(user) } });
}

function departmentSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function assignOfficer(department, officerId) {
  const result = await User.updateOne(
    {
      _id: officerId,
      role: 'department_officer',
      isActive: true,
      $or: [{ department: null }, { department: { $exists: false } }]
    },
    { $set: { department: department._id } }
  );
  if (result.modifiedCount !== 1) {
    throw createHttpError(409, 'Officer is not available or already assigned to a department.');
  }
  return User.findById(officerId).select('_id fullName email mobile department').lean();
}

export async function createDepartment(req, res) {
  const { name, description, officerId } = req.body;
  if (officerId && !await User.exists({
    _id: officerId,
    role: 'department_officer',
    isActive: true,
    $or: [{ department: null }, { department: { $exists: false } }]
  })) {
    throw createHttpError(409, 'Officer is not available or already assigned to a department.');
  }

  const department = await Department.create({
    name: name.trim(),
    slug: departmentSlug(name),
    description: description.trim()
  });
  let officer = null;
  if (officerId) {
    try {
      officer = await assignOfficer(department, officerId);
    } catch (error) {
      await Department.deleteOne({ _id: department._id });
      throw error;
    }
  }

  return res.status(201).json({ success: true, data: { department, officer } });
}

export async function assignDepartmentOfficer(req, res) {
  const department = await Department.findOne({ _id: req.params.id, isActive: true });
  if (!department) throw createHttpError(404, 'Department not found.');
  const officer = await assignOfficer(department, req.body.officerId);
  return res.json({ success: true, data: { officer } });
}
