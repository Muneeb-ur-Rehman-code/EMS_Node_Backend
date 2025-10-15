import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // ✅ load .env file

const transporter = nodemailer.createTransport({
  service: "gmail", // or "outlook", "yahoo", etc. (depends on what you use)
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password (not normal password!)
  },
});

export default transporter;
