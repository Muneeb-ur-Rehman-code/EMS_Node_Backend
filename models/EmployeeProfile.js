import mongoose from 'mongoose';

const employeeProfileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  department: {
    type: String,
    enum: ["HR", "IT", "Finance", "Marketing", "Sales"], // ✅ only these values allowed
    required: true,
  },
  position: {
    type: String,
    enum: ["Manager", "Team Lead", "Developer", "Designer", "Intern","HR"], // ✅ fixed options
    required: true,
  },
  experience: {
    type: String,
  },
  education: {
    type: String,
  },
  role: {
    type: String,
    enum: ["HR", "Employee", "Admin"], // ✅ new role field
    default: "Employee", // ✅ default is Employee
    required: true,
  },
  employeeCode: { 
    type: String, 
    unique: true, 
    required: true, index: true },
    image: {
    type: String, // Store URL or file path
    // default: "https://via.placeholder.com/150", // default profile picture
  }, // only extra field
  status:    { 
    type: String,
     enum: ['PENDING','ACTIVE','SUSPENDED','TERMINATED'], 
     default: 'PENDING' }
},
  { timestamps: true });

export default mongoose.model('EmployeeProfile', employeeProfileSchema);

// import mongoose from "mongoose";

// const employeeSchema = new mongoose.Schema({
//   firstName: { type: String, required: true, trim: true },
//   lastName: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   phone: { type: String },
//   address: { type: String },
//   dateOfBirth: { type: Date },
//   department: { type: String, enum: ["HR", "IT", "Finance", "Marketing", "Sales"], required: true },
//   position: { type: String, enum: ["Manager", "Team Lead", "Developer", "Designer", "Intern"], required: true },
//   experience: { type: String },
//   education: { type: String },
//   role: { type: String, enum: ["HR", "Employee", "Admin"], default: "Employee", required: true },
//   employeeCode: { type: String, unique: true, required: true, index: true }, // only extra field
//   status: { type: String, enum: ["ACTIVE","INACTIVE"], default: "ACTIVE" }
// }, { timestamps: true });

// export default mongoose.model("Employee", employeeSchema);
