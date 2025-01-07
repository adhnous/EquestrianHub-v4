// src/services/horseApi.js
import api from './api';

/**
 * Get all horses.
 */
export const getHorses = () => api.get('/horses');

/**
 * Get a specific horse by ID.
 * @param {string} horseId - The ID of the horse.
 */
export const getHorseById = (horseId) => api.get(`/horses/${horseId}`);

/**
 * Create a new horse.
 * @param {Object} horseData - The data of the horse to create.
 */
export const createHorse = (horseData) => api.post('/horses', horseData);

/**
 * Update an existing horse.
 * @param {string} horseId - The ID of the horse to update.
 * @param {Object} horseData - The updated data of the horse.
 */
export const updateHorse = (horseId, horseData) => api.put(`/horses/${horseId}`, horseData);

/**
 * Delete a horse.
 * @param {string} horseId - The ID of the horse to delete.
 */
export const deleteHorse = (horseId) => api.delete(`/horses/${horseId}`);
