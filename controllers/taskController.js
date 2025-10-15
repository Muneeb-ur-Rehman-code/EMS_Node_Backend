import Task from '../models/Task.js';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, createdBy, priority, dueDate, assignTo } = req.body;

    // Validate required fields
    if (!title || !createdBy || !assignTo) {
      return res.status(400).json({ message: 'Title, createdBy, and assignTo are required.' });
    }

    const newTask = new Task({
      title,
      description,
      createdBy: req.user._id, // Use the authenticated user's ID 
      priority,
      dueDate,
      assignTo,
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




//  Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'firstName lastName email')   // get creator details
      .populate('assignTo', 'firstName lastName email'); // get assigned employee details

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



// ✅ Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.find({assignTo:id})
      .populate('createdBy', 'firstName lastName email')   // show user details
      .populate('assignTo', 'firstName lastName email');   // show employee details

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
    
  

// ✅ Update Task by ID
// ✅ Update Task by ID (Employee can only update status)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Task find karo
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Agar employee hai (not Admin/HR), to sirf apne task ka status update kar sakta hai
    if (req.user.role === "Employee") {
      if (task.assignTo.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this task" });
      }

      // Employee sirf status update kar sake
      task.status = req.body.status || task.status;
    } else {
      // Admin / HR ko full update rights hain
      Object.assign(task, req.body);
    }

    const updatedTask = await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

// ✅ Delete Task by ID
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};


