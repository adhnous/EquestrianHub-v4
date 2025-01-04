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

// GET /api/trainees
router.get('/', async (req, res) => {
  try {
    // Return mock data for now
    const trainees = [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321' },
    ];

    res.json({
      success: true,
      data: trainees
    });
  } catch (error) {
    console.error('Error fetching trainees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainees',
      error: error.message
    });
  }
});

module.exports = router;
