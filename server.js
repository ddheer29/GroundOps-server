const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


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

app.use(cors({
    origin: true, // Allow any origin that sends the request (Reflects Origin)
    credentials: true
}));

// app.options('*', cors()); // Removed: app.use(cors()) handles preflight automatically
app.use(express.json());

const taskController = require('./controllers/taskController');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

const { protect } = require('./middleware/authMiddleware');


// Routes
app.post('/api/auth/login', authController.loginUser);
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/invite', protect, authController.inviteUser); // Protected
app.post('/api/auth/set-password', authController.setPassword); // Public
app.get('/api/tasks', protect, taskController.getTasks); // Protected
app.post('/api/tasks/sync', protect, taskController.syncTask); // Protected
app.delete('/api/tasks/:id', protect, taskController.deleteTask); // Protected
app.get('/api/users', protect, userController.getUsers); // Protected

// Root
app.get('/', (req, res) => {
  res.send('GroundOps SaaS Backend is running...');
});



// Server started after DB connection above
