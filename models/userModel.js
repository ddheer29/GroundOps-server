const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String, // Simplified for this demo, usually JWT generated on fly
  },
  organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
  },
  role: {
      type: String,
      enum: ['Admin', 'Manager', 'FieldAgent'],
      default: 'FieldAgent'
  },
  status: {
      type: String,
      enum: ['Active', 'Pending', 'Invited'],
      default: 'Active'
  },
  inviteToken: String,
  inviteExpires: Date
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
