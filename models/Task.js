import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  priority: { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'MEDIUM' },
  dueDate: { type: Date },
  assignTo: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  status: { type: String, enum: ['PENDING','IN_PROGRESS', 'DONE','COMPLETED','BLOCKED','DELAYED'], default: 'PENDING' },
  assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
