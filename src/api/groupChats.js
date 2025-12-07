import axios from 'axios';

const API_URL = 'http://localhost:5000/api/group-chats';

export const groupChatsApi = {
  // Get or create group chat
  getGroupChat: async (groupId) => {
    const response = await axios.get(`${API_URL}/group/${groupId}`);
    return response.data;
  },

  // Send message to group
  sendMessage: async (groupId, senderId, senderName, message) => {
    const response = await axios.post(`${API_URL}/group/${groupId}/message`, {
      senderId,
      senderName,
      message
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (groupId, userId) => {
    const response = await axios.post(`${API_URL}/group/${groupId}/read`, {
      userId
    });
    return response.data;
  },

  // Add participant
  addParticipant: async (groupId, userId, userName) => {
    const response = await axios.post(`${API_URL}/group/${groupId}/participant`, {
      userId,
      userName
    });
    return response.data;
  },

  // Remove participant
  removeParticipant: async (groupId, userId) => {
    const response = await axios.delete(`${API_URL}/group/${groupId}/participant/${userId}`);
    return response.data;
  },

  // Get user's group chats
  getUserGroupChats: async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  }
};

export default groupChatsApi;
