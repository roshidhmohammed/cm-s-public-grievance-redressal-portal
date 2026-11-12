import mongoose from 'mongoose';

const actionTakenReportSchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true, index: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  details: { type: String, required: true, trim: true, maxlength: 5000 },
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

const ActionTakenReport = mongoose.model('ActionTakenReport', actionTakenReportSchema);
export default ActionTakenReport;
