import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
