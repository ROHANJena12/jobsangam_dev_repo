import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { notify } from '../services/notify';
import ThemeToggle from './ThemeToggle.jsx';
import { OWNER_EMAIL } from '../config/owner';
import { auth, logout } from '../services/store';

export default function Navbar() {
  const u = auth.me();
  const notifCount = u ? notify.unreadCount(u.email) : 0;
  const nav = useNavigate();
  const loc = useLocation();

  const [ownerOpen, setOwnerOpen] = useState(false);

  // helper: is a path active?
  const isActive = (to) =>
    loc.pathname === to ||
    loc.pathname.startsWith(to + (to.endsWith('/') ? '' : '/'));

  useEffect(() => {
    if (loc.pathname.startsWith('/recruiter/')) {
      try {
        localStorage.setItem('hhh_last_recruiter_path', loc.pathname + (loc.search || ''));
      } catch (e) {}
    }
  }, [loc.pathname, loc.search]);

  useEffect(() => {
    let last = null;
    let t = 0;
    function handler(e) {
      if (!auth.me() || auth.me().role !== 'employer') return;
      const now = Date.now();
      if (now - t > 1200) {
        last = null;
      }
      const k = (e.key || '').toLowerCase();
      if (k === 'g') {
        last = 'g';
        t = now;
        return;
      }
      if (last === 'g' && (k === 'j' || k === 'p')) {
        e.preventDefault();
        if (k === 'j') nav('/recruiter/my-jobs');
        else nav('/recruiter/post-job');
        last = null;
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nav]);

  useEffect(() => {
    function close(e) {
      if (!e.target.closest) return;
      if (!e.target.closest('[aria-haspopup="menu"]') && !e.target.closest('[role="menu"]')) {
        setOwnerOpen(false);
      }
    }
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const link = (to, label, extraClass = 'btn-ghost') => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`${extraClass}${active ? ' active' : ''}`}
        style={{ marginRight: 8 }}
        aria-current={active ? 'page' : undefined}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      className="nav"
      role="navigation"
      aria-label="Primary"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(12,18,32,0.85)',
        backdropFilter: 'saturate(180%) blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="container-p"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 56,
          gap: 12,
          justifyContent: 'space-between',
          margin:'10px'
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/" className="btn-ghost">HireHorizonHub</Link>

          {u?.role === 'candidate' && (
            <>
              {link('/candidate/dashboard', 'Dashboard')}
              {link('/jobs', 'Search')}
              {link('/candidate/applications', 'Applications')}
              {link('/candidate/saved', 'Saved')}
              {link('/candidate/alerts', 'Alerts')}
              {link('/messages', 'Messages')}
              {link('/candidate/analytics', 'Analytics')}
              {link('/candidate/profile', 'Profile')}
              {link('/community', 'Community')}
            </>
          )}

          {u?.role === 'recruiter' && (
            <>
              {link('/recruiter/my-jobs', 'My Jobs')}
              {link('/recruiter/post-job', 'Post a Job')}
              {link('/recruiter/pipeline', 'Pipeline')}
              {link('/recruiter/analytics', 'Analytics')}
              {link('/recruiter/candidates', 'Candidates')}
              {link('/recruiter/schedule', 'Schedule')}
              {link('/recruiter/settings', 'Settings')}
              {link('/messages', 'Messages')}
              {link('/community', 'Community')}
            </>
          )}

          {u && (u.email || '').toLowerCase() === (OWNER_EMAIL || '').toLowerCase() && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn-ghost"
                onClick={() => setOwnerOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={ownerOpen}
              >
                Admin
                <span style={{ marginLeft: 6, opacity: 0.7 }}>▾</span>
              </button>
              {ownerOpen && (
                <div
                  role="menu"
                  className="card"
                  style={{
                    position: 'absolute',
                    top: 40,
                    left: 0,
                    minWidth: 220,
                    padding: 8,
                    display: 'grid',
                    gap: 4,
                    zIndex: 50,
                  }}
                >
                  <a className="btn-ghost" href="/owner">Owner Center</a>
                  <a className="btn-ghost" href="/admin">Admin Dashboard</a>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <a className="btn-ghost" href="/owner/users">Manage Users</a>
                  <a className="btn-ghost" href="/owner/jobs">Job Moderation</a>
                  <a className="btn-ghost" href="/owner/audit">Audit Log</a>
                </div>
              )}
            </div>
          )}

          {!u && (
            <>
              {link('/jobs', 'Browse Jobs')}
              {link('/community', 'Community')}
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {u ? (
            <>
              <span className="btn-ghost" style={{ opacity: 0.8 }}>
                {u.name || 'User'} <span style={{ opacity: 0.6 }}>· {u.role}</span>
              </span>
              <ThemeToggle className="hide-sm" />
              <Link to="/notifications" className="btn-ghost" aria-label="Notifications">
                🔔
                {notifCount > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: '#ef4444',
                    color: '#fff',
                    padding: '0 6px',
                    borderRadius: 999,
                    fontSize: 12,
                  }}>
                    {notifCount}
                  </span>
                )}
              </Link>
              <button className="btn-ghost" onClick={() => {
                logout();
                nav('/');
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <ThemeToggle className="hide-sm" />
              <Link to="/notifications" className="btn-ghost" aria-label="Notifications">🔔</Link>

              {/* Login & Signup with proper highlighting */}
              <Link
                to="/login"
                className={isActive('/login') ? 'btn active' : 'btn-ghost'}
                aria-current={isActive('/login') ? 'page' : undefined}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={isActive('/signup') ? 'btn active' : 'btn-ghost'}
                aria-current={isActive('/signup') ? 'page' : undefined}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
