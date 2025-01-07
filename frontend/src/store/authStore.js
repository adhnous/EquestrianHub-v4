// src/store/authStore.js
import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout } from '../services/authApi'; // Correct imports from authApi.js
import { getStoredAuthToken } from '../services/api'; // Import getStoredAuthToken separately from api.js

// Try to get existing auth data with error handling for malformed localStorage data
const storedToken = getStoredAuthToken(); // Using the imported getStoredAuthToken
const storedUser = (() => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse stored user from localStorage:', error);
    return null;
  }
})();

const useAuthStore = create((set) => ({
  user: storedUser,
  token: storedToken || null,
  isAuthenticated: !!(storedToken && storedUser),
  isLoading: false,
  error: null,

  /**
   * Logs in a user with the given credentials.
   *
   * @param {Object} credentials - Object with 'username' and 'password' properties.
   * @returns {Promise<Object>} - Resolves with the response data from the server.
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiLogin(credentials);
      console.log('Full Response:', response);
      console.log('Full API Response:', response.data);

      // Validate response structure
      if (!response) {
        console.error("Validation failed. Response data does not match expected structure:", response);
        throw new Error('Invalid response structure from server');
      }

      const { success, token, user } = response;

      // Validate response data
      if (!success || !token || !user) {
        throw new Error('Invalid response structure from server');
      }

      // Save user data to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return response.data;
    } catch (error) {
      console.error('Login error:', error);

      // Remove user data from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'An error occurred during login',
      });

      throw error;
    }
  },

  // Logout function
  logout: () => {
    apiLogout(); // Use apiLogout (correct import from authApi.js)
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Clear error function
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
