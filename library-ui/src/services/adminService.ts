import api from "./api";

// Types for API requests and responses
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends User {
  books: any[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  email_verified?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  email_verified?: boolean;
}

const AdminService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>("/api/admin/users");
    return response.data.users;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<UserDetail> => {
    const response = await api.get<{ user: UserDetail }>(
      `/api/admin/users/${id}`
    );
    return response.data.user;
  },

  // Create a new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<{ user: User; message: string }>(
      "/api/admin/users",
      userData
    );
    return response.data.user;
  },

  // Update a user
  updateUser: async (
    id: number,
    userData: UpdateUserRequest
  ): Promise<User> => {
    const response = await api.put<{ user: User; message: string }>(
      `/api/admin/users/${id}`,
      userData
    );
    return response.data.user;
  },

  // Delete a user
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/api/admin/users/${id}`
    );
    return response.data;
  },

  // Change a user's password
  changeUserPassword: async (
    id: number,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/api/admin/users/${id}/change-password`,
      { newPassword }
    );
    return response.data;
  },
};

export default AdminService;
