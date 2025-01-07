// setupServices.mjs

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// To get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory structure and file contents
const servicesDir = path.join(__dirname, 'src', 'services');

const files = [
  {
    name: 'api.js',
    content: `// src/services/api.js
import axios from 'axios';

// Base URL of your backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Utility Function: Retrieve the stored authentication token
const getStoredAuthToken = () => localStorage.getItem('token');

// Request Interceptor: Attach the token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = getStoredAuthToken();
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    console.log('Request Configuration:', config); // Debugging: Log request configuration
    return config;
  },
  (error) => {
    console.error('Request Error:', error); // Debugging: Log request error
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle unauthorized errors globally
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login on unauthorized
    }
    return Promise.reject(error);
  }
);

// Export the Axios instance and the token retrieval function
export { getStoredAuthToken };
export default api;
`,
  },
  {
    name: 'authApi.js',
    content: `// src/services/authApi.js
import api from './api.js';

// Login Function
export const login = async (credentials) => {
  console.log('Login attempt with:', credentials);
  try {
    console.log('Calling login API endpoint with:', {
      email: credentials.username,
      password: credentials.password,
    });
    const response = await api.post('/login', {
      email: credentials.username,
      password: credentials.password,
    });

    console.log('API Response:', response); // Ensure the response is logged here

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Token saved to localStorage:', response.data.token);
      console.log('User saved to localStorage:', response.data.user);
    }

    return response.data; // Return the entire response data
  } catch (error) {
    console.error('Login error in API service:', error.response || error);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Logout Function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login'; // Optional: Redirect to login after logout
};

// Get Current User Function
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Auth Header Function (if needed elsewhere)
export const authHeader = () => {
  const user = getCurrentUser();
  if (user && user.token) {
    return { Authorization: \`Bearer \${user.token}\` };
  }
  return {};
};
`,
  },
  {
    name: 'trainingClassApi.js',
    content: `// src/services/trainingClassApi.js
import api from './api.js';

export const trainingClassApi = {
  getTrainingClasses: () => api.get('/training-classes'),
  getTrainingClass: (id) => api.get(\`/training-classes/\${id}\`),
  createTrainingClass: (data) => api.post('/training-classes', data),
  updateTrainingClass: (id, data) => api.put(\`/training-classes/\${id}\`, data),
  deleteTrainingClass: (id) => api.delete(\`/training-classes/\${id}\`),
  enrollInClass: (id, data) => api.post(\`/training-classes/\${id}/enroll\`, data),
  updateSessionAttendance: (classId, sessionId, data) =>
    api.put(\`/training-classes/\${classId}/sessions/\${sessionId}/attendance\`, data),
  updateSession: (classId, sessionId, data) =>
    api.put(\`/training-classes/\${classId}/sessions/\${sessionId}\`, data),
};
`,
  },
  {
    name: 'competitionApi.js',
    content: `// src/services/competitionApi.js
import api from './api.js';

export const competitionApi = {
  getCompetitions: () => api.get('/competitions'),
  getCompetition: (id) => api.get(\`/competitions/\${id}\`),
  createCompetition: (data) => api.post('/competitions', data),
  updateCompetition: (id, data) => api.put(\`/competitions/\${id}\`, data),
  deleteCompetition: (id) => api.delete(\`/competitions/\${id}\`),
  registerForCompetition: (id, data) => api.post(\`/competitions/\${id}/register\`, data),
  updateCompetitionResults: (id, data) => api.put(\`/competitions/\${id}/results\`, data),
};
`,
  },
  {
    name: 'traineeApi.js',
    content: `// src/services/traineeApi.js
import api from './api.js';

export const traineeApi = {
  getTrainees: () => api.get('/trainees'),
  getTrainee: (id) => api.get(\`/trainees/\${id}\`),
  createTrainee: (data) => api.post('/trainees', data),
  updateTrainee: (id, data) => api.put(\`/trainees/\${id}\`, data),
  deleteTrainee: (id) => api.delete(\`/trainees/\${id}\`),
};
`,
  },
  {
    name: 'trainerApi.js',
    content: `// src/services/trainerApi.js
import api from './api.js';

export const trainerApi = {
  getTrainers: () => api.get('/trainers'),
  getTrainer: (id) => api.get(\`/trainers/\${id}\`),
  createTrainer: (data) => api.post('/trainers', data),
  updateTrainer: (id, data) => api.put(\`/trainers/\${id}\`, data),
  deleteTrainer: (id) => api.delete(\`/trainers/\${id}\`),
};
`,
  },
  {
    name: 'horseApi.js',
    content: `// src/services/horseApi.js
import api from './api.js';

export const horseApi = {
  getHorses: () => api.get('/horses'),
  getHorseById: (horseId) => api.get(\`/horses/\${horseId}\`),
  createHorse: (horseData) => api.post('/horses', horseData),
  updateHorse: (horseId, horseData) => api.put(\`/horses/\${horseId}\`, horseData),
  deleteHorse: (horseId) => api.delete(\`/horses/\${horseId}\`),
};
`,
  },
  {
    name: 'profileApi.js',
    content: `// src/services/profileApi.js
import api from './api.js';

export const profileApi = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};
`,
  },
  {
    name: 'index.js',
    content: `// src/services/index.js
export { login, logout, getCurrentUser, authHeader } from './authApi.js';
export { trainingClassApi } from './trainingClassApi.js';
export { competitionApi } from './competitionApi.js';
export { traineeApi } from './traineeApi.js';
export { trainerApi } from './trainerApi.js';
export { horseApi } from './horseApi.js';
export { profileApi } from './profileApi.js';
`,
  },
];

// Function to create directories recursively
const createDirectory = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  } catch (error) {
    console.error(`❌ Error creating directory ${dirPath}:`, error);
  }
};

// Function to create a file with content
const createFile = async (filePath, content) => {
  try {
    // Check if file exists
    await fs.access(filePath);
    console.log(`⚠️  File already exists: ${filePath}`);
  } catch {
    // File does not exist, create it
    try {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Created file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error creating file ${filePath}:`, error);
    }
  }
};

// Main function to set up services
const setupServices = async () => {
  try {
    // Create the services directory
    await createDirectory(servicesDir);

    // Iterate over each file and create it
    for (const file of files) {
      const filePath = path.join(servicesDir, file.name);
      await createFile(filePath, file.content);
    }

    console.log('\n🎉 All service files have been set up successfully!');
  } catch (error) {
    console.error('❌ An error occurred while setting up services:', error);
  }
};

// Execute the setup
setupServices();
