import React from 'react'
import { recruiterApi } from '../services/recruiterApi'
const COURSES=[
  { id:'c1', title:'Mastering React for Production', by:'CodeGurus', url:'#', price:'₹1,999', sponsor:true, tag:'react' },
  { id:'c2', title:'Advanced SQL for Analytics', by:'DataCraft', url:'#', price:'₹1,499', sponsor:true, tag:'sql' },
  { id:'c3', title:'TypeScript Essentials', by:'DevUp', url:'#', price:'₹1,299', sponsor:true, tag:'typescript' },
]
export default function JobDetailModal({job, candidateSkills=[], onClose}){
  if(!job) return null
  const jt=(job.tags||[]).map(s=>s.toLowerCase())
  const cs=(candidateSkills||[]).map(s=>s.toLowerCase())
  const missing = jt.filter(s=> !cs.includes(s))
  const score = recruiterApi.computeRelevancy? recruiterApi.computeRelevancy(job, {skills:candidateSkills}) : 0
  const rec = COURSES.filter(c=> missing.includes(c.tag))
  return (
    <div className="nav" style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.4)'}}>
      <div className="card" style={{padding:16, maxWidth:720, width:'92%'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="h2">{job.title}</div>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
        {/* Basic job details */}
        <div style={{fontSize:12,opacity:.7}}>{job.company} · {job.location} · {job.type} · {job.salary}</div>
        {/* Optional company tagline */}
        {job.tagline && <div style={{fontSize:14, opacity:.8, fontStyle:'italic', marginTop:4}}>{job.tagline}</div>}
        {/* Description and company long description */}
        <div style={{marginTop:8}}>{job.description}</div>
        {job.companyDesc && <div style={{marginTop:6}}>{job.companyDesc}</div>}
        {/* Website link */}
        {job.website && <div style={{fontSize:12, opacity:.8, marginTop:4}}><b>Website:</b> <a href={job.website} target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>{job.website}</a></div>}
        {/* Tags */}
        <div style={{fontSize:12,opacity:.7, marginTop:6}}>Tags: {(job.tags||[]).join(', ')}</div>
        {/* Company image gallery */}
        {Array.isArray(job.companyImages) && job.companyImages.length>0 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:8, marginTop:8}}>
            {job.companyImages.map((src,i) => <img key={i} src={src} alt="Company" style={{width:80, height:80, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)'}} /> )}
          </div>
        )}
        {/* Match score and recommended courses */}
        <div className="card" style={{padding:12, marginTop:12}}>
          <div><b>Match score:</b> {score}%</div>
          {missing.length>0 ? <div style={{marginTop:6}}>
            <div><b>Missing skills:</b> {missing.join(', ')}</div>
            <div style={{fontSize:12,opacity:.8, marginTop:6}}>Recommended (sponsored):</div>
            <div style={{display:'grid', gap:8, marginTop:6}}>
              {rec.map(c=>(<div key={c.id} className="card" style={{padding:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={{fontWeight:600}}>{c.title}</div><div style={{fontSize:12,opacity:.7}}>{c.by}</div></div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:12,opacity:.7}}>{c.price}</span><a className="btn-ghost" href={c.url} target="_blank" rel="noreferrer">View</a></div>
                </div>
              </div>))}
            </div>
          </div> : <div style={{marginTop:6}}><b>You cover all required skills 🎉</b></div>}
        </div>
      </div>
    </div>
  )
}
