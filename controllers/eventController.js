const Event = require("../models/eventModel");

// @desc    Get all events for the logged-in user
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id });

    // Respond exactly with what they requested (Mongoose returns _id correctly)
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new personal event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const { title, description, start, end, color } = req.body;

    const newEvent = new Event({
      title,
      description,
      start,
      end,
      color,
      user: req.user._id, // Enforce personal events only
    });

    const savedEvent = await newEvent.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a personal event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, start, end, color } = req.body;

    // Verify ownership
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this event" });
    }

    // Update
    event.title = title || event.title;
    event.description =
      description !== undefined ? description : event.description;
    event.start = start || event.start;
    event.end = end || event.end;
    event.color = color || event.color;

    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(eventId);

    res.json({ message: "Event removed", id: eventId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
