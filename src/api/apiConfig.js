import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

export const API_BASE_URL = "https://localhost:5001/api";

export const API_HEADERS = {
   "Content-Type": "application/json",
   "x-api-key": "MARKETING_STAR_STATIC_KEY"
};

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { ...API_HEADERS },
  timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
