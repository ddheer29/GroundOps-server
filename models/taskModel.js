const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  // We can use a custom _id if we want to sync exact string IDs from client to server easy, 
  // or just let Mongo generate it and we map it. 
  // For Sync ease, let's allow custom strings if passed, or default to ObjectId.
  _id: { type: String, required: true }, 
  title: { type: String, required: true },
  description: String,
  location: String,
  status: { 
      type: String, 
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
  },
  priority: {
      type: String,
      default: 'Normal'
  },
  notes: String,
  attachments: [String],
  organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
  },
  assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  updatedAt: {
      type: Date,
      default: Date.now
  }
}, {
  _id: false, // Important so Mongoose doesn't overwrite our string _id with an ObjectId
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
