// src/services/listingService.js
import api from './api';

export const getAllListings = async () => {
  const response = await api.get('/api/listings/');
  return response.data;
};

export const createListing = async (listingData) => {
  const response = await api.post('/api/listings/', listingData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};