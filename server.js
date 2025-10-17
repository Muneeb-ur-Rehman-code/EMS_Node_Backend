import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import { markAbsentsJob } from "./utils/attendanceCron.js";

const app = express();

// ✅ Step 1: Configure CORS properly
const allowedOrigins = [
  "https://emsdevrolin.netlify.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Step 2: Explicitly handle OPTIONS preflight requests
app.options("*", cors());

// ✅ Step 3: Parse JSON before routes
app.use(express.json());

// ✅ Step 4: Connect DB
connectDB();

// ✅ Step 5: Routes
app.use("/api/users", userRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/documents", documentRoutes);
app.use("/uploads", express.static("uploads"));

markAbsentsJob();

// ✅ Step 6: Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
