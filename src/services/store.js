// Shared store utilities for HireHorizonHub
//
// This module exposes a handful of helpers for reading and writing
// values to localStorage as well as lightweight authentication
// and notification helpers.  All premium or credit‑related logic
// has been removed to simplify the project and make every feature
// accessible without an upgrade.

import { useEffect, useState } from "react";
import { OWNER_EMAIL, OWNER_DEFAULT_PASSWORD } from "../config/owner";
import { commAuth } from "./communityBridge";

// --- Community backend bridge for auth ---
function setSessionFromBackend(u) {
  try {
    localStorage.setItem("uid", u && u.id ? u.id : "");
  } catch (e) {}
  if (u && u.email) {
    write("hh_user", {
      email: u.email,
      name: u.name || u.email.split("@")[0],
      role: u.role || "candidate",
      company: u.company || "",
    });
  }
}
export function loginWithCommunity({ email, password }) {
  if (!commAuth.enabled()) return null;
  return commAuth.login(email, password).then((res) => {
    if (res && res.user) {
      setSessionFromBackend(res.user);
      return res.user;
    }
    throw new Error(res && res.error ? res.error : "Login failed");
  });
}
export function registerWithCommunity({
  name,
  email,
  password,
  role = "candidate",
  company = "",
}) {
  if (!commAuth.enabled()) return null;
  return commAuth
    .register({ name, email, password, role, company })
    .then((res) => {
      if (res && res.user) {
        setSessionFromBackend(res.user);
        return res.user;
      }
      throw new Error(res && res.error ? res.error : "Register failed");
    });
}
export function meFromCommunity() {
  if (!commAuth.enabled()) return Promise.resolve(null);
  return commAuth.me().then((res) => (res && res.user ? res.user : null));
}
// -----------------------------------------------------------------------------
// Local storage helpers
//
// Safely read a JSON value from localStorage.  If the key does not exist or
// parsing fails, return the provided fallback value instead of throwing an
// exception.  Values are stored as JSON strings.
export function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

// Safely write a JSON value to localStorage.  If an exception is thrown
// (e.g. storage quota exceeded) the error is silently ignored.
export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

// -----------------------------------------------------------------------------
// Authentication helpers
//
// The `auth` object provides a minimal API for reading the current user
// (stored under the `hh_user` key) and logging in/out of the demo.  A real
// application would call a back‑end service here; for this demo we simply
// persist the user in localStorage.
export const auth = {
  /**
   * Return the current user object or null if not signed in.  A user has
   * shape: { role: 'candidate'|'employer'|'admin', email: string, name: string, company?: string }
   */
  me() {
    return read("hh_user", null);
  },
  /**
   * Create a new user session.  Supply at least a role and email.  If name or
   * company are omitted sensible defaults are chosen.  Returns the user
   * object for convenience.
   */
  login({ role = "candidate", email, name, company } = {}) {
    // enforce admin lock at session time too
    if (role === "admin" && email !== OWNER_EMAIL) {
      role = "employer";
    }
    const user = {
      role,
      email: email || `${role}@example.com`,
      name:
        name ||
        (role === "employer"
          ? "Demo Recruiter"
          : role === "admin"
          ? "Admin"
          : "Demo Candidate"),
      company: company || (role === "employer" ? "DemoCo" : ""),
    };
    write("hh_user", user);
    return user;
  },
  /**
   * Remove the current user session.
   */
  logout() {
    try {
      localStorage.removeItem("hh_user");
      localStorage.removeItem("profilePopSkipped");
    } catch (e) {
      // ignore
    }
  },
};

// Re‑export login/logout functions for convenience when destructuring
export const login = (opts) => auth.login(opts);
export const logout = () => auth.logout();

// -----------------------------------------------------------------------------
// Account management
//
// Basic helpers for creating and authenticating user accounts.  Accounts are
// stored as a dictionary under the `hh_accounts` key keyed by email.  Each
// entry has shape: { email, password, role, name, company }.  Additional
// information for a candidate (location, skills, phone, summary) is stored
// separately via candidateApi.saveProfile().  Recruiter company branding is
// stored via RecruiterSettings using user‑scoped keys.

/**
 * Create a new account with the given details.  If an account with the
 * provided email already exists this function throws an error.  The
 * password is stored in plain text for the demo; a real implementation
 * should hash passwords before persisting them.
 *
 * @param {Object} opts
 * @param {string} opts.email The email (username) for the new account
 * @param {string} opts.password The account password
 * @param {string} opts.role The user role (candidate|employer|admin)
 * @param {string} opts.name The display name
 * @param {string} [opts.company] The company name (for employers)
 * @returns {Object} The created account object
 */
