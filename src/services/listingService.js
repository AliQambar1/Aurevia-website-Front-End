// src/services/listingService.js
import api from './api';

/**
 * Fetch all car listings from the database
 */
export const getAllListings = async () => {
  try {
    const response = await api.get('/api/listings/');
    return response.data;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    throw error;
  }
};

/**
 * Create a new car listing.
 * Backend expects 'images' as a JSON string within FormData.
 */
export const createListing = async (listingData) => {
  try {
    const response = await api.post('/api/listings/', listingData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

/**
 * Logic-based filter for available listings to avoid 404 errors
 */
export const getAvailableListings = async () => {
  try {
    const allListings = await getAllListings();
    // Filters items where status is exactly "Available"
    return allListings.filter(listing => listing.status === "Available");
  } catch (error) {
    console.error("Error filtering available listings:", error);
    return [];
  }
};

/**
 * Calculates the count of available listings for the UI
 */
export const getAvailableCount = async () => {
  try {
    const available = await getAvailableListings();
    return available.length;
  } catch (error) {
    return 0;
  }
};