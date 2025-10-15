import User from "../models/User.js";
import Emp  from "../models/EmployeeProfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import EmployeeProfile from '../models/EmployeeProfile.js';
import { sendEmail } from "../utils/mailService.js";
import { emailTemplates } from "../utils/emailTemplates.js";

// User Signup
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      dateOfBirth,
      department,
      position,
      experience,
      education,
      image,
      role,
      status,
    } = req.body;

    // ✅ Only check required fields
    if (!firstName || !lastName || !email || !password || !department || !position) {
      return res.status(400).json({ message: "Please fill all required fields" });  
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      dateOfBirth,
      department,
      position,
      experience,
      education,
      image,
      role,   // will default to Employee if not sent
      status, // will default to PENDING if not sent
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};


// User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Only check in EmployeeProfile because User is deleted after approval
    const employee = await EmployeeProfile.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "User not found or not approved yet" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Build JWT payload
    const payload = {
      id: employee._id,
      role: employee.role,
      email: employee.email,
    };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "30m",
    });

    // Send response without password
    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
         id: employee._id,
    email: employee.email,
    role: employee.role,
    firstName: employee.firstName,
    lastName: employee.lastName,
    phone: employee.phone,
    address: employee.address,
    dateOfBirth: employee.dateOfBirth,
    department: employee.department,
    position: employee.position,
    experience: employee.experience,
    education: employee.education,
    employeeCode: employee.employeeCode,
    image: employee.image,
    status: employee.status,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};


// Approve User (Admin Only)
// Helper to generate unique employee code
const generateEmployeeCode = () => {
  const prefix = "EMP";
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit code
  return `${prefix}${random}`;
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find pending user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already approved
    const existingEmployee = await EmployeeProfile.findOne({ email: user.email });
    if (existingEmployee) {
      return res.status(400).json({ message: "User is already approved as Employee" });
    }

    // Create EmployeeProfile from User
   const employeeProfile = new EmployeeProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      department: user.department,
      position: user.position,
      experience: user.experience,
      education: user.education,
      role: user.role,
      image: user.image,
      employeeCode: generateEmployeeCode(),
      status: "ACTIVE" // approved employee
    });

    await employeeProfile.save();

    // Delete user from pending User collection
    await user.deleteOne();
    
   // Send welcome email to approved employee
    let emailStatus = "Email sent successfully";
    try {
      await sendEmail({
        to: employeeProfile.email,
        subject: "🎉 Welcome to the Company!",
        html: emailTemplates.welcomeEmployee(employeeProfile),
      });
    } catch (emailErr) {
      console.error("Error sending email:", emailErr.message);
      emailStatus = "Employee approved, but email could not be sent.";
    }

    res.status(200).json({
       success: true,
      message: "User approved and added as Employee",
      employeeProfile,
    });

  } catch (err) {
    res.status(500).json({ message: "Error approving user", error: err.message });
  }
};


// Rejected User
// rejectUser Controller
 export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user in pending User collection
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found or already processed" });
    }

    // Delete the pending user (rejected)
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User has been rejected and removed from pending list"
    });

  } catch (err) {
    res.status(500).json({ 
       
      message: "Error rejecting user", 
      error: err.message });
  }
};

// ==================== Forget Password ====================
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ 1. Find user by email
    const user = await Emp.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ 2. Generate JWT reset token (valid for 10 minutes)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // ✅ 3. Try sending the email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px;">
              <h2 style="color: #333; text-align: center;">🔒 Password Reset Request</h2>
              <p style="font-size: 15px; color: #555;">
                Hi ${user.firstName || "there"},<br><br>
                We received a request to reset your password for your EMS account.
                Click the button below to choose a new password:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/reset-password/${token}" 
                   style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
                   Reset Password
                </a>
              </div>

              <p style="font-size: 14px; color: #555;">
                This link will expire in <b>10 minutes</b> for your security.
              </p>
              <p style="font-size: 13px; color: #777;">
                If you didn’t request a password reset, you can safely ignore this email.
              </p>

              <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #888; text-align: center;">
                © ${new Date().getFullYear()} DevRolin EMS System. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      // ✅ 4. Send success response
      res.status(200).json({ message: "Reset email sent successfully" });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.status(500).json({ message: "Failed to send reset email" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== Reset Password ====================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // ✅ Find user by decoded id
    const user = await Emp.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ✅ Update user password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};