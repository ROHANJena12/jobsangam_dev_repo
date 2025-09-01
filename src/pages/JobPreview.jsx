
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { recruiterApi } from '../services/recruiterApi';

export default function JobPreview(){
  const { id } = useParams();
  const job = recruiterApi.getJob ? recruiterApi.getJob(id, { bumpViews:true }) : (recruiterApi.allJobs().find(j=>j.id===id) || null);
  if(!job){
    return (
      <div className="container-p" style={{padding:'24px 0'}}>
        <h1 className="h2">Job not found</h1>
        <p style={{opacity:.85}}>This job may have been removed or the link is incorrect.</p>
        <Link className="btn" to="/jobs">Back to Jobs</Link>
      </div>
    );
  }
  return (
    <div className="container-p" style={{padding:'24px 0', background:'#0b1220', color:'#e5e7eb', minHeight:'100vh'}}>
      <div className="card" style={{padding:16, background:'#0f172a', border:'1px solid #1f2530'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1 className="h2" style={{margin:0}}>{job.title}</h1>
          <Link className="btn-ghost" to="/jobs">Back to Jobs</Link>
        </div>
        <div style={{fontSize:12, opacity:.8}}>{job.company} · {job.location} · {job.type} · {job.salary}</div>
        {job.tagline && <div style={{marginTop:6, opacity:.8}}>{job.tagline}</div>}
        <div style={{marginTop:12, whiteSpace:'pre-wrap'}}>{job.description}</div>
        {job.responsibilities && job.responsibilities.length>0 && (
          <div style={{marginTop:12}}>
            <div style={{fontWeight:600}}>Responsibilities</div>
            <ul>{job.responsibilities.map((r,i)=><li key={i}>{r}</li>)}</ul>
          </div>
        )}
        {job.requirements && job.requirements.length>0 && (
          <div style={{marginTop:12}}>
            <div style={{fontWeight:600}}>Requirements</div>
            <ul>{job.requirements.map((r,i)=><li key={i}>{r}</li>)}</ul>
          </div>
        )}
        {job.application && (job.application.url || job.application.email) && (
          <div style={{marginTop:12}}>
            <div style={{fontWeight:600}}>How to apply</div>
            {job.application.url && <div><a className="btn" href={job.application.url} target="_blank" rel="noreferrer">Apply on Company Site</a></div>}
            {job.application.email && <div style={{marginTop:8}}><a className="btn-ghost" href={`mailto:${job.application.email}`}>Email {job.application.email}</a></div>}
          </div>
        )}
      </div>
    </div>
  );
}
