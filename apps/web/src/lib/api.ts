import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach mock user ID for dev RBAC
api.interceptors.request.use((config) => {
  const savedEmail = localStorage.getItem('mock_email');
  if (savedEmail) {
    // We send the email as the identifier. 
    // The backend RolesGuard is updated to resolve the user by email if it contains '@'.
    config.headers['x-user-id'] = savedEmail;
  }
  return config;
});
