// src/utils/axiosInstance.js
import axios from "axios";
import { store } from "./state/store"; 
// Create Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL , // Default base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios request interceptor to add Authorization token from Redux store
api.interceptors.request.use(
  (config) => {
    const token = store.getState().token; // Get token from Redux store directly
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Add the token to the headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
