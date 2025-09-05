import React, { useState } from "react";
import { candidateApi } from "../services/candidateApi";
import SearchableSelect from "../components/SearchableSelect";
import { SKILLS } from "../data/glossary";

export default function CandidateProfile() {
  const [p, setP] = useState(() => {
    const base = candidateApi.profile();
    return {
      ...base,
      experience: base.experience || "",
      designation: base.designation || base.title || "",
      skills: Array.isArray(base.skills) ? base.skills : [],
      employment: Array.isArray(base.employment) ? base.employment : [],
      education: base.education || {
        x: { board: "", year: "", percentage: "" },
        xii: { board: "", year: "", percentage: "" },
        higher: [],
      },
      projects: Array.isArray(base.projects) ? base.projects : [],
      links: Array.isArray(base.links) ? base.links : [],
      profilePic: base.profilePic || "",
    };
  });

  // Profile completeness calculation
  const completeness = (() => {
    let score = 0;
    if (p.name) score += 10;
    if (p.profilePic) score += 10;
    if (p.skills && p.skills.length) score += 15;
    if (p.resumeSrc) score += 15;
    if (p.summary) score += 10;
    if (p.experience) score += 5;
    if (p.designation) score += 5;
    if (p.location) score += 5;
    if (p.phone) score += 5;
    if (p.email) score += 5;
    if (p.employment && p.employment.length) score += 5;
    if (p.education && (p.education.x?.board || p.education.xii?.board || (p.education.higher && p.education.higher.length))) score += 5;
    if (p.projects && p.projects.length) score += 5;
    if (p.links && p.links.length) score += 5;
    return Math.min(100, score);
  })();

  function save() {
    candidateApi.saveProfile(p);
    alert("Profile saved");
  }
  function onResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      candidateApi.setResume(ev.target.result);
      setP({ ...p, resumeSrc: ev.target.result });
      alert("Resume uploaded");
    };
    reader.readAsDataURL(file);
  }
  function printResume() {
    window.print();
  }

  function onProfilePic(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setP({ ...p, profilePic: ev.target.result });
    };
    reader.readAsDataURL(file);
  }

  function updateEmployment(idx, key, val) {
    const next = (p.employment || []).slice();
    next[idx] = { ...(next[idx] || { title: "", details: "" }), [key]: val };
    setP({ ...p, employment: next });
  }
  function addEmployment() {
    setP({
      ...p,
      employment: [...(p.employment || []), { title: "", details: "" }],
    });
  }
  function removeEmployment(i) {
    const next = (p.employment || []).slice();
    next.splice(i, 1);
    setP({ ...p, employment: next });
  }

  function updateHigher(idx, key, val) {
    const next = (p.education?.higher || []).slice();
    next[idx] = {
      ...(next[idx] || { degree: "", institute: "", year: "", details: "" }),
      [key]: val,
    };
    setP({ ...p, education: { ...(p.education || {}), higher: next } });
  }
  function addHigher() {
    setP({
      ...p,
      education: {
        ...(p.education || {}),
        higher: [
          ...(p.education?.higher || []),
          { degree: "", institute: "", year: "", details: "" },
        ],
      },
    });
  }
  function removeHigher(i) {
    const next = (p.education?.higher || []).slice();
    next.splice(i, 1);
    setP({ ...p, education: { ...(p.education || {}), higher: next } });
  }

  function updateProject(idx, key, val) {
    const next = (p.projects || []).slice();
    next[idx] = { ...(next[idx] || { title: "", details: "" }), [key]: val };
    setP({ ...p, projects: next });
  }
  function addProject() {
    setP({
      ...p,
      projects: [...(p.projects || []), { title: "", details: "" }],
    });
  }
  function removeProject(i) {
    const next = (p.projects || []).slice();
    next.splice(i, 1);
    setP({ ...p, projects: next });
  }

  function updateLink(idx, key, val) {
    const next = (p.links || []).slice();
    next[idx] = { ...(next[idx] || { title: "", url: "" }), [key]: val };
    setP({ ...p, links: next });
  }
  function addLink() {
    setP({ ...p, links: [...(p.links || []), { title: "", url: "" }] });
  }
  function removeLink(i) {
    const next = (p.links || []).slice();
    next.splice(i, 1);
    setP({ ...p, links: next });
  }

  return (
    <div
      className="container-p"
      style={{ padding: "32px 0", maxWidth: 1100, margin: "0 auto" }}
    >
      <h1 className="h2" style={{ marginBottom: 24, textAlign: "center" }}>
        Edit Profile
      </h1>

      {/* Profile Completeness Status Bar */}
      <div style={{margin:'0 auto 24px auto', maxWidth:500}}>
        <div style={{fontSize:14, fontWeight:500, marginBottom:4, color:'#2563eb'}}>Profile Completeness: {completeness}%</div>
        <div style={{height:12, background:'#e5e7eb', borderRadius:6, overflow:'hidden'}}>
          <div style={{
            width: `${completeness}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
            transition: 'width 0.4s'
          }} />
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 32,
          margin: "0 auto",
          maxWidth: 900,
          boxShadow: "0 2px 16px #0001",
        }}
      >
        {/* Header: Profile Pic, Name, Designation, Contact */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={p.profilePic || "/user-avatar.svg"}
                alt="Profile"
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #eee",
                  background: "#fafbfc",
                }}
              />
              <label
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "#fff",
                  borderRadius: "50%",
                  border: "1px solid #eee",
                  padding: 4,
                  cursor: "pointer",
                  boxShadow: "0 1px 4px #0001",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={onProfilePic}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: 18 }}>📷</span>
              </label>
            </div>
            <span style={{ fontSize: 12, color: "#888" }}>Profile Picture</span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <input
                className="input"
                placeholder="Name"
                value={p.name || ""}
                onChange={(e) => setP({ ...p, name: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Designation"
                value={p.designation || ""}
                onChange={(e) => setP({ ...p, designation: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <input
                className="input"
                placeholder="Location"
                value={p.location || ""}
                onChange={(e) => setP({ ...p, location: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Experience (e.g., 3 years)"
                value={p.experience || ""}
                onChange={(e) => setP({ ...p, experience: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <input
                className="input"
                placeholder="Phone"
                value={p.phone || ""}
                onChange={(e) => setP({ ...p, phone: e.target.value })}
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Email"
                value={p.email || ""}
                onChange={(e) => setP({ ...p, email: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Skills & Summary */}
        <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label style={{fontWeight:500, marginBottom:4, color:'#222'}}>Key Skills</label>
            <SearchableSelect
              options={SKILLS}
              value={p.skills || []}
              onChange={(vals) => setP({ ...p, skills: vals })}
              placeholder="Select skills"
              multi
              style={{ minHeight: 44 }}
            />
          </div>
          <textarea
            className="input"
            placeholder="Summary"
            value={p.summary || ""}
            onChange={(e) => setP({ ...p, summary: e.target.value })}
            style={{ flex: 2, minHeight: 44, resize: "vertical" }}
          />
        </div>

        {/* Resume Upload & Preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <label className="btn-ghost">
            Upload Resume
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={onResume}
              style={{ display: "none" }}
            />
          </label>
          {p.resumeSrc && (
            <span style={{ fontSize: 13, color: "#888" }}>Resume uploaded</span>
          )}
        </div>
        {p.resumeSrc && (
          <div
            className="card"
            style={{ padding: 12, marginBottom: 32, background: "#f8fafc" }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Resume Preview
            </div>
            <div
              style={{
                height: 300,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {p.resumeSrc.startsWith("data:application/pdf") ? (
                <iframe
                  src={p.resumeSrc}
                  title="Resume"
                  style={{ width: "100%", height: "100%", border: 0 }}
                />
              ) : (
                <img
                  src={p.resumeSrc}
                  alt="Resume"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Employment */}
        <Section title="Employment">
          {(p.employment || []).map((job, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: 16, margin: "12px 0", background: "#f9fafb" }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  className="input"
                  placeholder="Title (e.g., Software Engineer @ Company)"
                  value={job.title || ""}
                  onChange={(e) => updateEmployment(i, "title", e.target.value)}
                  style={{ flex: 2 }}
                />
                <button
                  className="btn-ghost"
                  style={{ fontSize: 13, padding: "4px 12px" }}
                  onClick={() => removeEmployment(i)}
                >
                  Remove
                </button>
              </div>
              <textarea
                className="input"
                placeholder="Details / responsibilities"
                value={job.details || ""}
                onChange={(e) => updateEmployment(i, "details", e.target.value)}
                style={{ marginTop: 8, minHeight: 60 }}
              />
            </div>
          ))}
          <button
            className="btn"
            style={{ fontSize: 13, padding: "6px 18px" }}
            onClick={addEmployment}
          >
            Add Employment
          </button>
        </Section>

        {/* Education */}
        <Section title="Education">
          {/* Higher Studies first */}
          <div className="card" style={{ padding: 12, margin: "8px 0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Higher Studies
            </div>
            {(p.education?.higher || []).map((h, i) => (
              <div
                key={i}
                className="card"
                style={{ padding: 12, margin: "8px 0" }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input"
                    placeholder="Degree (e.g., B.Tech Computer Science)"
                    value={h.degree || ""}
                    onChange={(e) => updateHigher(i, "degree", e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <input
                    className="input"
                    placeholder="Institute"
                    value={h.institute || ""}
                    onChange={(e) =>
                      updateHigher(i, "institute", e.target.value)
                    }
                    style={{ flex: 2 }}
                  />
                  <input
                    className="input"
                    placeholder="Year"
                    value={h.year || ""}
                    onChange={(e) => updateHigher(i, "year", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 13, padding: "4px 12px" }}
                    onClick={() => removeHigher(i)}
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  className="input"
                  placeholder="Details (optional)"
                  value={h.details || ""}
                  onChange={(e) => updateHigher(i, "details", e.target.value)}
                  style={{ marginTop: 8, minHeight: 40 }}
                />
              </div>
            ))}
            <button
              className="btn"
              style={{ fontSize: 13, padding: "6px 18px", margin: "7px" }}
              onClick={addHigher}
            >
              Add Higher Study
            </button>
          </div>
          {/* XIIth next */}
          <div className="card" style={{ padding: 12, margin: "8px 0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>XIIth</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="input"
                placeholder="Board"
                value={p.education?.xii?.board || ""}
                onChange={(e) =>
                  setP({
                    ...p,
                    education: {
                      ...(p.education || {}),
                      xii: {
                        ...(p.education?.xii || {}),
                        board: e.target.value,
                      },
                    },
                  })
                }
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Year"
                value={p.education?.xii?.year || ""}
                onChange={(e) =>
                  setP({
                    ...p,
                    education: {
                      ...(p.education || {}),
                      xii: {
                        ...(p.education?.xii || {}),
                        year: e.target.value,
                      },
                    },
                  })
                }
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Percentage/CGPA"
                value={p.education?.xii?.percentage || ""}
                onChange={(e) =>
                  setP({
                    ...p,
                    education: {
                      ...(p.education || {}),
                      xii: {
                        ...(p.education?.xii || {}),
                        percentage: e.target.value,
                      },
                    },
                  })
                }
                style={{ flex: 1 }}
              />
            </div>
          </div>
          {/* Xth last */}
          <div className="card" style={{ padding: 12, margin: "8px 0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Xth</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="input"
                placeholder="Board"
                value={p.education?.x?.board || ""}
                onChange={(e) =>
                  setP({
                    ...p,
                    education: {
                      ...(p.education || {}),
                      x: { ...(p.education?.x || {}), board: e.target.value },
                    },
                  })
                }
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Year"
                value={p.education?.x?.year || ""}
                onChange={(e) =>
                  setP({
                    ...p,
                    education: {
                      ...(p.education || {}),
                      x: { ...(p.education?.x || {}), year: e.target.value },
                    },
                  })
                }
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Percentage/CGPA"
                value={p.education?.x?.percentage || ""}
                onChange={(e) =>
                  setP({
                    ...p,
                    education: {
                      ...(p.education || {}),
                      x: {
                        ...(p.education?.x || {}),
                        percentage: e.target.value,
                      },
                    },
                  })
                }
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </Section>

        {/* Projects */}
        <Section title="Projects">
          {(p.projects || []).map((proj, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: 12, margin: "8px 0", background: "#f9fafb" }}
            >
              <input
                className="input"
                placeholder="Project Title"
                value={proj.title || ""}
                onChange={(e) => updateProject(i, "title", e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <textarea
                className="input"
                placeholder="Project Details"
                value={proj.details || ""}
                onChange={(e) => updateProject(i, "details", e.target.value)}
                style={{ minHeight: 60 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  className="btn-ghost"
                  style={{ fontSize: 13, padding: "4px 12px" }}
                  onClick={() => removeProject(i)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            className="btn"
            style={{ fontSize: 13, padding: "6px 18px" }}
            onClick={addProject}
          >
            Add Project
          </button>
        </Section>

        {/* Online Links */}
        <Section title="Online Links">
          {(p.links || []).map((lnk, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: 12,
                margin: "8px 0",
                background: "#f9fafb",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                className="input"
                placeholder="Title (e.g., GitHub, Portfolio)"
                value={lnk.title || ""}
                onChange={(e) => updateLink(i, "title", e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                className="input"
                placeholder="Link (https://...)"
                value={lnk.url || ""}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                style={{ flex: 2 }}
              />
              <button
                className="btn-ghost"
                style={{ fontSize: 13, padding: "4px 12px" }}
                onClick={() => removeLink(i)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="btn"
            style={{ fontSize: 13, padding: "6px 18px" }}
            onClick={addLink}
          >
            Add Link
          </button>
        </Section>

        {/* Save Button */}
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
        >
          <button
            className="btn primary"
            style={{ minWidth: 140, fontSize: 15, padding: "8px 24px" }}
            onClick={save}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        className="h3"
        style={{
          marginBottom: 12,
          borderLeft: "4px solid #2563eb",
          paddingLeft: 10,
          fontWeight: 600,
          color: "#2563eb",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
