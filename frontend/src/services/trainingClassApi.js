// src/services/trainingClassApi.js
import api from './api';

/**
 * Get all training classes.
 */
export const getTrainingClasses = () => api.get('/training-classes');

/**
 * Get a specific training class by ID.
 * @param {string} id - The ID of the training class.
 */
export const getTrainingClass = (id) => api.get(`/training-classes/${id}`);

/**
 * Create a new training class.
 * @param {Object} data - The data for the new training class.
 */
export const createTrainingClass = (data) => api.post('/training-classes', data);

/**
 * Update an existing training class.
 * @param {string} id - The ID of the training class to update.
 * @param {Object} data - The updated data for the training class.
 */
export const updateTrainingClass = (id, data) => api.put(`/training-classes/${id}`, data);

/**
 * Delete a training class.
 * @param {string} id - The ID of the training class to delete.
 */
export const deleteTrainingClass = (id) => api.delete(`/training-classes/${id}`);

/**
 * Enroll in a training class.
 * @param {string} id - The ID of the training class.
 * @param {Object} data - The enrollment data.
 */
export const enrollInClass = (id, data) => api.post(`/training-classes/${id}/enroll`, data);

/**
 * Update session attendance.
 * @param {string} classId - The ID of the training class.
 * @param {string} sessionId - The ID of the session.
 * @param {Object} data - The attendance data.
 */
export const updateSessionAttendance = (classId, sessionId, data) =>
  api.put(`/training-classes/${classId}/sessions/${sessionId}/attendance`, data);

/**
 * Update a session.
 * @param {string} classId - The ID of the training class.
 * @param {string} sessionId - The ID of the session.
 * @param {Object} data - The updated session data.
 */
export const updateSession = (classId, sessionId, data) =>
  api.put(`/training-classes/${classId}/sessions/${sessionId}`, data);
