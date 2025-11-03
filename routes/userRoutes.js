import express from "express";
import { registerUser, loginUser, getAllUsers,approveUser,rejectUser } from "../controllers/userController.js";
import { protect,authorizeRoles } from "../middlewares/authmiddlewares.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

// Routes
router.post("/signup",upload.single("image"), registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
 router.post("/approve/:userId", approveUser)
 router.post("/reject/:userId",protect, rejectUser);

// authorizeRoles("Admin","HR")
export default router;
