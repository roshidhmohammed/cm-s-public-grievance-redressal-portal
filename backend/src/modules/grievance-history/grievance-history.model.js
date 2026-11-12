import mongoose from 'mongoose';
import { grievanceStatuses } from '../grievances/grievance.model.js';

const grievanceHistorySchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true, index: true },
  status: { type: String, enum: grievanceStatuses, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

grievanceHistorySchema.index({ grievance: 1, createdAt: 1 });

const GrievanceHistory = mongoose.model('GrievanceHistory', grievanceHistorySchema);
export default GrievanceHistory;
