import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import RequireOwner from './components/RequireOwner.jsx'
import RouteMeta from './components/RouteMeta.jsx'
import { ToastProvider } from './components/Toast.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { auth } from './services/store'
import { OWNER_EMAIL } from './config/owner'
import ResetPassword from "./pages/ResetPassword";

// Core pages (lazy)
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx')); // ✅ ADDED
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard.jsx'));
const CandidateApplications = lazy(() => import('./pages/CandidateApplications.jsx'));
const CandidateSaved = lazy(() => import('./pages/CandidateSaved.jsx'));
const CandidateAlerts = lazy(() => import('./pages/CandidateAlerts.jsx'));
const CandidateAnalytics = lazy(() => import('./pages/CandidateAnalytics.jsx'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile.jsx'));
const CandidateBooking = lazy(() => import('./pages/CandidateBooking.jsx'));
const RecruiterJobsRollup = lazy(() => import('./pages/RecruiterJobsRollup.jsx'));
const RecruiterPipeline = lazy(() => import('./pages/RecruiterPipeline.jsx'));
const RecruiterAnalyticsPro = lazy(() => import('./pages/RecruiterAnalyticsPro.jsx'));
const RecruiterSettings = lazy(() => import('./pages/RecruiterSettings.jsx'));
const RecruiterCandidates = lazy(() => import('./pages/RecruiterCandidates.jsx'));
const RecruiterSchedule = lazy(() => import('./pages/RecruiterSchedule.jsx'));
const RecruiterMyJobs = lazy(() => import('./pages/RecruiterMyJobs.jsx'));
const RecruiterPostJob = lazy(() => import('./pages/RecruiterPostJob.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const AdminGlossary = lazy(() => import('./pages/AdminGlossary.jsx'));
const JobSearch = lazy(() => import('./pages/JobSearch.jsx'));
const Community = lazy(() => import('./pages/Community.jsx'));
const PrepResources = lazy(() => import('./pages/PrepResources.jsx'));
const JobPreview = lazy(() => import('./pages/JobPreview.jsx'));
const SavedJobs = lazy(() => import('./pages/SavedJobs.jsx'));
const Plans = lazy(() => import('./pages/Plans.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));
const Alerts = lazy(() => import('./pages/Alerts.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminCenter = lazy(() => import('./pages/AdminCenter.jsx'));
const OwnerUsers = lazy(() => import('./pages/OwnerUsers.jsx'));
const OwnerJobs = lazy(() => import('./pages/OwnerJobs.jsx'));
const OwnerAudit = lazy(() => import('./pages/OwnerAudit.jsx'));
const PostJobPage = lazy(() => import('./pages/PostJobPage.jsx'));

function RequireRole({ role, children }) {
  const u = auth.me()
  if (!u) return <Navigate to="/login" replace />
  const effRole = (u.role === 'admin' && u.email !== OWNER_EMAIL) ? 'employer' : u.role
  const ok = Array.isArray(role) ? role.includes(effRole) : effRole === role
  return ok ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <Navbar />
        <div className="container-p">
          <RouteMeta />
          <div id="app-health" style={{ position: 'absolute', left: -9999, top: -9999 }}>ok</div>
          <Suspense fallback={<div style={{ padding: '24px' }}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ NEW */}
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Candidate */}
              <Route path="/candidate" element={<RequireRole role="candidate"><CandidateDashboard /></RequireRole>} />
              <Route path="/candidate/applications" element={<RequireRole role="candidate"><CandidateApplications /></RequireRole>} />
              <Route path="/candidate/saved" element={<RequireRole role="candidate"><CandidateSaved /></RequireRole>} />
              <Route path="/candidate/alerts" element={<RequireRole role="candidate"><CandidateAlerts /></RequireRole>} />
              <Route path="/candidate/analytics" element={<RequireRole role="candidate"><CandidateAnalytics /></RequireRole>} />
              <Route path="/candidate/profile" element={<RequireRole role="candidate"><CandidateProfile /></RequireRole>} />
              <Route path="/candidate/booking" element={<RequireRole role="candidate"><CandidateBooking /></RequireRole>} />

              {/* Employer/Recruiter */}
              <Route path="/employer" element={<RequireRole role={['employer', 'recruiter', 'admin']}><EmployerDashboard /></RequireRole>} />
              <Route path="/recruiter/jobs" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterJobsRollup /></RequireRole>} />
              <Route path="/recruiter/pipeline" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterPipeline /></RequireRole>} />
              <Route path="/recruiter/analytics" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterAnalyticsPro /></RequireRole>} />
              <Route path="/recruiter/settings" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterSettings /></RequireRole>} />
              <Route path="/recruiter/candidates" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterCandidates /></RequireRole>} />
              <Route path="/recruiter/schedule" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterSchedule /></RequireRole>} />
              <Route path="/recruiter/my-jobs" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterMyJobs /></RequireRole>} />
              <Route path="/recruiter/post" element={<RequireRole role={['employer', 'recruiter', 'admin']}><RecruiterPostJob /></RequireRole>} />

              {/* Messaging & notifications */}
              <Route path="/messages" element={<RequireRole role={['candidate', 'employer', 'recruiter', 'admin']}><Messages /></RequireRole>} />
              <Route path="/notifications" element={<RequireRole role={['candidate', 'employer', 'recruiter', 'admin']}><Notifications /></RequireRole>} />

              {/* Public / misc */}
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/jobs/:id" element={<JobPreview />} />
              <Route path="/community" element={<Community />} />
              <Route path="/prep" element={<PrepResources />} />
              <Route path="/saved" element={<SavedJobs />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/alerts" element={<Alerts />} />

              {/* Admin / Owner */}
              <Route path="/owner" element={<AdminCenter />} />
              <Route path="/owner/users" element={<OwnerUsers />} />
              <Route path="/owner/jobs" element={<OwnerJobs />} />
              <Route path="/owner/audit" element={<OwnerAudit />} />
              <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
              <Route path="/admin/users" element={<RequireOwner><OwnerUsers /></RequireOwner>} />
              <Route path="/admin/jobs" element={<RequireOwner><OwnerJobs /></RequireOwner>} />
              <Route path="/admin/audit" element={<RequireOwner><OwnerAudit /></RequireOwner>} />
              <Route path="/admin/glossary" element={<RequireRole role="admin"><AdminGlossary /></RequireRole>} />
              <Route path="/jobs/post" element={<PostJobPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}
