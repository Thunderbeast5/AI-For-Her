import axios from 'axios';

const API_URL = 'http://localhost:5000/api/mentor-groups';

export const mentorGroupsApi = {
  // Get all active groups (for entrepreneurs)
  getActiveGroups: async () => {
    const response = await axios.get(`${API_URL}/active`);
    return response.data;
  },

  // Get groups by mentor ID
  getByMentor: async (mentorId) => {
    const response = await axios.get(`${API_URL}/mentor/${mentorId}`);
    return response.data;
  },

  // Get groups by participant ID
  getByParticipant: async (userId) => {
    const response = await axios.get(`${API_URL}/participant/${userId}`);
    return response.data;
  },

  // Get single group by ID
  getById: async (groupId) => {
    const response = await axios.get(`${API_URL}/${groupId}`);
    return response.data;
  },

  // Create new group
  create: async (groupData) => {
    const response = await axios.post(API_URL, groupData);
    return response.data;
  },

  // Update group
  update: async (groupId, groupData) => {
    const response = await axios.put(`${API_URL}/${groupId}`, groupData);
    return response.data;
  },

  // Delete group
  delete: async (groupId, mentorId) => {
    const response = await axios.delete(`${API_URL}/${groupId}`, {
      params: { mentorId }
    });
    return response.data;
  },

  // Join group
  joinGroup: async (groupId, userId, userName) => {
    const response = await axios.post(`${API_URL}/${groupId}/join`, {
      userId,
      userName
    });
    return response.data;
  },

  // Leave group
  leaveGroup: async (groupId, userId) => {
    const response = await axios.post(`${API_URL}/${groupId}/leave`, {
      userId
    });
    return response.data;
  },

  // Add session
  addSession: async (groupId, sessionData) => {
    const response = await axios.post(`${API_URL}/${groupId}/sessions`, sessionData);
    return response.data;
  },

  // Add review
  addReview: async (groupId, reviewData) => {
    const response = await axios.post(`${API_URL}/${groupId}/reviews`, reviewData);
    return response.data;
  }
};

export default mentorGroupsApi;
