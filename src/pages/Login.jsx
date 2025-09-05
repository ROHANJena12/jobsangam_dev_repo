import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { write } from "../services/store";
import CustomModal from "../components/CustomModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setModalMessage("Please enter email and password.");
      setModalType("error");
      setModalOpen(true);
      return;
    }

    try {
      setLoginLoading(true);
      const res = await loginUser({ email, password });
      if (res.status === "success") {
        // Store user data in localStorage for session management

        const userData = {
          email: res.data?.email,
          name: res.data?.name,
          role: res.data?.role,
          company: res.data?.company,
        };
        write("hh_user", userData);

        setModalMessage("Login successful!");
        setModalType("success");
        setModalOpen(true);
        setTimeout(() => {
          setModalOpen(false);
          // Redirect based on user role
          const redirectPath =
            userData.role === "candidate"
              ? "/candidate"
              : userData.role === "recruiter"
              ? "/employer"
              : userData.role === "admin"
              ? "/admin"
              : "/";
          navigate(redirectPath);
        }, 1500);
      } else {
        setModalMessage(res.message || "Invalid email or password.");
        setModalType("error");
        setModalOpen(true);
      }
    } catch (e) {
      setModalMessage(e.message || "Login error.");
      setModalType("error");
      setModalOpen(true);
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6">
      {/* Left Info Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:block w-1/3 mr-12"
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <ul className="space-y-3 text-gray-100">
            <li>🔐 Access your saved jobs and profile</li>
            <li>✉️ Get job alerts and notifications</li>
            <li>⚙️ Manage your account easily</li>
          </ul>
        </div>
      </motion.div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {/* Email */}
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mb-4 px-4 py-2 rounded-md bg-gray-800 border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full px-4 py-2 pr-10 rounded-md bg-gray-800 border border-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-2.5 text-gray-400 cursor-pointer text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform mb-4 disabled:opacity-60"
          disabled={loginLoading || !email || !password}
        >
          {loginLoading ? "Logging in..." : "Login"}
        </button>

        {/* Forgot Password */}
        <p className="text-center text-sm text-gray-400 mb-2">
          <Link
            to="/forgot-password"
            className="text-indigo-400 hover:underline"
          >
            Forgot password?
          </Link>
        </p>

        {/* Go to Signup */}
        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline">
            Sign up
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
