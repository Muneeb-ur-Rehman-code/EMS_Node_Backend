import express from "express";
import { getAllEmployees,getEmployeeById,updateEmployee,deleteEmployee } from "../controllers/employeeController.js";
import { protect,authorizeRoles } from "../middlewares/authmiddlewares.js";


const router = express.Router();

// Routes
router.get("/", protect, authorizeRoles("Employee","HR", "Admin"),getAllEmployees);
router.get("/:id",protect, authorizeRoles("Employee","HR", "Admin"), getEmployeeById);

// PUT /api/employees/:id → update employee
router.put("/:id", updateEmployee);

// DELETE /api/employees/:id → delete employee
router.delete("/:id", deleteEmployee);



export default router;
