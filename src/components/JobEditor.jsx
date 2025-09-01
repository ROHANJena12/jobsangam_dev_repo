import React, { useEffect, useState } from 'react';
import { recruiterApi } from '../services/recruiterApi';
import SearchableSelect from '../components/SearchableSelect.jsx';
import { getGlossary } from '../services/glossary';

/** Minimal modal editor for a job. Non-destructive. */
export default function JobEditor({ job, onClose, onSaved }){
  const { skills: SKILLS, locations: LOCATIONS, experience: EXPERIENCE_RANGES } = getGlossary();
  const [draft, setDraft] = useState(job || null);
  useEffect(()=>setDraft(job),[job]);
  if(!draft) return null;
  const inputStyle = {background:'#0b1220', color:'#e5e7eb', border:'1px solid #1f2530'};
  function merge(patch){ setDraft(d=>({...d, ...patch})) }
  function save(){
    recruiterApi.updateJob(draft.id, {
      title: draft.title,
      location: draft.location,
      salary: draft.salary,
      type: draft.type,
      tags: (draft.tags||[]).map(String),
      description: draft.description,
      featured: !!draft.featured
    });
    onSaved && onSaved();
    onClose && onClose();
  }
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'grid', placeItems:'center', zIndex:1000}}>
      <div className="card" style={{width:'min(720px, 92vw)', background:'#0f172a', border:'1px solid #1f2530', padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <div className="h2" style={{margin:0}}>Edit Job</div>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <label style={{display:'grid', gap:6}}>
            <div style={{fontSize:12, opacity:.85}}>Title</div>
            <input className="input" style={inputStyle} value={draft.title||''} onChange={e=>merge({title:e.target.value})} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <div style={{fontSize:12, opacity:.85}}>Location</div>
            <SearchableSelect options={LOCATIONS} value={draft.location||''} onChange={(v)=>merge({location:v})} placeholder="Choose location" style={inputStyle} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <div style={{fontSize:12, opacity:.85}}>Salary</div>
            <input className="input" style={inputStyle} value={draft.salary||''} onChange={e=>merge({salary:e.target.value})} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <div style={{fontSize:12, opacity:.85}}>Type</div>
            <select className="input" style={inputStyle} value={draft.type||'Full‑time'} onChange={e=>merge({type:e.target.value})}>
              <option>Full‑time</option>
              <option>Part‑time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </label>
          <label style={{display:'grid', gap:6}}>
            <div style={{fontSize:12, opacity:.85}}>Experience</div>
            <SearchableSelect options={EXPERIENCE_RANGES} value={draft.experience||''} onChange={(v)=>merge({experience:v})} placeholder="Select range (e.g., 3-5)" style={inputStyle} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <div style={{fontSize:12, opacity:.85}}>Skills</div>
            <SearchableSelect options={SKILLS} value={draft.tags||[]} onChange={(v)=>merge({tags:v})} placeholder="Add skills" style={inputStyle} multi />
          </label>
          <label style={{display:'grid', gap:6}}>
            <div style={{fontSize:12, opacity:.85}}>Featured</div>
            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={!!draft.featured} onChange={e=>merge({featured:e.target.checked})} />
              <span>Feature this job</span>
            </label>
          </label>
        </div>
        <label style={{display:'grid', gap:6, marginTop:12}}>
          <div style={{fontSize:12, opacity:.85}}>Description</div>
          <textarea className="input" rows={6} style={inputStyle} value={draft.description||''} onChange={e=>merge({description:e.target.value})} />
        </label>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}