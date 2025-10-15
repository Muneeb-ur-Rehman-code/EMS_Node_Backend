import jwt from "jsonwebtoken";
import EmployeeProfile from "../models/EmployeeProfile.js"; // adjust path


export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Find user ONLY in EmployeeProfile
      req.user = await EmployeeProfile.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found or not approved" });
      }

      next();
    } catch (error) {
      console.error("❌ Protect middleware error:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


// middleware/authMiddleware.js

// ✅ Role-based authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};
