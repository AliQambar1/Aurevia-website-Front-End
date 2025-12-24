// src/services/listingService.js
import api from './api';

export const getAllListings = async () => {
  try {
    const response = await api.get('/api/listings/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Modified to handle FormData for image upload
export const createListing = async (listingData) => {
  try {
    const isFormData = listingData instanceof FormData;
    
    const config = isFormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};

    const response = await api.post('/api/listings/', listingData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};