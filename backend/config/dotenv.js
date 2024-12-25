const dotenv = require('dotenv');

// Load environment variables from .env file in the backend root
dotenv.config();

module.exports = {
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};
