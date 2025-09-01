// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../services/authApi";
import CustomModal from "../components/CustomModal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setModalMessage(res.message || "Reset email sent!");
      setModalType("success");
      setModalOpen(true);

      // Save email to localStorage to reuse later
      localStorage.setItem("reset_email", email);

      // Redirect to reset-password page
      setTimeout(() => {
        setModalOpen(false);
        navigate("/reset-password"); // No need for query string; we'll use localStorage
      }, 2000);
    } catch (err) {
      setModalMessage(err.message || "Failed to send reset email.");
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4 text-white">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            className="w-full mb-6 px-4 py-2 rounded-md bg-gray-800 border border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={!email || loading}
            className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-transform mb-4
              ${email && !loading
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105"
                : "bg-gray-700 opacity-50 cursor-not-allowed"}
            `}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Back to{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>

      <CustomModal
        isOpen={modalOpen}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
