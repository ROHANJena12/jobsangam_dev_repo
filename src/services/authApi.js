import { COMMUNITY_API_BASE } from '../config/community'

export async function authRegister({ name, email, password, role = "candidate", company = "", location = "India" }) {
  const res = await fetch(`${COMMUNITY_API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role, company, location })
  });
  return res.json();
}

// Example inside your signup handler
const handleSignup = async (formData) => {
  try {
    const result = await authRegister(formData);
    if (result.user) {
      // Registration successful, redirect or show success
    } else if (result.error) {
      // Show error message to user
    }
  } catch (err) {
    // Handle network or unexpected errors
  }
};