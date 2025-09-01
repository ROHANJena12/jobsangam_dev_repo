import React from 'react'
import { candidateApi } from '../services/candidateApi'
import { recruiterApi } from '../services/recruiterApi'
export default function SavedJobs(){
  const saved = candidateApi.savedJobs()
  const jobs = recruiterApi.allJobs().filter(j=> saved.includes(j.id))
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Saved Jobs</h1>
    <div style={{display:'grid', gap:8}}>
      {jobs.map(j=>(<div key={j.id} className="card" style={{padding:12}}>
        <div className="h2" style={{margin:0}}>{j.title}</div>
        <div style={{fontSize:12,opacity:.7}}>{j.company} · {j.location} · {j.type} · {j.salary}</div>
      </div>))}
      {jobs.length===0 && <div style={{opacity:.7}}>Nothing saved yet.</div>}
    </div>
  </div>
}
