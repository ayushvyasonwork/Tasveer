import axios from "axios";
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't globally redirect on 401 for /verify/verify-token endpoint
    // Let ProtectedRoute handle authentication checks
    if (error.response?.status === 401 && !error.config.url.includes("/verify/verify-token")) {
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;