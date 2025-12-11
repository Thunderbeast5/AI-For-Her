import axios from 'axios';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a chat message to the backend
 */
export const sendChatMessage = async (message, sessionId, language = 'en-IN', file = null) => {
  try {
    const payload = {
      message,
      session_id: sessionId,
      language,
    };

    if (file) {
      payload.file = file;
    }

    const response = await apiClient.post('/api/chat', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Handle button clicks from the chatbot
 * ✅ MATCH BACKEND: Use 'button_value' parameter name
 */
export const handleButtonClick = async (buttonValue, sessionId, language = 'en-IN') => {
  try {
    const response = await apiClient.post('/api/button_click', {
      button_value: buttonValue, // ✅ MATCH BACKEND parameter name
      session_id: sessionId,
      language,
    });
    return response.data;
  } catch (error) {
    console.error('Error handling button click:', error);
    throw error;
  }
};

/**
 * Select a business idea
 * ✅ MATCH FLASK: Use 'idea_id' parameter name and return full plan
 */
export const selectIdea = async (ideaIndex, sessionId, language = 'en-IN') => {
  try {
    const response = await apiClient.post('/api/select_idea', {
      idea_id: ideaIndex, // ✅ MATCH FLASK parameter name
      session_id: sessionId,
      language,
    });
    return response.data;
  } catch (error) {
    console.error('Error selecting idea:', error);
    throw error;
  }
};

/**
 * Detect location based on coordinates or IP
 */
export const detectLocation = async (sessionId, latitude = null, longitude = null) => {
  try {
    const payload = { session_id: sessionId };
    if (latitude && longitude) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }
    const response = await apiClient.post('/api/location/detect', payload);
    return response.data;
  } catch (error) {
    console.error('Error detecting location:', error);
    throw error;
  }
};

/**
 * Get nearby businesses based on location and business type
 */
export const getNearbyBusinesses = async (latitude, longitude, businessType, sessionId, radius = 2000) => {
  try {
    const response = await apiClient.post('/api/location/nearby', {
      latitude,
      longitude,
      business_type: businessType,
      session_id: sessionId,
      radius,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting nearby businesses:', error);
    throw error;
  }
};

/**
 * Analyze location and market for a business
 */
export const analyzeLocation = async (latitude, longitude, businessType, sessionId) => {
  try {
    const response = await apiClient.post('/api/map/analyze', {
      latitude,
      longitude,
      business_type: businessType,
      session_id: sessionId,
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing location:', error);
    throw error;
  }
};

/**
 * Ask a business Q&A question
 */
export const askBusinessQuestion = async (question, sessionId, language = 'en-IN') => {
  try {
    const response = await apiClient.post('/api/business/qa', {
      question,
      session_id: sessionId,
      language,
    });
    return response.data;
  } catch (error) {
    console.error('Error asking business question:', error);
    throw error;
  }
};

/**
 * Upload PDF for question mode
 */
export const uploadPDF = async (sessionId, file, language = 'en-IN') => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('session_id', sessionId);
    formData.append('language', language);

    const response = await axios.post(`${API_BASE_URL}/api/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export default {
  sendChatMessage,
  handleButtonClick,
  selectIdea,
  detectLocation,
  getNearbyBusinesses,
  analyzeLocation,
  askBusinessQuestion,
  uploadPDF,
};
