import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout, getStoredAuthToken } from '../services/api'; // Ensure correct imports

// Try to get existing auth data with error handling for malformed localStorage data
const storedToken = localStorage.getItem('token');
const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    console.error('Failed to parse stored user from localStorage');
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
      if (!response?.data?.success || !response?.data?.token || !response?.data?.user) {
        throw new Error('Invalid response structure from server');
      }

      const { success, token, user } = response.data;

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
    apiLogout(); // Use apiLogout (correct import)
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
