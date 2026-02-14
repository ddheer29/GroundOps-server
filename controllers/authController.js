const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ username });

      if (user && user.password === password) {
          res.json({
              _id: user.id,
              username: user.username,
              role: user.role,
              organization: user.organization,
              token: generateToken(user._id),
          });
      } else {
          res.status(401).json({ message: 'Invalid credentials' });
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new Organization and Admin User
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, password, orgName } = req.body;

    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Create Organization
        const org = await Organization.create({
            name: orgName,
            subscriptionPlan: 'Basic',
            subscriptionStatus: 'Active'
        });

        // 3. Create User
        const user = await User.create({
            username,
            password, // In prod, hash this!
            organization: org._id,
            role: 'Admin'
        });

        // 4. Link org owner (optional circular ref)
        // org.owner = user._id; await org.save();

        res.status(201).json({
            _id: user.id,
            username: user.username,
            role: user.role,
            organization: user.organization,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendEmail = require('../utils/sendEmail');

// @desc    Invite a new user (Admin/Manager only)
// @route   POST /api/auth/invite
// @access  Private
const inviteUser = async (req, res) => {
    const { email, name, role } = req.body; // email is username for us

    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ username: email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Generate Token
        // Using random hex string for invite token
        const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // 3. Create User in "Invited" status
        const user = await User.create({
            username: email,
            password: 'temp_placeholder_password', // Should be unusable
            organization: req.user.organization,
            role: role || 'FieldAgent',
            status: 'Invited',
            inviteToken,
            inviteExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });
        console.log("User created:", user);

        // 4. Send Email
        const inviteLink = `http://localhost:5173/set-password?token=${inviteToken}`;
        const message = `
          You have been invited to join GroundOps as a ${role}.
          Please click the link below to set your password and login:
          
          ${inviteLink}
        `;

        try {
            await sendEmail({
                email: user.username,
                subject: 'GroundOps Invitation',
                message,
            });
            res.status(201).json({ message: 'Invitation email sent' });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            user.inviteToken = undefined;
            user.inviteExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } catch (error) {
        console.error("Error inviting user:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set password for invited user
// @route   POST /api/auth/set-password
// @access  Public
const setPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({ 
            inviteToken: token,
            inviteExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = password; // In prod, hash this
        user.inviteToken = undefined;
        user.inviteExpires = undefined;
        user.status = 'Active';
        await user.save();

        res.json({ 
            success: true, 
            token: generateToken(user._id),
            user: {
                _id: user.id,
                username: user.username,
                role: user.role,
                organization: user.organization
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, inviteUser, setPassword };

