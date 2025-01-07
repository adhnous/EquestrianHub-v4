// src/services/index.js
export { login, logout, getCurrentUser, authHeader } from './authApi';

export {
  getTrainingClasses,
  getTrainingClass,
  createTrainingClass,
  updateTrainingClass,
  deleteTrainingClass,
  enrollInClass,
  updateSessionAttendance,
  updateSession,
} from './trainingClassApi';

export {
  getTrainers,
  getTrainer,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from './trainerApi';

export {
  getCompetitions,
  getCompetition,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  registerForCompetition,
  updateCompetitionResults,
} from './competitionApi';

export {
  getTrainees,
  getTrainee,
  createTrainee,
  updateTrainee,
  deleteTrainee,
} from './traineeApi';

export { 
  getHorses, 
  getHorseById, 
  createHorse, 
  updateHorse, 
  deleteHorse 
} from './horseApi';

export { profileApi } from './profileApi';
export { getStoredAuthToken } from './api'; // Ensure this is present if needed elsewhere
