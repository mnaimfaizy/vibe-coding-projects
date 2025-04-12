export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
