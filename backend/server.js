require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Import routes
const loginRoutes = require('./routes/loginRoutes');
const traineeRoutes = require('./routes/traineeRoutes');
const trainerRoutes = require('./routes/trainerRoutes'); // Added this line
const horseRoutes = require('./routes/horseRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const competitionRoutes = require('./routes/competitionRoutes'); // Added this line
const trainingClassRoutes = require('./routes/trainingClassRoutes');  // Added this line

// Connect to MongoDB
const connectDB = require('./config/db');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Debug logging for requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test routes - no authentication required
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test login endpoint
app.post('/api/test', async (req, res) => {
  const { email, password } = req.body;
  console.log('Test login attempt:', { email });

  try {
    // For testing purposes only
    if (email === 'admin@equestrianhub.com' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 'test-admin-id', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        success: true,
        message: 'Test login successful',
        token,
        user: {
          id: 'test-admin-id',
          email,
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during test login'
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/login', loginRoutes);
app.use('/api/trainees', traineeRoutes);  // Using plural form consistently
app.use('/api/trainers', trainerRoutes);  // Using plural form consistently
app.use('/api/horses', horseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/competitions', competitionRoutes);  // Added competition routes
app.use('/api/training-classes', trainingClassRoutes);  // Added this line

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`
  });
});

const port = process.env.PORT || 5000;

// Start server only after connecting to MongoDB
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Test endpoints:`);
      console.log(`  GET  http://localhost:${port}/api/test`);
      console.log(`  POST http://localhost:${port}/api/test`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
