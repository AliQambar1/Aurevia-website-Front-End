import api from './api';

// Fetch all car listings from the database
export const getAllListings = async () => {
  try {
    const response = await api.get('/api/listings/');
    return response.data;
  } catch (error) {
    // Forward error to be handled by the component
    throw error;
  }
};

// Add a new car listing (Admin only)
export const createListing = async (listingData) => {
  try {
    const response = await api.post('/api/listings/', listingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};