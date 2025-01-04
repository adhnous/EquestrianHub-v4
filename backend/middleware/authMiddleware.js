const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: 'Token expired' });
    }
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

// Middleware to check if user is trainer
const isTrainer = (req, res, next) => {
  if (req.user && (req.user.role === 'trainer' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Trainer access required' });
  }
};

// Middleware to check if user is trainee
const isTrainee = (req, res, next) => {
  if (req.user && (req.user.role === 'trainee' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Trainee access required' });
  }
};

// Middleware to check if user has access to specific trainee data
const hasTraineeAccess = (req, res, next) => {
  if (req.user.role === 'admin' || 
      req.user.role === 'trainer' || 
      (req.user.role === 'trainee' && req.params.id === req.user.userId)) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized access to trainee data' });
  }
};

module.exports = { 
  authenticateToken, 
  isAdmin, 
  isTrainer, 
  isTrainee,
  hasTraineeAccess 
};