export function createAccount({
  email,
  password,
  role = "candidate",
  name,
  company = "",
} = {}) {
  const accounts = read("hh_accounts", {}) || {};
  if (!email || !password) throw new Error("Email and password are required");
  if (accounts[email]) throw new Error("Account already exists");
  // Enforce admin ownership
  if (role === "admin" && email !== OWNER_EMAIL) {
    throw new Error(`Admin role is reserved for ${OWNER_EMAIL}`);
  }
  if (email === OWNER_EMAIL) {
    role = "admin";
  }
  const acc = { email, password, role, name, company };
  accounts[email] = acc;
  write("hh_accounts", accounts);
  return acc;
}

/**
 * Authenticate an existing account given an email and password.  Returns
 * the account object if the credentials match or null otherwise.  The
 * password comparison is case sensitive.
 *
 * @param {Object} opts
 * @param {string} opts.email The account email
 * @param {string} opts.password The account password
 * @returns {Object|null} The account object or null on failure
 */
export function authenticateAccount({ email, password } = {}) {
  const accounts = read("hh_accounts", {}) || {};
  const acc = accounts[email];
  if (!acc || acc.password !== password) return null;
  // admin lock: correct role if needed
  if (acc.role === "admin" && acc.email !== OWNER_EMAIL) {
    acc.role = "employer";
    accounts[email] = acc;
    write("hh_accounts", accounts);
  }
  return acc;
}

// -----------------------------------------------------------------------------
// Premium/credits stubs
//
// Earlier versions of this demo included a paid plan and credit system.  Those
// have been removed.  These stubs remain only so that pages importing
// premium/credits continue to function without throwing errors.  All stubs
// return harmless defaults.

/**
 * Premium stub.  Always reports disabled.  The returned object matches the
 * previous API with an `isEnabled()` method and a `set()` method.  The
 * `set` method does nothing and always returns false.
 */
export const premium = {
  isEnabled: () => false,
  /**
   * Pretend to set premium on/off.  Returns false to indicate premium is
   * disabled.  Accepts any argument for backward compatibility.
   */
  set: () => false,
};

/**
 * Plans stub.  No available plans remain now that billing has been removed.
 */
export const plans = [];

/**
 * Always return zero credits.  Credits are unused in the simplified build.
 */
export function getCredits() {
  return 0;
}

/**
 * Add credits (no‑op).  Returns zero to satisfy callers.
 */
export function addCredits(n) {
  return 0;
}

/**
 * A hook that returns a credits state and setter.  The setter does
 * nothing.  This signature allows pages to destructure the result without
 * worrying about undefined.  The return value matches `[credits, setCredits]`.
 */
export function useCredits() {
  const [credits, setCredits] = useState(0);
  // update the state whenever the storage changes (no effect in practice)
  useEffect(() => {
    const handler = () => setCredits(0);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return [credits, () => {}];
}

/**
 * Placeholder for deducting credits.  Returns zero and performs no action.
 */
export function deductCredits(n = 1) {
  return 0;
}

/**
 * Placeholder for setting a plan.  Always returns null.
 */
export function setPlan(planId = "free") {
  return null;
}

/**
 * Placeholder for the old credit check helper.  Always returns success.
 */
export function requireCreditOrPremium(cost = 1) {
  return { ok: true, premium: false };
}

// -----------------------------------------------------------------------------
// Notification helper
//
// Add a notification object to a local queue stored in `hh_notifications` and
// return the newly created object.  Notifications are purely local and are
// used to simulate messaging admins when certain actions occur (e.g.
// connecting in the community).

export function notify({
  to = "admin",
  title = "",
  body = "",
  meta = {},
} = {}) {
  const logs = read("hh_notifications", []) || [];
  logs.unshift({
    id: Date.now(),
    ts: new Date().toISOString(),
    to,
    title,
    body,
    meta,
  });
  write("hh_notifications", logs);
  return logs[0];
}
export function remove(k) {
  try {
    localStorage.removeItem(k);
  } catch (e) {}
}

// Seed default owner admin account if missing (local-only)
try {
  const accs = read("hh_accounts", {}) || {};
  if (OWNER_EMAIL && !accs[OWNER_EMAIL]) {
    accs[OWNER_EMAIL] = {
      email: OWNER_EMAIL,
      password: OWNER_DEFAULT_PASSWORD || "admin123",
      role: "admin",
      name: "Owner Admin",
      company: "",
    };
    write("hh_accounts", accs);
  }
} catch (e) {
  /* ignore */
}
/*__SEED_OWNER__*/

export async function authLogin({ email, password }) {
  if (commAuth.enabled()) {
    const u = await loginWithCommunity({ email, password });
    return u;
  }
  const u = authenticateAccount({ email, password });
  if (!u) throw new Error("Invalid email or password");
  write("hh_user", u);
  return u;
}
export async function authRegister({
  name,
  email,
  password,
  role = "candidate",
  company = "",
}) {
  if (commAuth.enabled()) {
    const u = await registerWithCommunity({
      name,
      email,
      password,
      role,
      company,
    });
    return u;
  }
  const u = createAccount({ email, password, role, name, company });
  write("hh_user", u);
  return u;
}
