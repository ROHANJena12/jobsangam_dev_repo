// src/services/authApi.js
import { API } from "../config/api";

// Small helper to standardize fetch + JSON + errors
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  // handle non-2xx http
  let data;
  try { data = await res.json(); } catch { data = { message: "Invalid JSON" }; }
  if (!res.ok) {
    // DRF returns your envelope on error too; surface it
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

/** Send OTP to email */
export async function requestEmailVerification(email) {
  return postJSON(`${API}/users/request-email-verification/`, { email });
}

/** Verify OTP for email */
export async function verifyEmail(email, otp) {
  return postJSON(`${API}/users/verify-email/`, { email, otp });
}

/** Register user (matches your UserRegisterView) */
export async function registerUser(payload) {
  // payload example: { name, email, password, role, company, location, phone, work_status }
  return postJSON(`${API}/users/register/`, payload);
}


/** Login user (email + password) */
export async function loginUser(payload) {
  return postJSON(`${API}/users/login/`, payload);
}

// ✅ Forgot Password API
export async function forgotPassword(email) {
  return postJSON(`${API}/users/forgot-password/`, { email });
}

/** Reset password */
export async function resetPassword({ email, otp, new_password }) {
  return postJSON(`${API}/users/reset-password/`, { email, otp, new_password });
}

export async function checkOldPassword(email, password) {
  const res = await postJSON(`${API}/users/check-old-password/`, {
    email,
    password,
  });
  return res;
}

