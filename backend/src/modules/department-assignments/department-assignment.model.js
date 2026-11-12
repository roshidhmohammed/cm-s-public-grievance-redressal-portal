import mongoose from 'mongoose';

const departmentAssignmentSchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueAt: { type: Date, default: null }
}, { timestamps: true });

departmentAssignmentSchema.index({ department: 1, createdAt: -1 });

const DepartmentAssignment = mongoose.model('DepartmentAssignment', departmentAssignmentSchema);
export default DepartmentAssignment;
