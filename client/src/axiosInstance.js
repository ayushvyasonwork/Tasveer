// src/utils/axiosInstance.js
import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Default base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Axios interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
