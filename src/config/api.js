// src/config/api.js

// Use VITE_API_BASE_URL if provided; otherwise default to nginx proxy path `/api`.
// IMPORTANT: If you set VITE_API_BASE_URL, make it the FULL base (e.g. "/api" or "https://api.example.com/api")
// and do NOT append another "/api" in code elsewhere.
const API = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
  : "/api";

export { API };
export default API;
