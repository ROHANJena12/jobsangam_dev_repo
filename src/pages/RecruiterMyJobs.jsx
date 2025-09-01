import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { recruiterApi } from "../services/recruiterApi";
import { read, auth } from "../services/store";
import JobEditor from "../components/JobEditor.jsx";
import ApplicantsInline from "../components/ApplicantsInline.jsx";

function Stat({label, value}){
  return (
    <div className="card" style={{padding:12, background:"#0f172a", border:"1px solid #1f2530"}}>
      <div style={{opacity:.8, fontSize:12}}>{label}</div>
      <div className="h2" style={{margin:0}}>{value}</div>
    </div>
  );
}

function JobRow({ j, onView, onEdit, onClone, onArchive, onDelete, appsCount, expanded, onToggleApplicants }){
  return (
    <div className="card" style={{padding:12, background:"#0f172a", border:"1px solid #1f2530"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:12}}>
        <div>
          <div className="h2" style={{margin:0}}>
            {j.title} {j.featured && <span style={{marginLeft:6, fontSize:12, background:"#10b981", color:"#031b16", padding:"2px 6px", borderRadius:8}}>Featured</span>}
          </div>
          <div style={{fontSize:12, opacity:.8}}>{j.company} · {j.location} · {j.type} · {j.salary}</div>
          <div style={{fontSize:12, opacity:.7}}>Created {new Date(j.createdAt || j.postedAt).toLocaleString()} · Views {j.views || 0}</div>
        </div>
        <div style={{display:"flex", gap:6, alignItems:"center"}}>
          <button className="btn-ghost" onClick={function(){ onView(j); }}>View</button>
          <button className="btn-ghost" onClick={function(){ onEdit(j); }}>Edit</button>
          <button className="btn-ghost" onClick={function(){ window.alert("Shareable URL copied (demo)."); }}>Share</button>
          <button className="btn-ghost" onClick={function(){ onClone(j); }}>Clone</button>
          <button className="btn-ghost" onClick={function(){ onArchive(j); }}>{j.archived ? "Re-open" : "Close"}</button>
          <button className="btn-ghost" onClick={function(){ onDelete(j); }} style={{color:"#ef4444"}}>Delete</button>
          <div
            onClick={onToggleApplicants}
            style={{
              cursor: "pointer",
              opacity: 0.8,
              fontSize: 12,
              marginLeft: 6
            }}
          >
            Applicants: <b>{appsCount}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterMyJobs(){
  const me = auth.me();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [forceRefresh, setForceRefresh] = useState(0);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);

  
  const jobs = useMemo(function(){
    const all = recruiterApi.allJobs();
    const myEmail = (me && me.email ? me.email : '').toLowerCase();
    const myCompany = (me && me.company ? String(me.company) : '').trim().toLowerCase();
    return all.filter(function(j){
      const owner = (j.ownerEmail || '').toLowerCase();
      const company = (j.company ? String(j.company) : '').trim().toLowerCase();
      return (owner && owner === myEmail) || (myCompany && company === myCompany);
    });
  }, [me, forceRefresh]);
const appsMap = read("hh_apps", {}) || {};

  const filtered = useMemo(function(){
    const qq = q.toLowerCase();
    return jobs.filter(function(j){
      const hay = [j.title, j.company, j.location, j.type, j.salary, (j.tags || []).join(" ")].join(" ").toLowerCase();
      return hay.indexOf(qq) !== -1;
    });
  }, [jobs, q]);

  function onView(j){
    nav("/job/" + j.id);
  }
  function onEdit(j){
    setEditing(j);
  }
  function onClone(j){
    recruiterApi.cloneJob(j.id);
    setForceRefresh(function(v){ return v + 1; });
  }
  function onArchive(j){
    recruiterApi.toggleArchive(j.id);
    setForceRefresh(function(v){ return v + 1; });
  }
  function onDelete(j){
    if(!confirm("Delete this job? This cannot be undone.")) return;
    recruiterApi.deleteJob(j.id);
    setForceRefresh(function(v){ return v + 1; });
  }

  const totalViews = jobs.reduce(function(s, j){ return s + (j.views || 0); }, 0);
  const totalApps  = jobs.reduce(function(s, j){ return s + ((appsMap[j.id] || []).length); }, 0);

  return (
    <div className="container-p" style={{padding:"24px 0", background:"#0b1220", color:"#e5e7eb", minHeight:"100vh"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h1 className="h2" style={{margin:0}}>My Jobs</h1>
        <Link className="btn" to="/recruiter/post">Post a Job</Link>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:12, margin:"12px 0"}}>
        <Stat label="Open Jobs" value={jobs.filter(function(j){ return !j.archived; }).length} />
        <Stat label="Total Applicants" value={totalApps} />
        <Stat label="Total Views" value={totalViews} />
      </div>

      <div className="card" style={{padding:12, background:"#0f172a", border:"1px solid #1f2530", display:"flex", gap:8, alignItems:"center"}}>
        <input
          className="input"
          placeholder="Search by title, company, location, tag..."
          value={q}
          onChange={function(e){ setQ(e.target.value); }}
          style={{flex:1, background:"#0b1220", color:"#e5e7eb", border:"1px solid #1f2530"}}
        />
      </div>

      <div style={{display:"grid", gap:8, marginTop:12}}>
        {filtered.length===0 ? (
          <div style={{opacity:.8}}>No jobs found.</div>
        ) : (
          filtered.map(function(j){
            return (
              <div>
                <JobRow
                key={j.id}
                j={j}
                appsCount={(appsMap[j.id] || []).length}
                onView={onView}
                onEdit={onEdit}
                onClone={onClone}
                onArchive={onArchive}
                onDelete={onDelete}
                  expanded={expanded===j.id}
                  onToggleApplicants={()=> setExpanded(expanded===j.id?null:j.id)}
              />
                {expanded===j.id && (
                  <ApplicantsInline job={j} />
                )}
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <JobEditor
          job={editing}
          onClose={function(){ setEditing(null); }}
          onSaved={function(){ setForceRefresh(function(v){ return v + 1; }); }}
        />
      )}
    </div>
  );
}
