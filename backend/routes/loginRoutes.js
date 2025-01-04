const express = require('express');
const { loginUser } = require('../controllers/loginController');

const router = express.Router();

// Log to confirm the route is initialized
console.log('Login route initialized');

// Login route
router.post('/', loginUser);

module.exports = router;
