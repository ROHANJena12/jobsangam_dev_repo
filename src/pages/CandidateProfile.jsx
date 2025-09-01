import React, { useState } from 'react'
import { candidateApi } from '../services/candidateApi'
export default function CandidateProfile(){
  const [p,setP]=useState(candidateApi.profile())
  function save(){ candidateApi.saveProfile(p); alert('Profile saved') }
  function onResume(e){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ candidateApi.setResume(ev.target.result); setP({...p, resumeSrc:ev.target.result}); alert('Resume uploaded') }; reader.readAsDataURL(file) }
  function printResume(){ window.print() }
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Edit Profile</h1>
    <div className="card" style={{padding:16, margin:'12px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
      <input className="input" placeholder="Full name" value={p.name||''} onChange={e=>setP({...p,name:e.target.value})} />
      <input className="input" placeholder="Title (e.g., Frontend Engineer)" value={p.title||''} onChange={e=>setP({...p,title:e.target.value})} />
      <input className="input" placeholder="Email" value={p.email||''} onChange={e=>setP({...p,email:e.target.value})} />
      <input className="input" placeholder="Phone" value={p.phone||''} onChange={e=>setP({...p,phone:e.target.value})} />
      <input className="input" placeholder="Location" value={p.location||''} onChange={e=>setP({...p,location:e.target.value})} />
      <input className="input" placeholder="Skills (comma separated)" value={(p.skills||[]).join(', ')} onChange={e=>setP({...p,skills:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
      <textarea className="input" placeholder="Summary" value={p.summary||''} onChange={e=>setP({...p,summary:e.target.value})} style={{gridColumn:'1/3', height:120}} />
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <label className="btn-ghost">Upload Resume<input type="file" accept="application/pdf,image/*" onChange={onResume} style={{display:'none'}} /></label>
        <button className="btn-ghost" onClick={printResume}>Print to PDF</button>
      </div>
      <div style={{gridColumn:'1/3'}}>
        <button className="btn" onClick={save}>Save Profile</button>
      </div>
    </div>
    {p.resumeSrc && <div className="card" style={{padding:12}}>
      <div style={{fontWeight:600}}>Resume Preview</div>
      <div style={{height:400, border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden', background:'#fff', marginTop:8}}>
        {p.resumeSrc.startsWith('data:application/pdf') ? <iframe src={p.resumeSrc} title="Resume" style={{width:'100%',height:'100%',border:0}}/> : <img src={p.resumeSrc} alt="Resume" style={{width:'100%',height:'100%',objectFit:'contain'}}/>}
      </div>
    </div>}
  </div>
}
