# Equestrian Hub

A comprehensive management system for equestrian facilities, handling trainers, trainees, horses, schedules, competitions, and training classes.

## Features

- User Management (Admin, Trainers, Trainees)
- Horse Management
- Schedule Management
- Competition Management
- Training Class Management
- Attendance Tracking
- Performance Monitoring

## Tech Stack

- Backend: Node.js, Express, MongoDB
- Authentication: JWT
- Database: MongoDB with Mongoose ODM

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/login - User login

### Users
- GET /api/trainees - Get all trainees
- POST /api/trainees - Create a trainee
- GET /api/trainers - Get all trainers
- POST /api/trainers - Create a trainer

### Competitions
- GET /api/competitions - Get all competitions
- POST /api/competitions - Create a competition
- PUT /api/competitions/:id - Update a competition
- DELETE /api/competitions/:id - Delete a competition

### Training Classes
- GET /api/training-classes - Get all training classes
- POST /api/training-classes - Create a training class
- PUT /api/training-classes/:id - Update a training class
- DELETE /api/training-classes/:id - Delete a training class
- POST /api/training-classes/:id/enroll - Enroll in a class
- PUT /api/training-classes/:id/sessions/:sessionId - Update session details
- PUT /api/training-classes/:id/sessions/:sessionId/attendance - Update attendance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
