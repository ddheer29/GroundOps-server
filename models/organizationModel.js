const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subscriptionPlan: {
      type: String, 
      enum: ['Basic', 'Pro', 'Enterprise'],
      default: 'Basic'
  },
  subscriptionStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Grace'],
      default: 'Active'
  },
  owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true // Can be circular on creation, handled in controller
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Organization', organizationSchema);
