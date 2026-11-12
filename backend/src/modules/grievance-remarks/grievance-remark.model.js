import mongoose from 'mongoose';

const grievanceRemarkSchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['cmo', 'department_officer'], required: true },
  visibility: { type: String, enum: ['public', 'internal'], default: 'public', required: true }
}, { timestamps: true });

grievanceRemarkSchema.index({ grievance: 1, createdAt: 1 });

const GrievanceRemark = mongoose.model('GrievanceRemark', grievanceRemarkSchema);
export default GrievanceRemark;
