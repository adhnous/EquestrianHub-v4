// src/services/traineeApi.js
import api from './api';

/**
 * Get all trainees.
 */
export const getTrainees = () => api.get('/trainees');

/**
 * Get a specific trainee by ID.
 * @param {string} id - The ID of the trainee.
 */
export const getTrainee = (id) => api.get(`/trainees/${id}`);

/**
 * Create a new trainee.
 * @param {Object} data - The data for the new trainee.
 */
export const createTrainee = (data) => api.post('/trainees', data);

/**
 * Update an existing trainee.
 * @param {string} id - The ID of the trainee to update.
 * @param {Object} data - The updated data for the trainee.
 */
export const updateTrainee = (id, data) => api.put(`/trainees/${id}`, data);

/**
 * Delete a trainee.
 * @param {string} id - The ID of the trainee to delete.
 */
export const deleteTrainee = (id) => api.delete(`/trainees/${id}`);
