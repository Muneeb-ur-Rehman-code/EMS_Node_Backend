import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  title: { type: String },
  body: { type: String },
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);
