import  Attendance from "../models/Attendance.js";
import mongoose from "mongoose";

// Employee Check-In
export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if already checked in
    let attendance = await Attendance.findOne({ employeeId, date: dateOnly });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: "Already checked in today." });
    }
      
    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        date: dateOnly,
        checkIn: today,
      });
    } else {
      attendance.checkIn = today;
    }

    await attendance.save();
    res.status(200).json({ message: "Check-in successful", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error during check-in", error: error.message });
  }
};

// ✅ Employee Check-Out
export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = new Date();
    
    //const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
     
     const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    console.log("Attendance record found:", todayDate);
    let attendance = await Attendance.findOne({ employeeId,date:todayDate });
    

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "Cannot check out without check-in." });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out today." });
    }

    attendance.checkOut = today;
    await attendance.save();

    res.status(200).json({ message: "Check-out successful", attendance });
  } catch (error) {
    res.status(500).json({ message: "Error during check-out", error: error.message });
  }
};



// ✅ Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      req.body, // fields to update (checkIn, checkOut, status, etc.)
      { new: true, runValidators: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAttendance = await Attendance.findByIdAndDelete(id);

    if (!deletedAttendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
      data: deletedAttendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all attendance records
export const getAllattendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("employeeId", "firstName lastName email department");
    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

// Get attendance by employeeId
export const getAttendanceById = async (req, res) => {
  try {
    const { Id } = req.params; // employee ID from params

    if (!Id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Fetch all attendance records for this employee
    const attendance = await Attendance.find({ employeeId: Id })
      .populate("employeeId", "firstName lastName email department");

    if (!attendance || attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attendance record found for this employee",
      });
    }

    // Total attendance records
    const totalDays = attendance.length;

    // Count how many are "present"
    const presentDays = attendance.filter((rec) => rec.status === "present").length;

    // Attendance percentage
    const percentage = ((presentDays / totalDays) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      employee: attendance[0].employeeId, // basic employee details
      totalDays,
      presentDays,
      percentage: `${percentage}%`,
      records: attendance, // full attendance list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching attendance by ID",
      error: error.message,
    });
  }
};

// Get attendance summary


// 📌 1. Daily Attendance Summary for Admin
export const getDailySummary = async (req, res) => {
  try {
    const { date } = req.query; // e.g., "2025-09-06"

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Convert to start and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format response
    const result = {
      present: 0,
      late: 0,
      "half-day": 0,
      absent: 0,
    };
    summary.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json({ success: true, date, summary: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📌 2. Monthly Attendance Summary for One Employee
export const getMonthlySummary = async (req, res) => {
  try {
    const { employeeId, year, month } = req.query;
    if (!employeeId || !year || !month) {
      return res.status(400).json({ message: "employeeId, year, and month are required" });
    }

    // Convert month/year into date range
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const summary = await Attendance.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(employeeId),
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format response
    const result = {
      present: 0,
      late: 0,
      "half-day": 0,
      absent: 0,
    };
    summary.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json({ success: true, employeeId, month, year, summary: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

