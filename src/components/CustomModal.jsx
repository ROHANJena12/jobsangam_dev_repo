// src/components/CustomModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function CustomModal({ isOpen, onClose, message, type = "success" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white text-gray-800 p-8 rounded-2xl shadow-lg w-[90%] max-w-sm text-center relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              {type === "success" ? (
                <CheckCircle className="text-green-500" size={48} />
              ) : (
                <XCircle className="text-red-500" size={48} />
              )}
            </div>

            {/* Message */}
            <h3 className="text-xl font-semibold mb-2">{message}</h3>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
