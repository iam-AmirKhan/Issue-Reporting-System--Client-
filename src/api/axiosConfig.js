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
    try {
      // authStateReady() resolves only after Firebase has fully initialized
      // and determined whether a user is signed in or not — no race condition.
      await auth.authStateReady();

      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Could not attach Firebase token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
