import Achievement from "../models/achievement.js";
import mongoose from "mongoose";


// ➝ Create Achievement
export const createAchievement = async (req, res) => {
  try {
    const { user, title, body } = req.body;

    const achievement = new Achievement({ user, title, body });
    await achievement.save();

    res.status(201).json({
      success: true,
      message: "Achievement created successfully",
      data: achievement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➝ Get All Achievements
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().populate("user", "firstName lastName email");
    console.log(achievements)
    res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➝ Get Achievement by ID
// export const getAchievementById = async (req, res) => {
//   try {
//     const achievement = await Achievement.findById(req.params.id).populate("user", "firstName lastName email");
//     console.log(achievement.user)
//     if (!achievement) {
//       return res.status(404).json({ success: false, message: "Achievement not found" });
//     }
//     res.status(200).json({ success: true, data: achievement });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const getAchievementById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 1. Check if param exists
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // 2. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Employee ID format",
      });
    }

    // 3. Fetch achievements
    const achievements = await Achievement.find({ user: employeeId })
      .populate("user", "firstName lastName email");

    // 4. Handle empty result
    if (!achievements || achievements.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No achievements found for this employee",
      });
    }

    // 5. Success
    res.status(200).json({
      success: true,
      totalAchievements: achievements.length,
      data: achievements,
    });
  } catch (error) {
    console.error("❌ Error in getAchievementById:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching achievements",
      error: error.message,
    });
  }
};




// ➝ Update Achievement
export const updateAchievement = async (req, res) => {
  try {
    const { title, body } = req.body;

    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { title, body },
      { new: true }
    );

    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }

    res.status(200).json({ success: true, message: "Achievement updated", data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➝ Delete Achievement
export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }
    res.status(200).json({ success: true, message: "Achievement deleted", data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
