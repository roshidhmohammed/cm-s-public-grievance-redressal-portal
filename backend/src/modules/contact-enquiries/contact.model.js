import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'reviewed', 'closed'], default: 'new' }
}, { timestamps: true });

const ContactEnquiry = mongoose.model('ContactEnquiry', contactEnquirySchema);
export default ContactEnquiry;
