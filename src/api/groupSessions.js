import axios from 'axios';

const API_URL = 'http://localhost:5000/api/group-sessions';

export const groupSessionsApi = {
  // Get all active group sessions (for entrepreneurs)
  getActiveSessions: async () => {
    const response = await axios.get(`${API_URL}/active`);
    return response.data;
  },

  // Get sessions by mentor ID
  getByMentor: async (mentorId) => {
    const response = await axios.get(`${API_URL}/mentor/${mentorId}`);
    return response.data;
  },

  // Get sessions by participant ID
  getByParticipant: async (userId) => {
    const response = await axios.get(`${API_URL}/participant/${userId}`);
    return response.data;
  },

  // Get single session by ID
  getById: async (sessionId) => {
    const response = await axios.get(`${API_URL}/${sessionId}`);
    return response.data;
  },

  // Create new group session
  create: async (sessionData) => {
    const response = await axios.post(API_URL, sessionData);
    return response.data;
  },

  // Update session
  update: async (sessionId, sessionData) => {
    const response = await axios.put(`${API_URL}/${sessionId}`, sessionData);
    return response.data;
  },

  // Delete session
  delete: async (sessionId, mentorId) => {
    const response = await axios.delete(`${API_URL}/${sessionId}`, {
      params: { mentorId }
    });
    return response.data;
  },

  // Join session (enroll)
  joinSession: async (sessionId, userId, userName) => {
    const response = await axios.post(`${API_URL}/${sessionId}/join`, {
      userId,
      userName
    });
    return response.data;
  },

  // Leave session
  leaveSession: async (sessionId, userId) => {
    const response = await axios.post(`${API_URL}/${sessionId}/leave`, {
      userId
    });
    return response.data;
  },

  // Add session recording/materials
  addSessionContent: async (sessionId, contentData) => {
    const response = await axios.post(`${API_URL}/${sessionId}/sessions`, contentData);
    return response.data;
  }
};

export default groupSessionsApi;
