// import cron from "node-cron";
// import Attendance from "../models/Attendance.js";
// import Employee from "../models/EmployeeProfile.js";

// export const markAbsentsJob = () => {
//   // Run every day at 11:50 AM Pakistan time
//   cron.schedule(
//     "15 12 * * *", // cron expression
//     async () => {
//       try {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const employees = await Employee.find();

//         for (const emp of employees) {
//           const existing = await Attendance.findOne({
//             employeeId: emp._id,
//             date: today,
//           });

//           if (!existing) {
//             await Attendance.create({
//               employeeId: emp._id,
//               date: today,
//               status: "absent",
//             });
//           }
//         }

//         console.log("✅ Absentees marked at 11:11 AM");
//       } catch (err) {
//         console.error("❌ Error in absent marking:", err.message);
//       }
//     },
//     {
//       timezone: "Asia/Karachi", // ✅ correct place for options
//     }
//   );
// };
import cron from "node-cron";
import Attendance from "../models/Attendance.js";
import Employee from "../models/EmployeeProfile.js";

export const markAbsentsJob = () => {
  // Run every day at 12:15 PM Pakistan time
  cron.schedule(
    "11 11 * * *", // cron expression
    async () => {
      try {
        // Today range (00:00 - 23:59)
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const employees = await Employee.find();

        for (const emp of employees) {
          const existing = await Attendance.findOne({
            employeeId: emp._id,
            date: { $gte: start, $lte: end }, // ✅ check if today's attendance already exists
          });

          if (!existing) {
            await Attendance.create({
              employeeId: emp._id,
              date: start, // ✅ always save today's date at midnight
              status: "absent",
            });
          }
        }

        console.log("✅ Absentees marked for", start.toDateString());
      } catch (err) {
        console.error("❌ Error in absent marking:", err.message);
      }
    },
    {
      timezone: "Asia/Karachi",
    }
  );
};
