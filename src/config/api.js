// src/config/api.js

// Prefer .env variable if present, else default to local dev.
const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/,'') ||
  "http://127.0.0.1:8000"; // no trailing slash

// Always export full /api base
export const API = `${API_BASE_URL}/api`;

export default API;
