import dotenv from 'dotenv';
dotenv.config();
import multer from "multer";
import connectDB from './config/db.js';
import express from 'express';
import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from './routes/taskRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from "./routes/leaveRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import documentRoutes   from  "./routes/documentRoutes.js";
import cors from "cors";
import { markAbsentsJob } from "./utils/attendanceCron.js";



// ✅ allow requests from your frontend


const app = express();


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
;


// ✅ Start Cron Job

connectDB();

//  Middleware to parse JSON 
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);          // User Routes
app.use("/api/employee", employeeRoutes);   // Employee Routes
app.use('/api/task', taskRoutes);        // Task Routes
app.use('/api/attendance', attendanceRoutes); // Attendance Routes
app.use("/api/leaves", leaveRoutes);      // Leave Routes
app.use("/api/achievements", achievementRoutes); //achievements
app.use("/uploads", express.static("uploads"));   // Serve uploaded files statically (optional)
app.use("/api/documents", documentRoutes);    // documents routes

markAbsentsJob();


const PORT = process.env.PORT || 3000;
// Increase JSON & URL-encoded payload limit

const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 50MB



app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
