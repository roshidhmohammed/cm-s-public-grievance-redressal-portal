import mongoose from 'mongoose';

export const grievanceStatuses = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED'
];

export const grievanceDistricts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const grievanceSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  district: { type: String, required: true, enum: grievanceDistricts },
  category: {
    type: String,
    required: true,
    enum: ['Infrastructure', 'Health', 'Education', 'Public Services', 'Water & Sanitation', 'Transport', 'Other']
  },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 10000 },
  status: { type: String, enum: grievanceStatuses, default: 'SUBMITTED', index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium', index: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartmentAssignment', default: null, index: true },
  resolution: { type: String, default: '', maxlength: 5000 },
  dueAt: { type: Date, default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), index: true },
  escalatedAt: { type: Date, default: null }
}, { timestamps: true });

grievanceSchema.index({ district: 1, category: 1, status: 1, priority: 1 });

const Grievance = mongoose.model('Grievance', grievanceSchema);
export default Grievance;
