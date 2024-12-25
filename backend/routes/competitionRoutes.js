const express = require('express');
const {
  createCompetition,
  getCompetitions,
  getCompetition,
  updateCompetition,
  deleteCompetition,
  registerForCompetition,
  updateResults
} = require('../controllers/competitionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes (still need authentication)
router.get('/', authenticateToken, getCompetitions);
router.get('/:id', authenticateToken, getCompetition);

// Protected routes - Admin and Trainer only
router.post('/', authenticateToken, authorizeRoles('admin', 'trainer'), createCompetition);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), updateCompetition);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteCompetition);

// Registration route - Trainee, Trainer, and Admin
router.post('/:id/register', authenticateToken, authorizeRoles('admin', 'trainer', 'trainee'), registerForCompetition);

// Results route - Judges (Trainers) and Admin only
router.put('/:id/results', authenticateToken, authorizeRoles('admin', 'trainer'), updateResults);

module.exports = router;