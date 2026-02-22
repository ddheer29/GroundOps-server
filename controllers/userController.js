const User = require("../models/userModel");

// @desc    Get all users for the organization
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      organization: req.user.organization,
    }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.dob = req.body.dob || user.dob;
    user.joiningDate = req.body.joiningDate || user.joiningDate;
    if (req.body.isOnLeave !== undefined) {
      user.isOnLeave = req.body.isOnLeave;
    }
    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePhoto) {
      user.profilePhoto = req.body.profilePhoto;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      name: updatedUser.name,
      dob: updatedUser.dob,
      joiningDate: updatedUser.joiningDate,
      isOnLeave: updatedUser.isOnLeave,
      profilePhoto: updatedUser.profilePhoto,
      organization: updatedUser.organization,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

module.exports = { getUsers, updateUserProfile };
