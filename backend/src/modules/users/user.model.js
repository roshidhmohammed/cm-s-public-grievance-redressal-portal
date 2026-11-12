import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  mobile: { type: String, default: '', trim: true, maxlength: 20 },
  password: { type: String, required: true, minlength: 8, select: false },
  role: {
    type: String,
    enum: ['citizen', 'cmo', 'department_officer'],
    default: 'citizen',
    required: true
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
