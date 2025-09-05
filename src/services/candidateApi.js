import { notify } from "./notify";
import { read, write, auth } from "./store";
// Helpers for per‑user storage.  Profiles, saved jobs and alerts are keyed
// by the current user’s email so that each candidate has isolated data.
const profileKey = (email) => "hh_cand_profile_" + email;
const SAVED_KEY = "hh_saved";
const ALERTS_KEY = "hh_alerts";
const APPS_KEY = "hh_apps";
const RESUME_KEY = (email) => "hh_resume_profile_" + email;

export const candidateApi = {
  me() {
    return auth.me();
  },
  profile() {
    // Each candidate has their own profile stored under a unique key derived
    // from their email.  If no profile exists, fall back to defaults or
    // values from the current auth session.  The resume preview is loaded
    // separately via RESUME_KEY.
    const u = auth.me() || {};
    const email = u.email || "candidate@example.com";
    const stored = read(profileKey(email), null);
    if (stored) return stored;
    return {
      name: u.name || "Demo Candidate",
      title: "Software Engineer",
      skills: u.skills || ["react", "javascript"],
      location: u.location || "Bengaluru",
      phone: u.phone || "",
      email: email,
      summary: u.summary || "",
      resumeSrc: read(RESUME_KEY(email), ""),
      profilePercent: 50,
    };
  },
  saveProfile(p) {
    const u = auth.me() || {};
    const email = u.email || "candidate@example.com";
    write(profileKey(email), p);
  },
  setResume(src) {
    const e = auth.me()?.email || "candidate@example.com";
    write(RESUME_KEY(e), src);
    const p = this.profile();
    p.resumeSrc = src;
    this.saveProfile(p);
  },
  savedJobs() {
    const e = auth.me()?.email || "candidate@example.com";
    const all = read(SAVED_KEY, {});
    return all[e] || [];
  },
  toggleSave(job) {
    const e = auth.me()?.email || "candidate@example.com";
    const all = read(SAVED_KEY, {});
    const arr = new Set(all[e] || []);
    if (arr.has(job.id)) arr.delete(job.id);
    else arr.add(job.id);
    all[e] = Array.from(arr);
    write(SAVED_KEY, all);
  },
  alerts() {
    const e = auth.me()?.email || "candidate@example.com";
    const all = read(ALERTS_KEY, {});
    return all[e] || [];
  },
  addAlert(a) {
    const e = auth.me()?.email || "candidate@example.com";
    const all = read(ALERTS_KEY, {});
    all[e] = [a, ...(all[e] || [])];
    write(ALERTS_KEY, all);
  },
  applications() {
    const e = auth.me()?.email || "candidate@example.com";
    const apps = read(APPS_KEY, {});
    const rows = [];
    Object.entries(apps).forEach(([jid, list]) =>
      list.forEach((a) => {
        if (a.email === e)
          rows.push({ jobId: jid, status: a.status || "applied" });
      })
    );
    return rows;
  },
  apply(job) {
    const e = auth.me()?.email || "candidate@example.com";
    const p = this.profile();
    if (!p.resumeSrc || !(p.skills && p.skills.length > 0)) {
      throw new Error("Please upload a resume and add skills before applying.");
    }
    const apps = read(APPS_KEY, {});
    const arr = apps[job.id] || [];
    if (arr.find((a) => a.email === e)) {
      throw new Error("Already applied to this job.");
    }
    const cand = { name: p.name, skills: p.skills };
    arr.push({ email: e, status: "applied", candidate: cand });
    try {
      if (job && job.ownerEmail) {
        notify.push(job.ownerEmail, {
          type: "application",
          title: `New application · ${job.title}`,
          body: `${p.name} applied to your job`,
          link: "/recruiter/candidates",
        });
      }
    } catch (e) {}
    apps[job.id] = arr;
    write(APPS_KEY, apps);
    return true;
  },
};
