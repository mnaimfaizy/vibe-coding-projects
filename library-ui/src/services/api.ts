import axios from 'axios';

// Create a base axios instance with common configurations
const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized errors - user might need to log in again
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optional: Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;