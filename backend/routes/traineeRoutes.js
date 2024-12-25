const express = require('express');
const router = express.Router();
const { 
  createTrainee, 
  getAllTrainees, 
  updateTrainee, 
  deleteTrainee 
} = require('../controllers/traineeController');
const { 
  authenticateToken, 
  isAdmin, 
  hasTraineeAccess 
} = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Create a new trainee (admin only)
router.post('/', isAdmin, createTrainee);

// Get all trainees (admin only)
router.get('/', isAdmin, getAllTrainees);

// Update a trainee (admin or self)
router.put('/:id', hasTraineeAccess, updateTrainee);

// Delete a trainee (admin only)
router.delete('/:id', isAdmin, deleteTrainee);

module.exports = router;
