import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  grievance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grievance',
    required: true,
    unique: true,
    index: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, default: '', maxlength: 2000 }
}, { timestamps: true });

const Feedback = mongoose.model('CitizenFeedback', feedbackSchema);
export default Feedback;
