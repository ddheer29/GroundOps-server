const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Task = require('./models/taskModel'); // To seed data

dotenv.config();

// connectDB(); // Removed immediate call

const app = express();
// ... keeping middle part ...
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, async () => {
        await seedData();
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
const Organization = require('./models/organizationModel'); // New Model
const User = require('./models/userModel');

// Routes
app.post('/api/auth/login', authController.loginUser);
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/invite', protect, authController.inviteUser); // Protected
app.post('/api/auth/set-password', authController.setPassword); // Public
app.get('/api/tasks', protect, taskController.getTasks); // Protected
app.post('/api/tasks/sync', protect, taskController.syncTask); // Protected
app.get('/api/users', protect, userController.getUsers); // Protected

// Root
app.get('/', (req, res) => {
  res.send('GroundOps SaaS Backend is running...');
});

// SaaS Seeder
const seedData = async () => {
    // 1. Ensure Default Organization exists
    let org = await Organization.findOne({ name: 'Default Tech Corp' });
    if (!org) {
        console.log('Seeding Default Organization...');
        org = await Organization.create({
            name: 'Default Tech Corp',
            subscriptionPlan: 'Pro',
            subscriptionStatus: 'Active'
        });
    }

    // 2. Ensure User exists and is linked to Org
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        console.log('Seeding initial user...');
        const user = await User.create({
            username: 'tech',
            password: 'password123', 
            organization: org._id,
            role: 'FieldAgent'
        });
        console.log('User seeded: tech / password123');
    }
    
    // We need a user reference for tasks (optional but good practice)
    const techUser = await User.findOne({ username: 'tech' });

    // 3. Ensure Tasks exist and are linked to Org
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
        console.log('Seeding initial tasks...');
        await Task.create([
            {
                _id: 't1',
                title: 'AC repair – Sector 18',
                description: 'Customer reported cooling issue. Check gas level.',
                location: 'Sector 18, Noida',
                status: 'Pending',
                priority: 'High',
                organization: org._id,
                assignedTo: techUser ? techUser._id : null
            },
            {
                _id: 't2',
                title: 'Electric meter inspection – Rohini',
                description: 'Monthly scheduled inspection.',
                location: 'Rohini, Delhi',
                status: 'Pending',
                priority: 'Normal',
                organization: org._id,
                assignedTo: techUser ? techUser._id : null
            }
        ]);
        console.log('Tasks seeded.');
    }
};

// Server started after DB connection above
