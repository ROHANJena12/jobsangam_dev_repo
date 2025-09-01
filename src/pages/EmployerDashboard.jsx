import React from 'react';
import { Navigate } from 'react-router-dom';

export default function EmployerDashboard(){
  return <Navigate to="/recruiter/my-jobs" replace />;
}
