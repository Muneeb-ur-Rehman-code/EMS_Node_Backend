import express from "express";
import {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievementController.js";
import { protect,authorizeRoles } from "../middlewares/authmiddlewares.js";

const router = express.Router();


// Achievement Routes
router.post("/",protect,authorizeRoles("Admin","HR"), createAchievement); // Create Achievement
router.get("/",protect, getAllAchievements); // Get All Achievements
router.get("/:employeeId",protect, getAchievementById); // Get Achievement by ID
router.put("/:id",protect,authorizeRoles("Admin","HR"), updateAchievement);   // Update Achievement
router.delete("/:id",protect,authorizeRoles("Admin","HR"), deleteAchievement);  // Delete Achievement

export default router;
