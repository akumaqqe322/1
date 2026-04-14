import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach mock user ID for dev RBAC
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('mock_user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    config.headers['x-user-id'] = user.id;
  }
  return config;
});
