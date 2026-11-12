import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, enum: ['grievance', 'action_report', 'supplemental'], required: true },
  filename: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true }
}, { timestamps: true });

attachmentSchema.index({ grievance: 1, purpose: 1 });

const Attachment = mongoose.model('Attachment', attachmentSchema);
export default Attachment;
