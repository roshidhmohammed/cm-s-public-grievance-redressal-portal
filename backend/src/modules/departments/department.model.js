import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
