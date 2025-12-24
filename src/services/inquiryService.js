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