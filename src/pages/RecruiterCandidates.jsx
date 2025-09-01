import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recruiterApi } from '../services/recruiterApi'
import { downloadCSV } from '../utils/export'
import { read, write } from '../services/store'
import { findOrCreateWith } from '../services/messagesApi'

function CandidateActions({ onProfile, onResume, onStatus, onMessage }){
  const wrap = { display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center', flexWrap:'nowrap' }
  const pill = { borderRadius:999, padding:'6px 10px', fontSize:12, lineHeight:'16px', border:'1px solid #2a2f3a', background:'transparent', whiteSpace:'nowrap', color:'#e5e7eb' }
  const primary = { ...pill, background:'#10b981', color:'#031b16', border:'none' }
  return (
    <div style={wrap}>
      <button className="btn-ghost" style={pill} onClick={onProfile}>Profile</button>
      <button className="btn-ghost" style={pill} onClick={onResume}>Resume</button>
      <button className="btn-ghost" style={pill} onClick={onMessage}>Message</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('shortlisted')}>Shortlist</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('selected')}>Select</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('interview')}>Interview</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('rejected')}>Reject</button>
      <button className="btn" style={primary} onClick={()=>onStatus('hired')}>Hire</button>
    </div>
  )
}

function ProfileModal({ email, onClose }){
  if(!email) return null
  const prof = read('hh_cand_profile_' + email, {}) || {}
  const p = { email, name: prof.name || '', title: prof.title || '', phone: prof.phone || '', location: prof.location || '', skills: prof.skills || [], resumeSrc: prof.resumeSrc }
  const [zoom,setZoom]=React.useState(1)
  const dec=()=>setZoom(z=>Math.max(0.5, +(z-0.1).toFixed(2)))
  const inc=()=>setZoom(z=>Math.min(2, +(z+0.1).toFixed(2)))
  const rst=()=>setZoom(1)
  const download = ()=>{ if(!p.resumeSrc) return; const a=document.createElement('a'); a.href=p.resumeSrc; a.download=(p.name||'resume')+'.pdf'; a.click() }
  return (
    <div className="nav" style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.35)', zIndex:50}}>
      <div className="card" style={{width:'min(1000px, 96vw)', maxHeight:'90vh', overflow:'hidden', padding:0, background:'#0f172a', color:'#e5e7eb', border:'1px solid #1f2530'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid #1f2530'}}>
          <div className="h3">Candidate Profile</div>
          <div style={{display:'flex', gap:8}}>
            {p.resumeSrc && (<>
              <button className="btn-ghost" onClick={dec}>−</button>
              <button className="btn-ghost" onClick={inc}>+</button>
              <button className="btn-ghost" onClick={rst}>Reset</button>
              <button className="btn" onClick={download}>Download</button>
            </>)}
              <button className="btn-ghost" onClick={()=>{ try{ findOrCreateWith(email, `Hi, I’d like to discuss your application.`); nav('/messages'); } catch(e){ alert(e.message) } }}>Message</button>
              
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns: p.resumeSrc ? '1fr 1.5fr' : '1fr', gap:12, padding:12}}>
          <div style={{overflow:'auto'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div><div className="label" style={{color:'#94a3b8'}}>Name</div><div style={{color:'#e5e7eb'}}>{p.name || '—'}</div></div>
              <div><div className="label" style={{color:'#94a3b8'}}>Email</div><div style={{color:'#e5e7eb'}}>{p.email}</div></div>
              <div><div className="label" style={{color:'#94a3b8'}}>Phone</div><div style={{color:'#e5e7eb'}}>{p.phone || '—'}</div></div>
              <div><div className="label" style={{color:'#94a3b8'}}>Location</div><div style={{color:'#e5e7eb'}}>{p.location || '—'}</div></div>
              <div style={{gridColumn:'1/3'}}><div className="label" style={{color:'#94a3b8'}}>Skills</div><div style={{color:'#e5e7eb'}}>{(p.skills||[]).join(', ') || '—'}</div></div>
            </div>
          </div>
          {p.resumeSrc && (
            <div style={{border:'1px solid #1f2530', borderRadius:8, background:'#0b1220', overflow:'auto', position:'relative'}}>
              <div style={{transform:`scale(${zoom})`, transformOrigin:'top left'}}>
                {p.resumeSrc.startsWith('data:application/pdf')
                  ? <iframe title="resume" src={p.resumeSrc} style={{width: `${100/zoom}%`, height: 600, border:0}} />
                  : <img alt="resume" src={p.resumeSrc} style={{width: `${100/zoom}%`, height: 'auto'}} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecruiterCandidates(){
  const nav = useNavigate();
const jobs = recruiterApi.myJobs()
  const [q,setQ]=useState(''); const [status,setStatus]=useState('all')
  const [sel,setSel]=useState({})
  const [profileEmail,setProfileEmail]=useState(null)
  const [version,setVersion]=useState(0)

  const rows = useMemo(()=>{
    let all=[]
    jobs.forEach(j=> recruiterApi.applicants(j.id).forEach(a=> all.push({
      jobId:j.id, job:j.title, email:a.email, name:a.candidate?.name||a.email.split('@')[0],
      skills:(a.candidate?.skills||[]).join(', '), status:a.status||'applied',
      relevancy: recruiterApi.computeRelevancy(j, a.candidate||{}),
    })))
    if(q) all = all.filter(r=> (r.name+r.email+r.job+r.skills).toLowerCase().includes(q.toLowerCase()))
    if(status!=='all') all = all.filter(r=> r.status===status)
    return all.sort((a,b)=> b.relevancy-a.relevancy)
  },[jobs,q,status,version])

  const allSelected = rows.length>0 && rows.every(r=> !!sel[r.jobId+'__'+r.email])

  function toggleAll(v){ const next={}; rows.forEach(r=> next[r.jobId+'__'+r.email]=v); setSel(next) }

  function exportCSV(){ downloadCSV('candidates.csv', rows.map(r=>({name:r.name,email:r.email,job:r.job,status:r.status,relevancy:r.relevancy,skills:r.skills}))) }

  function changeStatus(r, s){ recruiterApi.setStatus(r.jobId, r.email, s); setVersion(v=>v+1) }

  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Recruiter Candidates</h1>

    <div className="card" style={{padding:16, margin:'12px 0'}}>
      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
        <input className="input" placeholder="Search name, email, job, skills..." value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:260}} />
        <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option>applied</option><option>shortlisted</option><option>selected</option><option>interview</option><option>hired</option><option>rejected</option>
        </select>
        <button className="btn-ghost" onClick={exportCSV}>Export CSV</button>
      </div>

      <div className="table-wrap" style={{marginTop:12}}>
        <table className="table" style={{width:'100%'}}>
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={e=>toggleAll(e.target.checked)} /></th>
              <th>Name</th><th>Email</th><th>Job</th><th>Relevancy</th><th>Status</th><th>Skills</th>
              <th className="sticky-actions" style={{textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td><input type="checkbox" checked={!!sel[r.jobId+'__'+r.email]} onChange={e=>setSel({...sel,[r.jobId+'__'+r.email]:e.target.checked})} /></td>
                <td>{r.name}</td>
                <td style={{color:'#94a3b8'}}>{r.email}</td>
                <td>{r.job}</td>
                <td>{r.relevancy}%</td>
                <td className="capitalize"><span className="btn-ghost">{r.status}</span></td>
                <td style={{color:'#cbd5e1'}}>{r.skills}</td>
                <td className="sticky-actions" style={{textAlign:'right'}}>
                  <CandidateActions
                    onProfile={()=>setProfileEmail(r.email)}
                    onResume={()=>setProfileEmail(r.email)}
                    onStatus={(s)=>changeStatus(r,s)}
                    onMessage={()=>{ try{ findOrCreateWith(r.email, `Hi ${r.name?.split(' ')[0]||''}, could we chat about your application?`); nav('/messages'); } catch(e){ alert(e.message) } }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <ProfileModal email={profileEmail} onClose={()=>setProfileEmail(null)} />
  </div>
}
