import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API client instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Users API
export const usersApi = {
  // Get user by ID
  getUser: async (userId, role) => {
    const collection = role === 'entrepreneur' ? 'entrepreneurs' :
                      role === 'mentor' ? 'mentors' :
                      role === 'investor' ? 'investors' : 'users';
    const response = await apiClient.get(`/${collection}/${userId}`);
    return response.data;
  },

  // Create or update user
  saveUser: async (userId, userData, role) => {
    const collection = role === 'entrepreneur' ? 'entrepreneurs' :
                      role === 'mentor' ? 'mentors' :
                      role === 'investor' ? 'investors' : 'users';
    const response = await apiClient.put(`/${collection}/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId, role) => {
    const collection = role === 'entrepreneur' ? 'entrepreneurs' :
                      role === 'mentor' ? 'mentors' :
                      role === 'investor' ? 'investors' : 'users';
    const response = await apiClient.delete(`/${collection}/${userId}`);
    return response.data;
  },
};

// Startups API
export const startupsApi = {
  getAll: async () => {
    const response = await apiClient.get('/startups');
    return response.data;
  },

  getById: async (startupId) => {
    const response = await apiClient.get(`/startups/${startupId}`);
    return response.data;
  },

  getByUserId: async (userId) => {
    const response = await apiClient.get(`/startups/user/${userId}`);
    return response.data;
  },

  create: async (startupData) => {
    const response = await apiClient.post('/startups', startupData);
    return response.data;
  },

  update: async (startupId, startupData) => {
    const response = await apiClient.put(`/startups/${startupId}`, startupData);
    return response.data;
  },

  delete: async (startupId) => {
    const response = await apiClient.delete(`/startups/${startupId}`);
    return response.data;
  },
};

// Mentors API
export const mentorsApi = {
  getAll: async () => {
    const response = await apiClient.get('/mentors');
    return response.data;
  },

  getById: async (mentorId) => {
    const response = await apiClient.get(`/mentors/${mentorId}`);
    return response.data;
  },
};

// Connections API
export const connectionsApi = {
  getByUser: async (userId, role = null) => {
    const url = role ? `/connections/user/${userId}?role=${role}` : `/connections/user/${userId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (connectionId) => {
    const response = await apiClient.get(`/connections/${connectionId}`);
    return response.data;
  },

  checkExisting: async (entrepreneurId, mentorId) => {
    const response = await apiClient.get(`/connections/check/${entrepreneurId}/${mentorId}`);
    return response.data;
  },

  create: async (connectionData) => {
    const response = await apiClient.post('/connections', connectionData);
    return response.data;
  },

  update: async (connectionId, connectionData) => {
    const response = await apiClient.put(`/connections/${connectionId}`, connectionData);
    return response.data;
  },

  delete: async (connectionId) => {
    const response = await apiClient.delete(`/connections/${connectionId}`);
    return response.data;
  },

  accept: async (connectionId) => {
    const response = await apiClient.post(`/connections/${connectionId}/accept`);
    return response.data;
  },

  reject: async (connectionId, reason) => {
    const response = await apiClient.post(`/connections/${connectionId}/reject`, { reason });
    return response.data;
  },

  completePayment: async (connectionId, paymentId, paymentAmount) => {
    const response = await apiClient.post(`/connections/${connectionId}/complete-payment`, {
      paymentId,
      paymentAmount
    });
    return response.data;
  },
};

// Chat API
export const chatApi = {
  getMessages: async (connectionId) => {
    const response = await apiClient.get(`/chat/connection/${connectionId}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await apiClient.post('/chat', messageData);
    return response.data;
  },

  markAsRead: async (connectionId, userId) => {
    const response = await apiClient.put(`/chat/read/${connectionId}/${userId}`);
    return response.data;
  },

  getUnreadCount: async (userId) => {
    const response = await apiClient.get(`/chat/unread/${userId}`);
    return response.data;
  },
};

// Sessions API
export const sessionsApi = {
  getByUser: async (userId) => {
    const response = await apiClient.get(`/sessions/user/${userId}`);
    return response.data;
  },

  create: async (sessionData) => {
    const response = await apiClient.post('/sessions', sessionData);
    return response.data;
  },

  update: async (sessionId, sessionData) => {
    const response = await apiClient.put(`/sessions/${sessionId}`, sessionData);
    return response.data;
  },
};

// Opportunities API
export const opportunitiesApi = {
  getAll: async () => {
    const response = await apiClient.get('/opportunities');
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  getByUser: async (userId) => {
    const response = await apiClient.get(`/notifications/user/${userId}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

export default apiClient;
