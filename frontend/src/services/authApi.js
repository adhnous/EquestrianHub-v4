// src/services/authApi.js
import api from './api';

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
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};
