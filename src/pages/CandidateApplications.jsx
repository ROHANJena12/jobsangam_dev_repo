import React from 'react'
import { candidateApi } from '../services/candidateApi'
import { recruiterApi } from '../services/recruiterApi'
export default function CandidateApplications(){
  const apps = candidateApi.applications()
  const jobs = recruiterApi.allJobs()
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">My Applications</h1>
    <div className="card" style={{padding:0, overflowX:'auto'}}>
      <table className="table" style={{width:'100%'}}>
        <thead><tr><th>Job</th><th>Company</th><th>Location</th><th>Status</th></tr></thead>
        <tbody>
          {apps.map((a,i)=>{ const j=jobs.find(x=>x.id===a.jobId)||{}; return <tr key={i}><td>{j.title}</td><td>{j.company}</td><td>{j.location}</td><td className="capitalize">{a.status}</td></tr> })}
          {apps.length===0 && <tr><td colSpan="4" style={{opacity:.7}}>No applications yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
}
