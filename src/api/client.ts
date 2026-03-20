import axios from 'axios';
import { getToken } from '../store/auth';

const client = axios.create({
  baseURL: 'https://localhost:7178/api',
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
