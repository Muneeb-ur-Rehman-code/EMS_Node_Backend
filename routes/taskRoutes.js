import express from 'express';
import { createTask, getAllTasks,getTaskById, updateTask,deleteTask } from '../controllers/taskController.js';
import { protect,authorizeRoles } from "../middlewares/authmiddlewares.js";

const router = express.Router();

// Task Routes
router.post('/createTasks',protect,authorizeRoles("Admin","HR"), createTask); // Create task route
router.get('/allTasks',protect, getAllTasks);   // get allTasks route
router.get('/:id',protect, getTaskById);         // Get task by ID route
router.put("/:id",protect, updateTask);            //  Update task
router.delete("/:id",protect,authorizeRoles("Admin","HR"), deleteTask);        //Delete task

export default router;


