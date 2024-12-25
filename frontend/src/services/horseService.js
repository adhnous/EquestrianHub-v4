import axios from 'axios';
import { authHeader } from './authService';
import api from './api';

const API_URL = 'http://localhost:5000/api';

export const getHorses = async () => {
  const response = await api.get('/horses');
  return response.data;
};

export const getHorse = async (id) => {
  const response = await api.get(`/horses/${id}`);
  return response.data;
};

export const createHorse = async (horseData) => {
  const response = await api.post('/horses', horseData);
  return response.data;
};

export const updateHorse = async (id, horseData) => {
  const response = await api.put(`/horses/${id}`, horseData);
  return response.data;
};

export const deleteHorse = async (id) => {
  const response = await api.delete(`/horses/${id}`);
  return response.data;
};
