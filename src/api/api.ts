import client from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: number;
}

export const login = (data: LoginRequest) => client.post('/users/login', data);
export const register = (data: RegisterRequest) => client.post('/users', data);