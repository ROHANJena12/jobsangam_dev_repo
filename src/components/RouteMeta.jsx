import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Lightweight route-based title/description setter for SPA */
export default function RouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const MAP = {
      '/':      { title: 'Home · HHH Recruiter', desc: 'Discover roles, manage applications, and collaborate.' },
      '/login': { title: 'Login · HHH Recruiter', desc: 'Sign in to your account.' },
      '/signup':{ title: 'Sign up · HHH Recruiter', desc: 'Create your account.' },
      '/jobs':  { title: 'Jobs · HHH Recruiter', desc: 'Find and filter job opportunities.' },
      '/community': { title: 'Community · HHH Recruiter', desc: 'Join conversations and share insights.' },
      '/candidate/dashboard': { title: 'Candidate Dashboard', desc: 'Track your applications, alerts, and messages.' },
      '/employer': { title: 'Employer Dashboard', desc: 'Manage candidates, pipeline, and analytics.' }
      // Add more as needed; unknown paths will get a generic title.
    };
    const meta = MAP[pathname] || { title: 'HHH Recruiter', desc: 'Recruiting made simple.' };
    document.title = meta.title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', meta.desc);
  }, [pathname]);
  return null;
}