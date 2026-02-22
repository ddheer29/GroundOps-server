const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");

dotenv.config();

// connectDB(); // Removed immediate call

const app = express();
// ... keeping middle part ...
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
  });
});

app.use(
  cors({
    origin: true, // Allow any origin that sends the request (Reflects Origin)
    credentials: true,
  }),
);

// app.options('*', cors()); // Removed: app.use(cors()) handles preflight automatically
app.use(express.json());

const taskController = require("./controllers/taskController");
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");
const eventController = require("./controllers/eventController");

const { protect } = require("./middleware/authMiddleware");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only!");
    }
  },
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Routes
app.post("/api/auth/login", authController.loginUser);
app.post("/api/auth/register", authController.registerUser);
app.post("/api/auth/invite", protect, authController.inviteUser); // Protected
app.post("/api/auth/set-password", authController.setPassword); // Public
app.get("/api/tasks", protect, taskController.getTasks); // Protected
app.post("/api/tasks/sync", protect, taskController.syncTask); // Protected
app.delete("/api/tasks/:id", protect, taskController.deleteTask); // Protected
app.get("/api/users", protect, userController.getUsers); // Protected
app.put(
  "/api/users/profile",
  protect,
  upload.single("profilePhoto"),
  userController.updateUserProfile,
); // Protected

app.get("/api/events", protect, eventController.getEvents);
app.post("/api/events", protect, eventController.createEvent);
app.put("/api/events/:id", protect, eventController.updateEvent);
app.delete("/api/events/:id", protect, eventController.deleteEvent);

// Root
app.get("/", (req, res) => {
  res.send("GroundOps SaaS Backend is running...");
});

// Server started after DB connection above
