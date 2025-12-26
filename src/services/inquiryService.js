import api from './api';

// Submit a new inquiry for a specific car
export const createInquiry = async (inquiryData) => {
  try {
    const response = await api.post('/api/inquiries/', inquiryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch all inquiries Admin only
export const getAllInquiries = async () => {
  try {
    const response = await api.get('/api/inquiries/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

//  Get inquiries for a specific listing (Admin only)
export const getListingInquiries = async (listingId) => {
  try {
    const response = await api.get(`/api/inquiries/listing/${listingId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an inquiry
export const updateInquiry = async (inquiryId, inquiryData) => {
  try {
    const response = await api.put(`/api/inquiries/${inquiryId}`, inquiryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete an inquiry
export const deleteInquiry = async (inquiryId) => {
  try {
    const response = await api.delete(`/api/inquiries/${inquiryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};