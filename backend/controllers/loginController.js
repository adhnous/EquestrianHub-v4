const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');

const loginUser = async (req, res) => {
  try {
    console.log('Login attempt details:', {
      email: req.body.email,
      passwordProvided: !!req.body.password
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('User search result:', {
      found: !!user,
      email: user?.email,
      role: user?.role
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password using the model's method
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password validation:', {
      isValid: isPasswordValid,
      providedPassword: password
    });

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create and sign JWT token
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    console.log('Creating token with payload:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token created successfully');

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

module.exports = { loginUser };
