import React, { useState } from 'react'
import { recruiterApi } from '../services/recruiterApi'
import { read, write } from '../services/store'
export default function RecruiterSchedule(){
  const jobs=recruiterApi.myJobs()
  const [job,setJob]=useState(jobs[0]?.id||'')
  const key=id=>'hh_slots_'+id
  const [slots,setSlots]=useState(read(key(job), []))
  function onJob(e){ const id=e.target.value; setJob(id); setSlots(read(key(id), [])) }
  function addSlot(){ const d=prompt('Enter date (YYYY-MM-DD HH:mm)'); if(!d) return; const s=[...slots,{id:Date.now(), when:d, status:'open'}]; setSlots(s); write(key(job), s) }
  function toggle(id){ const s=slots.map(x=>x.id===id?{...x,status:x.status==='open'?'booked':'open'}:x); setSlots(s); write(key(job), s) }
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Interview Schedule</h1>
    <div style={{display:'flex',gap:8}}>
      <select className="input" value={job} onChange={onJob}>{jobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}</select>
      <button className="btn" onClick={addSlot}>Add Slot</button>
    </div>
    <div className="card" style={{padding:12, marginTop:8}}>
      {slots.length===0 ? <div style={{fontSize:14,opacity:.7}}>No slots yet.</div> :
        <ul style={{fontSize:14}}>{slots.map(s=>(<li key={s.id} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}><span>{s.when} {s.by?`• booked by ${s.by}`:''}</span><button className="btn-ghost" onClick={()=>toggle(s.id)}>{s.status}</button></li>))}</ul>
      }
    </div>
  </div>
}
