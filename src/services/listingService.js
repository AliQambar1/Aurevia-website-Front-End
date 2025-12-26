// src/services/listingService.js
import api from './api';


//  Fetch all car listings from the database

export const getAllListings = async () => {
  try {
    const response = await api.get('/api/listings/');
    return response.data;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    throw error;
  }
};


//  Fetch a single listing by ID

export const getListingById = async (listingId) => {
  try {
    const response = await api.get(`/api/listings/${listingId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
};


  // Create a new car listing.
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


  // Update an existing car listing
export const updateListing = async (listingId, listingData) => {
  try {
    console.log(`Updating listing ${listingId}`);
    console.log('Sending data:', listingData);
    console.log('Images being sent:', listingData.images);
    
    const response = await api.put(`/api/listings/${listingId}`, listingData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating listing:", error);
    console.error(" Error response:", error.response?.data);
    throw error;
  }
};

// Delete a car listing
 
export const deleteListing = async (listingId) => {
  try {
    const response = await api.delete(`/api/listings/${listingId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};


// Logic-based filter for available listings to avoid 404 errors
 
export const getAvailableListings = async () => {
  try {
    const allListings = await getAllListings();
    return allListings.filter(listing => listing.status === "Available");
  } catch (error) {
    console.error("Error filtering available listings:", error);
    return [];
  }
};


  // Calculates the count of available listings for the UI
export const getAvailableCount = async () => {
  try {
    const available = await getAvailableListings();
    return available.length;
  } catch (error) {
    return 0;
  }
};