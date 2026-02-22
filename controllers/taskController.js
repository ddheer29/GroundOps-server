const Task = require("../models/taskModel");

// @desc    Get all tasks for the logged-in user's organization
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const skip = (page - 1) * limit;

    // SaaS: ONLY return tasks matching User's Organization
    const totalTasks = await Task.countDocuments({
      organization: req.user.organization,
    });
    const tasks = await Task.find({ organization: req.user.organization })
      .populate("assignedTo", "username role")
      .skip(skip)
      .limit(limit);

    res.set("x-total-count", totalTasks);
    res.set("Access-Control-Expose-Headers", "x-total-count");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync a task (Create or Update)
// @route   POST /api/tasks/sync
// @access  Private
const syncTask = async (req, res) => {
  const { operation, data } = req.body;

  if (!data || !data._id) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    // Security: Ensure we don't overwrite another org's task
    // (Ideally, check if exists and matches org, but upsert makes it tricky.
    // Mongoose findByIdAndUpdate with query filter is better).

    const filter = { _id: data._id };
    // If it exists, it MUST belong to my org. If not, I create it with my org.

    // Check if it exists for ANY org first?
    const existing = await Task.findById(data._id);
    if (
      existing &&
      existing.organization.toString() !== req.user.organization.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Cannot modify task from another organization" });
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
      organization: req.user.organization, // Enforce Org ownership
      // If createdBy is missing, maybe set it? For Sync, we might trust the client or set req.user
    };

    const updatedTask = await Task.findByIdAndUpdate(data._id, updateData, {
      new: true,
      upsert: true,
    }).populate("assignedTo", "username role");

    console.log(
      `Synced task: ${updatedTask._id} (${updatedTask.title}) for Org: ${req.user.organization}`,
    );
    res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.organization.toString() !== req.user.organization.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this task" });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or already deleted" });
    }
    res.json({ message: "Task removed", id: taskId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  syncTask,
  deleteTask,
};
