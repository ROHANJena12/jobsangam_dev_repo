// src/pages/Signup.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  requestEmailVerification,
  verifyEmail,
  registerUser,
} from "../services/authApi";
import CustomModal from "../components/CustomModal";

// ✅ Password validation helper
function validatePassword(password) {
  const lengthOk = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return {
    lengthOk,
    hasLetter,
    hasNumber,
    valid: lengthOk && hasLetter && hasNumber,
  };
}

export default function Signup() {
  const [role, setRole] = useState("Candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [workStatus, setWorkStatus] = useState(null);
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [emailLoading, setEmailLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  // ✅ Email OTP handler
  async function handleEmailVerify() {
    if (!email) {
      setModalMessage("Please enter an email first.");
      setModalType("error");
      setModalOpen(true);
      return;
    }
    try {
      setEmailLoading(true);
      const res = await requestEmailVerification(email);
      if (res.status === "success") {
        setShowOtp(true);
        setModalMessage("OTP sent to your email.");
        setModalType("success");
      } else {
        setModalMessage(res.message || "Could not send OTP.");
        setModalType("error");
      }
    } catch (e) {
      setModalMessage(e.message || "Server error.");
      setModalType("error");
    } finally {
      setModalOpen(true);
      setEmailLoading(false);
    }
  }

  // ✅ OTP submission and verification
  async function handleOtpSubmit() {
    if (!otp) {
      setModalMessage("Please enter the OTP.");
      setModalType("error");
      setModalOpen(true);
      return;
    }
    try {
      setOtpLoading(true);
      const res = await verifyEmail(email, otp);
      if (res.status === "success") {
        setModalMessage("Email verified successfully!");
        setModalType("success");
        setOtpVerified(true); // 🔑 ✅ Mark as verified
      } else {
        setModalMessage(res.message || "OTP verification failed.");
        setModalType("error");
      }
    } catch (e) {
      setModalMessage(e.message || "Server error.");
      setModalType("error");
    } finally {
      setModalOpen(true);
      setOtpLoading(false);
    }
  }

  // ✅ Final Signup submission
  async function handleSignup(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      setModalMessage("Please fill all required fields.");
      setModalType("error");
      setModalOpen(true);
      return;
    }

    const pwdValid = validatePassword(password);
    if (!pwdValid.valid) {
      setModalMessage("Password does not meet the required criteria.");
      setModalType("error");
      setModalOpen(true);
      return;
    }

    try {
      setSignupLoading(true);
      const payload = {
        full_name: name,
        email,
        password,
        role_type: role.toLowerCase(),
        company: "",
        location: "India",
        mobile: phone,
        work_status: workStatus,
      };
      const res = await registerUser(payload);
      if (res.status === "success") {
        setModalMessage("Account created successfully!");
        setModalType("success");
      } else {
        setModalMessage(res.message || "Registration failed.");
        setModalType("error");
      }
    } catch (e) {
      setModalMessage(e.message || "Server error.");
      setModalType("error");
    } finally {
      setModalOpen(true);
      setSignupLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:block w-1/3 mr-12"
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Why Create an Account?</h2>
          <ul className="space-y-3 text-gray-100">
            <li>🚀 Build your profile and let companies discover you</li>
            <li>🎯 Get personalized job recommendations via email</li>
            <li>📈 Grow your career with exclusive resources</li>
          </ul>
        </div>
      </motion.div>

      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create Your Account
        </h2>

        {/* Role */}
        <label className="block text-sm font-medium mb-1">Choose Role</label>
        <select
          className="w-full mb-4 px-4 py-2 rounded-md bg-gray-800 border border-gray-700"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option>Candidate</option>
          <option>Recruiter</option>
          <option>Admin</option>
        </select>

        {/* Full Name */}
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full mb-4 px-4 py-2 rounded-md bg-gray-800 border border-gray-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <label className="block text-sm font-medium mb-1">Email</label>
        <div className="flex mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-l-md bg-gray-800 border border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="button"
            onClick={handleEmailVerify}
            className="px-4 py-2 bg-indigo-600 rounded-r-md hover:bg-indigo-700 transition disabled:opacity-60"
            disabled={emailLoading || !email}
          >
            {emailLoading ? "Sending..." : "Verify"}
          </button>
        </div>

        {/* OTP */}
        {showOtp && (
          <>
            <label className="block text-sm font-medium mb-1">Enter OTP</label>
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Enter the OTP sent to email"
                className="flex-1 px-4 py-2 rounded-l-md bg-gray-800 border border-gray-700"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={otpVerified}
              />
              <button
                type="button"
                onClick={handleOtpSubmit}
                className={`px-4 py-2 rounded-r-md transition ${
                  otpVerified
                    ? "bg-green-700 text-white cursor-default"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={otpLoading || otpVerified || !otp}
              >
                {otpVerified ? "Verified" : otpLoading ? "Verifying..." : "Submit OTP"}
              </button>
            </div>
          </>
        )}

        {/* Password */}
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-1">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter a secure password"
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
          />
          <span
            className="absolute right-3 top-2.5 text-gray-400 cursor-pointer text-sm"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* Password Tips */}
        {passwordTouched && (
          <div className="text-sm mb-4 space-y-1 text-gray-400">
            <div className={validatePassword(password).lengthOk ? "text-green-400" : "text-red-500"}>
              • Minimum 8 characters
            </div>
            <div className={validatePassword(password).hasLetter ? "text-green-400" : "text-red-500"}>
              • At least one letter
            </div>
            <div className={validatePassword(password).hasNumber ? "text-green-400" : "text-red-500"}>
              • At least one number
            </div>
          </div>
        )}

        {/* Phone */}
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <input
          type="tel"
          placeholder="Enter your phone number"
          className="w-full mb-4 px-4 py-2 rounded-md bg-gray-800 border border-gray-700"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Work Status */}
        <label className="block text-sm font-medium mb-2">Work Status</label>
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setWorkStatus("Experienced")}
            className={`flex-1 py-3 rounded-xl border transition ${
              workStatus === "Experienced"
                ? "border-indigo-500 bg-gray-800"
                : "border-gray-600 hover:border-indigo-500 hover:bg-gray-800"
            }`}
            disabled={signupLoading}
          >
            Experienced
          </button>
          <button
            type="button"
            onClick={() => setWorkStatus("Fresher")}
            className={`flex-1 py-3 rounded-xl border transition ${
              workStatus === "Fresher"
                ? "border-indigo-500 bg-gray-800"
                : "border-gray-600 hover:border-indigo-500 hover:bg-gray-800"
            }`}
            disabled={signupLoading}
          >
            Fresher
          </button>
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform mb-4 disabled:opacity-60"
          disabled={signupLoading}
        >
          {signupLoading ? "Submitting..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 hover:underline">
            Login
          </Link>
        </p>
      </form>

      {/* Modal */}
      <CustomModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        type={modalType}
      />
    </div>
  );
}
