import axios from 'axios';

const apiClient = axios.create({
  // baseURL: 'http://localhost:3000/api',
  baseURL: 'https://skyserve-task-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add a request interceptor to attach token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default apiClient;
