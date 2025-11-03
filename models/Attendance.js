const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployeeProfile",
    required: true,
  },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "late", "half-day"],
    default: "absent",
  },
  checkIn: { type: Date },
  checkOut: { type: Date },
  hoursWorked: { type: Number, default: 0 },
});

// Ensure unique attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });



attendanceSchema.pre("save", function (next) {
  if (this.checkIn) {
    if (this.checkOut) {
      // Calculate worked hours
      const diffMs = this.checkOut - this.checkIn;
      const diffHours = diffMs / (1000 * 60 * 60);
      this.hoursWorked = Math.ceil(diffHours);
    } else {
      // Only check-in, no checkout yet
      this.hoursWorked = 0;
    }

    // Status Rules
   const checkInDate = new Date(this.checkIn);
const localHour = checkInDate.getHours(); 
const time = localHour+12 ;// This should now give you the correct local hour
console.log("Check-in hour (local):", time);

if (this.checkIn) {
  if (this.hoursWorked < 6 && this.checkOut) {
    this.status = "half-day";
  } else if (time >= 10) {
    // Only apply half-day if checkout exists
    this.status = "late";
  } else {
    this.status = "present"; // full day present
  }
} else {
  this.hoursWorked = 0;
  this.status = "absent"; // no check-in
}
  }

  next();
});

 module.exports = mongoose.model("Attendance", attendanceSchema);