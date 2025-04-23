export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  lastLogin?: number;
}

export interface UserSession {
  userId: string;
  token: string;
  expires: number;
  createdAt: number;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  token?: string;
  expiresAt?: number;
}
