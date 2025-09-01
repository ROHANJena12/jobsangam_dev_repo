import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recruiterApi } from '../services/recruiterApi'
import { read } from '../services/store'
import { findOrCreateWith } from '../services/messagesApi'

const STATUS_ORDER = ['applied','shortlisted','selected','interview','offer','hired','rejected']

function CandidateActions({ onProfile, onStatus, onMessage }){
  const wrap = { display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center', flexWrap:'nowrap' }
  const pill = { borderRadius:999, padding:'6px 10px', fontSize:12, lineHeight:'16px', border:'1px solid #2a2f3a', background:'transparent', whiteSpace:'nowrap', color:'#e5e7eb' }
  const primary = { ...pill, background:'#10b981', color:'#031b16', border:'none' }
  return (
    <div style={wrap}>
      <button className="btn-ghost" style={pill} onClick={onProfile}>Profile</button>
      <button className="btn-ghost" style={pill} onClick={onMessage}>Message</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('shortlisted')}>Shortlist</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('selected')}>Select</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('interview')}>Interview</button>
      <button className="btn-ghost" style={pill} onClick={()=>onStatus('rejected')}>Reject</button>
      <button className="btn" style={primary} onClick={()=>onStatus('hired')}>Hire</button>
    </div>
  )
}

function ProfileModal({ data, onClose }){
  if(!data) return null
  const { a } = data
  const prof = read('hh_cand_profile_' + a.email, {}) || {}
  const p = { email: a.email, name: prof.name || a.candidate?.name || a.email, skills: prof.skills || a.candidate?.skills || [], resumeSrc: prof.resumeSrc }
  const [zoom,setZoom]=React.useState(1)
  const dec=()=>setZoom(z=>Math.max(0.5, +(z-0.1).toFixed(2)))
  const inc=()=>setZoom(z=>Math.min(2, +(z+0.1).toFixed(2)))
  const rst=()=>setZoom(1)
  const download = ()=>{ if(!p.resumeSrc) return; const aTag=document.createElement('a'); aTag.href=p.resumeSrc; aTag.download=(p.name||'resume')+'.pdf'; aTag.click() }
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
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns: p.resumeSrc ? '1fr 1.5fr' : '1fr', gap:12, padding:12}}>
          <div style={{overflow:'auto'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div><div className="label" style={{color:'#94a3b8'}}>Name</div><div style={{color:'#e5e7eb'}}>{p.name || '—'}</div></div>
              <div><div className="label" style={{color:'#94a3b8'}}>Email</div><div style={{color:'#e5e7eb'}}>{p.email}</div></div>
              <div style={{gridColumn:'1/3'}}><div className="label" style={{color:'#94a3b8'}}>Skills</div><div style={{color:'#e5e7eb'}}>{(p.skills||[]).join(', ')||'—'}</div></div>
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

export default function RecruiterJobsRollup(){
  const nav = useNavigate();
const jobs = recruiterApi.myJobs()
  const [open,setOpen]=useState({})
  const [profile,setProfile]=useState(null)
  const [refresh,setRefresh]=useState(0)

  const data = useMemo(()=>{
    return jobs.map(job=>{
      const apps = recruiterApi.applicants(job.id)
      const groups = {}
      STATUS_ORDER.forEach(k=> groups[k]=[])
      apps.forEach(a=> (groups[a.status||'applied']||groups['applied']).push(a))
      return { job, groups }
    })
  },[jobs,refresh])

  const toggle = (id)=> setOpen(o=>({...o, [id]: !o[id]}))

  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <h1 className="h2">All Jobs (Rollup)</h1>
      {data.map(({job,groups})=> (
        <div key={job.id} className="card" style={{padding:12, margin:'12px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div className="h2" style={{margin:0}}>{job.title}</div>
              <div style={{fontSize:12,color:'#cbd5e1'}}>{job.company} · {job.location} · {job.type}</div>
            </div>
            <button className="btn-ghost" onClick={()=>toggle(job.id)}>{open[job.id] ? 'Collapse' : 'Expand'}</button>
          </div>
          {open[job.id] && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(6, minmax(220px,1fr))', gap:8, marginTop:8, overflowX:'auto'}}>
              {STATUS_ORDER.map(k=>{
                const arr = groups[k]||[]
                return (
                  <div key={k} className="card" style={{padding:8}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                      <div style={{fontWeight:600, textTransform:'capitalize'}}>{k}</div>
                      <div style={{opacity:.7, fontSize:12}}>{arr.length}</div>
                    </div>
                    <div style={{display:'grid',gap:6}}>
                      {arr.length===0 ? <div style={{opacity:.6,fontSize:12}}>No candidates</div> :
                        arr.map(a=>(
                          <div key={a.email} className="card" style={{padding:8}}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr', gap:8}}>
                              <div style={{display:'flex',alignItems:'center',gap:10}}>
                                <div style={{width:24,height:24,borderRadius:999,background:'#1f2530'}}></div>
                                <div>
                                  <div style={{fontWeight:600, fontSize:13, color:'#e5e7eb'}}>{a.candidate?.name || a.email}</div>
                                  <div style={{color:'#94a3b8', fontSize:12}}>{a.email}</div>
                                </div>
                              </div>
                              <div className="sticky-actions" style={{textAlign:'right'}}>
                                <CandidateActions
                                  onProfile={()=>setProfile({a})}
                                  onStatus={(s)=>{ recruiterApi.setStatus(job.id,a.email,s); setRefresh(v=>v+1) }}
                                  onMessage={()=>{ try{ findOrCreateWith(a.email, `Hi ${a.name?.split(' ')[0]||''}, let’s chat about your application for ${job.title}.`); nav('/messages'); } catch(e){ alert(e.message) } }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
      <ProfileModal data={profile} onClose={()=>setProfile(null)} />
    </div>
  )
}
