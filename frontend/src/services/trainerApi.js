// src/services/trainerApi.js
import api from './api';

/**
 * Get all trainers.
 */
export const getTrainers = () => api.get('/trainers');

/**
 * Get a specific trainer by ID.
 * @param {string} id - The ID of the trainer.
 */
export const getTrainer = (id) => api.get(`/trainers/${id}`);

/**
 * Create a new trainer.
 * @param {Object} data - The data for the new trainer.
 */
export const createTrainer = (data) => api.post('/trainers', data);

/**
 * Update an existing trainer.
 * @param {string} id - The ID of the trainer to update.
 * @param {Object} data - The updated data for the trainer.
 */
export const updateTrainer = (id, data) => api.put(`/trainers/${id}`, data);

/**
 * Delete a trainer.
 * @param {string} id - The ID of the trainer to delete.
 */
export const deleteTrainer = (id) => api.delete(`/trainers/${id}`);
