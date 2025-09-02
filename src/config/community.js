// src/config/community.js

// Toggle to enable/disable community backend integration
export const USE_COMMUNITY_BACKEND = true;

// Prefer env var if present, else default to nginx proxy path `/api/community`.
export const COMMUNITY_API_BASE =
  (import.meta?.env?.VITE_COMMUNITY_API_BASE || '/api/community').replace(/\/+$/, '');
