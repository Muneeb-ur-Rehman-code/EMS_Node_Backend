import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';

// DB connection
import connectDB from './config/db.js';

// Routes
import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from './routes/taskRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from "./routes/leaveRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

// Cron Job
import { markAbsentsJob } from "./utils/attendanceCron.js";

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ File upload setup (50 MB)
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// ✅ Static folder
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/employee", employeeRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/documents", documentRoutes);

// ✅ Port config
const PORT = process.env.PORT || 3000;

// ✅ Connect DB first, then start server
const startServer = async () => {
  try {
    await connectDB();
    markAbsentsJob();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// ✅ Handle unexpected rejections & crashes
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

// ✅ Run server
startServer();
