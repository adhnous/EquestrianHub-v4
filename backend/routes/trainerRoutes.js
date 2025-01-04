const express = require('express');
const {
  createTrainer,
  getAllTrainers,
  deleteTrainer,
  updateTrainer, // Ensure updateTrainer is imported here
} = require('../controllers/trainerController'); // Ensure the path points to trainerController.js

const { authenticateToken } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes for managing trainers
router.post('/', authenticateToken, authorizeRoles('admin'), createTrainer);
router.get('/', authenticateToken, getAllTrainers);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteTrainer);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateTrainer); // Correct usage of updateTrainer

module.exports = router;
