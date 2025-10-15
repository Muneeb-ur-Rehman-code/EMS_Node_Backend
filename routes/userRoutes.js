import express from "express";
import { registerUser,
     loginUser,
      getAllUsers,
      approveUser,
      rejectUser,
    forgetPassword,
    resetPassword
 } from "../controllers/userController.js";
import { protect,authorizeRoles } from "../middlewares/authmiddlewares.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

// Routes
router.post("/signup",upload.single("image"), registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
 router.post("/approve/:userId", approveUser)
 router.post("/reject/:userId",protect, authorizeRoles("Admin","HR"), rejectUser);
 router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);


export default router;
