// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "", // set VITE_API_BASE in .env if needed
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
