const express = require('express');
const {
  createTrainingClass,
  getTrainingClasses,
  getTrainingClass,
  updateTrainingClass,
  enrollInClass,
  updateSessionAttendance,
  updateSession,
  deleteTrainingClass
} = require('../controllers/trainingClassController');
const { authenticateToken } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes (still need authentication)
router.get('/', authenticateToken, getTrainingClasses);
router.get('/:id', authenticateToken, getTrainingClass);

// Protected routes - Admin and Trainer only
router.post('/', authenticateToken, authorizeRoles('admin', 'trainer'), createTrainingClass);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), updateTrainingClass);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), deleteTrainingClass);

// Session management routes
router.put('/:id/sessions/:sessionId', authenticateToken, authorizeRoles('admin', 'trainer'), updateSession);
router.put('/:id/sessions/:sessionId/attendance', authenticateToken, authorizeRoles('admin', 'trainer'), updateSessionAttendance);

// Enrollment route - Trainee, Trainer, and Admin
router.post('/:id/enroll', authenticateToken, authorizeRoles('admin', 'trainer', 'trainee'), enrollInClass);

module.exports = router;
