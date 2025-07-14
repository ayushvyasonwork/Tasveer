import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Use NEXT_PUBLIC_API_BASE_URL for Next.js
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
