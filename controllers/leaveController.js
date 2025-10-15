import Leave from "../models/Leave.js";
import EmployeeProfile from '../models/EmployeeProfile.js';
import { sendEmail } from "../utils/mailService.js";
import { emailTemplates } from "../utils/emailTemplates.js";

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const { employee, leaveType, startDate, endDate, reason } = req.body;

    const newLeave = new Leave({
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: newLeave,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete Leave by ID
export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLeave = await Leave.findByIdAndDelete(id);

    if (!deletedLeave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    res.status(200).json({ success: true, message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting leave", error: error.message });
  }
};


// Get all leaves
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "firstName lastName email")
      .populate("approver", "firstName lastName email");

    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single leave by ID
// export const getLeaveById = async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id)
//       .populate("employee", "firstName lastName email")
//       .populate("approver", "firstName lastName email");

//     if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

//     res.status(200).json({ success: true, data: leave });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// ✅ Get all leaves by employeeId
export const getLeaveById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const leaves = await Leave.find({ employee: employeeId })
      .populate("employee", "firstName lastName email")
      .populate("approver", "firstName lastName email");
      console.log(employeeId);

    if (!leaves || leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No leaves found for this employee",
      });
    }

    res.status(200).json({
       success: true,
       totalLeaves: leaves.length,  
        data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Approve leave
export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    // Update status
    leave.status = "APPROVED";
    await leave.save();

    let emailStatus = "Email sent successfully";

    try {
      // ✅ Fetch employee details
      const employeeProfile = await EmployeeProfile.findById(leave.employee);
      if (!employeeProfile) {
        emailStatus = "Employee not found, email not sent.";
      } else {
        await sendEmail({
          to: employeeProfile.email,
          subject: "✅ Leave Approved",
          html: emailTemplates.leaveApproved(employeeProfile, leave),
        });
      }
    } catch (emailErr) {
      console.error("Error sending email:", emailErr.message);
      emailStatus = "Leave approved, but email could not be sent.";
    }

    res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      data: leave,
      emailStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Reject leave
export const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    leave.status = "REJECTED";
    // leave.approver = req.body.approver; // approver id
    await leave.save();
    let emailStatus = "Email sent successfully";

    try {
      // ✅ Fetch employee details
      const employeeProfile = await EmployeeProfile.findById(leave.employee);
      if (!employeeProfile) {
        emailStatus = "Employee not found, email not sent.";
      } else {
        await sendEmail({
          to: employeeProfile.email,
          subject: "✅ Leave Approved",
          html: emailTemplates.leaveRejected(employeeProfile, leave),
        });
      }
    } catch (emailErr) {
      console.error("Error sending email:", emailErr.message);
      emailStatus = "Leave approved, but email could not be sent.";
    }


    res.status(200).json({ success: true, message: "Leave rejected", data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel leave
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    leave.status = "CANCELLED";
    await leave.save();

    res.status(200).json({ success: true, message: "Leave cancelled", data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
