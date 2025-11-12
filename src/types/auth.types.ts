// src/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  firebaseUid: string;
  fullName: string | null;
  timezone: string;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  timezone?: string;
}
