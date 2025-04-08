import api from './api';

// Types for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const AuthService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    // Store auth token and user info in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  // Register new user
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    // Store auth token and user info in localStorage upon successful signup
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/request-password-reset', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // Change password (for authenticated users)
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Verify email address
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/auth/verify-email', { token });
    return response.data;
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to home page
    window.location.href = '/';
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },

  // Get current user
  getCurrentUser: (): { id: number; name: string; email: string } | null => {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }
};

export default AuthService;