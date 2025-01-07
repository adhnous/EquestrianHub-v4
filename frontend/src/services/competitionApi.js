// src/services/competitionApi.js
import api from './api';

/**
 * Get all competitions.
 */
export const getCompetitions = () => api.get('/competitions');

/**
 * Get a specific competition by ID.
 * @param {string} id - The ID of the competition.
 */
export const getCompetition = (id) => api.get(`/competitions/${id}`);

/**
 * Create a new competition.
 * @param {Object} data - The data for the new competition.
 */
export const createCompetition = (data) => api.post('/competitions', data);

/**
 * Update an existing competition.
 * @param {string} id - The ID of the competition to update.
 * @param {Object} data - The updated data for the competition.
 */
export const updateCompetition = (id, data) => api.put(`/competitions/${id}`, data);

/**
 * Delete a competition.
 * @param {string} id - The ID of the competition to delete.
 */
export const deleteCompetition = (id) => api.delete(`/competitions/${id}`);

/**
 * Register for a competition.
 * @param {string} id - The ID of the competition.
 * @param {Object} data - The registration data.
 */
export const registerForCompetition = (id, data) => api.post(`/competitions/${id}/register`, data);

/**
 * Update competition results.
 * @param {string} id - The ID of the competition.
 * @param {Object} data - The updated results data.
 */
export const updateCompetitionResults = (id, data) => api.put(`/competitions/${id}/results`, data);
