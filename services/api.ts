import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://0023edba1c90.ngrok-free.app';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops and only retry once
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      
      // If we're already refreshing, wait for it to complete
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        // Get refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, clear storage and reject
          await AsyncStorage.clear();
          isRefreshing = false;
          return Promise.reject(error);
        }

        console.log('Attempting token refresh...');
        
        // Attempt token refresh using a fresh axios instance to avoid interceptor loop
        const refreshResponse = await axios.create().put(
          `${BASE_URL}/api/v1/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
        
        console.log('Token refresh successful');
        
        // Save the new tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // Notify all waiting requests with the new token
        onRefreshed(accessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Clear storage and reject all waiting requests
        await AsyncStorage.clear();
        isRefreshing = false;
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
  },
  signup: async (email: string, password: string, confirmPassword: string) => {
    const response = await api.post('/api/v1/auth/signup', { email, password, confirmPassword });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/api/v1/auth/logout');
    return response.data;
  },
  verify2FA: async (email: string, token: string) => {
    const response = await api.post('/api/v1/auth/login/verify-2fa', { email, token });
    return response.data;
  }
};

// Team services
export const teamService = {
  getAllTeams: async () => {
    const response = await api.get('/api/v1/team/all');
    return response.data;
  },
  getTeamById: async (teamId: string) => {
    const response = await api.get(`/api/v1/team/${teamId}`);
    return response.data;
  },
  createTeam: async (formData: FormData) => {
    const response = await api.post('/api/v1/team', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  requestToJoinTeam: async (teamId: string, message: string = '') => {
    const response = await api.post(`/api/v1/team/${teamId}/join-request`, { message });
    return response.data;
  },
  getUserTeams: async () => {
    const response = await api.get('/api/v1/team');
    return response.data;
  },
  getUserJoinRequests: async () => {
    const response = await api.get('/api/v1/team/my-join-requests');
    return response.data;
  },
  getTeamJoinRequests: async (teamId: string) => {
    const response = await api.get(`/api/v1/team/${teamId}/join-requests`);
    return response.data;
  },
  respondToJoinRequest: async (teamId: string, requestId: string, status: 'accepted' | 'rejected') => {
    const response = await api.put(`/api/v1/team/${teamId}/join-request/${requestId}`, { status });
    return response.data;
  },
  cancelJoinRequest: async (requestId: string) => {
    const response = await api.delete(`/api/v1/team/join-request/${requestId}`);
    return response.data;
  }
};

// User services
export const userService = {
  getUserProfile: async () => {
    const response = await api.get('/api/v1/user/profile');
    return response.data;
  },
  updateUserProfile: async (userData: any) => {
    const response = await api.put('/api/v1/user/profile', userData);
    return response.data;
  }
};

export default api;