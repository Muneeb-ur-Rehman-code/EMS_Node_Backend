import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  leaveType: { type: String, enum: ['SICK','CASUAL','ANNUAL','UNPAID'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number }, // optional computed length
  reason: { type: String },
  status: { type: String, enum: ['PENDING','APPROVED','REJECTED','CANCELLED'], default: 'PENDING' },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile' }
}, { timestamps: true });

// ✅ Pre-save hook: validate dates, calculate days & auto-approve sick leave
leaveSchema.pre("save", function (next) {
  // validate range
  if (this.startDate > this.endDate) {
    return next(new Error("startDate cannot be after endDate"));
  }

  // calculate total days
  const msPerDay = 24 * 60 * 60 * 1000;
  this.days = Math.round((this.endDate - this.startDate) / msPerDay) + 1;

  // auto-approve sick leave
  if (this.leaveType === "SICK") {
    this.status = "APPROVED";
  }

  next();
});

export default mongoose.model("Leave", leaveSchema);
