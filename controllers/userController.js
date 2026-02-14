const User = require('../models/userModel');

// @desc    Get all users for the organization
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ organization: req.user.organization }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers };
