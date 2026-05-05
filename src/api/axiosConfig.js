import axios from "axios";
import { auth } from "../../firebase.config";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to attach token
api.interceptors.request.use(
  async (config) => {
    // Attempt to get Firebase token if user is signed in
    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.warn("Could not fetch Firebase token", err);
      }
    } else {
      // Fallback to local storage if needed by custom JWT
      const token = localStorage.getItem("access-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
