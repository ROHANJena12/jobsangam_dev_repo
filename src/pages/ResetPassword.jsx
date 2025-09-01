// src/pages/ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  resetPassword,
  checkOldPassword,
  verifyEmail,
} from "../services/authApi";
import CustomModal from "../components/CustomModal";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  const [passwordStrength, setPasswordStrength] = useState({});
  const [isSameAsOld, setIsSameAsOld] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("reset_email");
    if (emailFromStorage) setEmail(emailFromStorage);
  }, []);

  useEffect(() => {
    const strength = {
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    };
    setPasswordStrength(strength);

    if (email && newPassword.length > 0) {
      checkOldPassword(email, newPassword)
        .then((res) => {
          setIsSameAsOld(res.data.is_same);
        })
        .catch(() => {
          setIsSameAsOld(false);
        });
    }
  }, [newPassword, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setModalMessage("New password and confirm password do not match.");
      setModalType("error");
      setModalOpen(true);
      return;
    }

    if (isSameAsOld) {
      setModalMessage(
        "This password is the same as your old password. Use it to login or choose a new one."
      );
      setModalType("error");
      setModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      // Verify OTP before reset
      await verifyEmail(email, otp);

      const res = await resetPassword({
        email,
        otp,
        new_password: newPassword,
      });

      setModalMessage(res.message || "Password reset successful!");
      setModalType("success");
      setModalOpen(true);

      setTimeout(() => {
        setModalOpen(false);
        localStorage.removeItem("reset_email");
        navigate("/login");
      }, 2000);
    } catch (err) {
      setModalMessage(err.message || "Password reset failed.");
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const allValid =
    Object.values(passwordStrength).every(Boolean) &&
    newPassword === confirmPassword &&
    otp &&
    !isSameAsOld;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4 text-white">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit}>
          {/* OTP */}
          <label className="block text-sm font-medium mb-1">OTP</label>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full mb-4 px-4 py-2 rounded-md bg-gray-800 border border-gray-700"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {/* Password */}
          <label className="block text-sm font-medium mb-1">New Password</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full px-4 py-2 pr-10 rounded-md bg-gray-800 border border-gray-700"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Password Rules */}
          <ul className="text-sm text-gray-400 mb-4 space-y-1">
            <li className={passwordStrength.length ? "text-green-400" : ""}>
              ✔️ At least 8 characters
            </li>
            <li className={passwordStrength.upper ? "text-green-400" : ""}>
              ✔️ One uppercase letter
            </li>
            <li className={passwordStrength.lower ? "text-green-400" : ""}>
              ✔️ One lowercase letter
            </li>
            <li className={passwordStrength.number ? "text-green-400" : ""}>
              ✔️ One number
            </li>
            <li className={passwordStrength.special ? "text-green-400" : ""}>
              ✔️ One special character
            </li>
            {isSameAsOld && (
              <li className="text-red-400">⚠️ This is your old password.</li>
            )}
          </ul>

          {/* Confirm Password */}
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full mb-6 px-4 py-2 rounded-md bg-gray-800 border border-gray-700"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-red-400 mb-4">Passwords do not match</p>
          )}

          <button
            type="submit"
            disabled={!allValid || loading}
            className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-transform
              ${allValid && !loading
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105"
                : "bg-gray-700 opacity-50 cursor-not-allowed"}
            `}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
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
