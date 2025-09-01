
import React from 'react';
import { getGlossary, saveGlossary, resetGlossary } from '../services/glossary';
import { read } from '../services/store';

function ListEditor({label, items, setItems, placeholder}){
  const [q,setQ] = React.useState('');
  return (
    <div className="card" style={{padding:12, background:'#0f172a', border:'1px solid #1f2530'}}>
      <div className="h2" style={{margin:0, marginBottom:8}}>{label}</div>
      <div style={{display:'flex', gap:8}}>
        <input className="input" placeholder={placeholder} value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn" onClick={()=>{ const v=q.trim(); if(!v)return; if(!items.includes(v)){ setItems([...items, v]); } setQ(''); }}>Add</button>
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:8}}>
        {items.map((it,idx)=> (
          <span key={it+idx} className="badge">
            {it}
            <button className="btn-ghost" onClick={()=> setItems(items.filter(x=>x!==it))} style={{marginLeft:6}}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminGlossary(){
  const g = getGlossary();
  const [skills, setSkills] = React.useState(g.skills);
  const [locations, setLocations] = React.useState(g.locations);
  const [experience, setExperience] = React.useState(g.experience);

  function saveAll(){
    saveGlossary({ skills, locations, experience });
    alert('Glossary saved.');
  }

  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <h1 className="h1">Admin · Dropdown Glossary</h1>
      <div style={{opacity:.8, marginBottom:12}}>Only Admin can modify these lists. Recruiters will see locked dropdowns with search.</div>
      <div style={{display:'grid', gap:12}}>
        <ListEditor label="Skills" items={skills} setItems={setSkills} placeholder="e.g., React" />
        <ListEditor label="Locations" items={locations} setItems={setLocations} placeholder="e.g., Bengaluru" />
        <ListEditor label="Experience ranges" items={experience} setItems={setExperience} placeholder="e.g., 3-5" />
      </div>
      <div style={{display:'flex', gap:8, marginTop:12}}>
        <button className="btn" onClick={saveAll}>Save Glossary</button>
        <button className="btn-ghost" onClick={()=>{ resetGlossary(); window.location.reload(); }}>Reset to defaults</button>
      </div>
    </div>
  );
}
