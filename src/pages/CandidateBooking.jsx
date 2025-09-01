import React, { useState } from 'react'
import { read, write, auth } from '../services/store'
import { recruiterApi } from '../services/recruiterApi'
export default function CandidateBooking(){
  const u = auth.me() || { role:'candidate', email:'candidate@example.com', name:'Demo Candidate' }
  if(!auth.me()) localStorage.setItem('hh_user', JSON.stringify(u))
  const jobs = recruiterApi.allJobs()
  const [job,setJob]=useState(jobs[0]?.id||'')
  const key=id=>'hh_slots_'+id
  const [slots,setSlots]=useState(read(key(job), []))
  function onJob(e){ const id=e.target.value; setJob(id); setSlots(read(key(id), [])) }
  function book(id){ const s=slots.map(x=>x.id===id?({...x,status:'booked',by:u.email}):x); setSlots(s); write(key(job), s); alert('Slot booked!') }
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Interview Booking</h1>
    <select className="input" value={job} onChange={onJob}>{jobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}</select>
    <div className="card" style={{padding:12, marginTop:8}}>
      {slots.length===0 ? <div style={{fontSize:14,opacity:.7}}>No slots for this job.</div> :
        <ul style={{fontSize:14}}>{slots.map(s=>(<li key={s.id} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}><span>{s.when} {s.by?`• booked by ${s.by}`:''}</span><button className="btn-ghost" disabled={s.status==='booked'} onClick={()=>book(s.id)}>{s.status}</button></li>))}</ul>
      }
    </div>
  </div>
}
