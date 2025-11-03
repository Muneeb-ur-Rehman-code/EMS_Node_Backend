import User from "../models/User.js";
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
    console.log(employee.password);
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
