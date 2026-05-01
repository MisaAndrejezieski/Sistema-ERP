import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sistema-erp-vuyg.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/Sistema-ERP/login';
    }
    return Promise.reject(error);
  }
);

export default api;