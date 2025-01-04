import axios from 'axios';

// Retrieve the stored authentication token
const getStoredAuthToken = () => localStorage.getItem('token');

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Ensure this matches your backend setup
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Authorization Header
api.interceptors.request.use(
  (config) => {
    const token = getStoredAuthToken(); // Use getStoredAuthToken instead of getAuthToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request Configuration:', config); // Debugging: Log request configuration
    return config;
  },
  (error) => {
    console.error('Request Error:', error); // Debugging: Log request error
    return Promise.reject(error);
  }
);


// Add a response interceptor to handle auth errors
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
// const login = async (credentials) => {
//   console.log('Login attempt with:', credentials);
//   try {
//     const response = await api.post('/login', {
//       email: credentials.username,
//       password: credentials.password,
//     });

//     console.log('API Response:', response.data); // Debug log full data

//     if (response.data.success && response.data.token) {
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       console.log('Token saved to localStorage:', response.data.token);
//       console.log('User saved to localStorage:', response.data.user);
//     }

//     return response.data;
//   } catch (error) {
//     console.error('Login error:', error);
//     throw error;
//   }
// };
const login = async (credentials) => {
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
    return response; // Ensure the entire response is returned
  } catch (error) {
    console.error('Login error in API service:', error.response || error);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Training Class endpoints
const getTrainingClasses = () => api.get('/training-classes');
const getTrainingClass = (id) => api.get(`/training-classes/${id}`);
const createTrainingClass = (data) => api.post('/training-classes', data);
const updateTrainingClass = (id, data) => api.put(`/training-classes/${id}`, data);
const deleteTrainingClass = (id) => api.delete(`/training-classes/${id}`);
const enrollInClass = (id, data) => api.post(`/training-classes/${id}/enroll`, data);
const updateSessionAttendance = (classId, sessionId, data) =>
  api.put(`/training-classes/${classId}/sessions/${sessionId}/attendance`, data);
const updateSession = (classId, sessionId, data) =>
  api.put(`/training-classes/${classId}/sessions/${sessionId}`, data);

// Competition endpoints
const getCompetitions = () => api.get('/competitions');
const getCompetition = (id) => api.get(`/competitions/${id}`);
const createCompetition = (data) => api.post('/competitions', data);
const updateCompetition = (id, data) => api.put(`/competitions/${id}`, data);
const deleteCompetition = (id) => api.delete(`/competitions/${id}`);
const registerForCompetition = (id, data) => api.post(`/competitions/${id}/register`, data);
const updateCompetitionResults = (id, data) => api.put(`/competitions/${id}/results`, data);

// User endpoints
const getTrainees = () => api.get('/trainees');
const getTrainee = (id) => api.get(`/trainees/${id}`);
const createTrainee = (data) => api.post('/trainees', data);
const updateTrainee = (id, data) => api.put(`/trainees/${id}`, data);
const deleteTrainee = (id) => api.delete(`/trainees/${id}`);

// Trainer endpoints
const getTrainers = () => api.get('/trainers');
const getTrainer = (id) => api.get(`/trainers/${id}`);
const createTrainer = (data) => api.post('/trainers', data);
const updateTrainer = (id, data) => api.put(`/trainers/${id}`, data);
const deleteTrainer = (id) => api.delete(`/trainers/${id}`);

// Horse endpoints - CRUD operations
const getHorses = async () => {
  try {
    const response = await api.get('/horses'); // Use `api` instance
    console.log('API Response:', response.data); // Debug log full data
    return response.data.data; // Extract and return the `data` array
  } catch (error) {
    console.error('Error fetching horses:', error);
    throw error;
  }
};

const fetchHorseById = async (horseId) => {
  try {
    const { data } = await api.get(`/horses/${horseId}`);
    return data;
  } catch (error) {
    console.error('Error fetching horse:', error);
    throw error;
  }
};

const createHorse = async (horseData) => {
  try {
    const { data } = await api.post('/horses', horseData);
    return data;
  } catch (error) {
    console.error('Error creating horse:', error);
    throw error;
  }
};

const updateHorseById = async (horseId, horseData) => {
  try {
    const response = await api.put(`/horses/${horseId}`, horseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteHorseById = async (horseId) => {
  try {
    const response = await api.delete(`/horses/${horseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting horse ${horseId}:`, error);
    throw error;
  }
};

// Export CRUD operations

// Profile endpoints
const getProfile = () => api.get('/auth/profile');
const updateProfile = (data) => api.put('/auth/profile', data);
const changePassword = (data) => api.post('/auth/change-password', data);

export {
  login,
  logout,
  getTrainingClasses,
  getTrainingClass,
  createTrainingClass,
  updateTrainingClass,
  deleteTrainingClass,
  enrollInClass,
  updateSessionAttendance,
  updateSession,
  getCompetitions,
  getCompetition,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  registerForCompetition,
  updateCompetitionResults,
  getTrainees,
  getTrainee,
  createTrainee,
  updateTrainee,
  deleteTrainee,
  getTrainers,
  getTrainer,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getHorses,
  createHorse,
  fetchHorseById,
  updateHorseById,
  deleteHorseById,  
  getProfile,
  updateProfile,
  changePassword,
 getStoredAuthToken
};

export default api;