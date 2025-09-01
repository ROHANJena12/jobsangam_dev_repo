import React, { useState } from 'react'
import { candidateApi } from '../services/candidateApi'
export default function Alerts(){
  const [list,setList]=useState(candidateApi.alerts())
  const [kw,setKw]=useState('React'); const [loc,setLoc]=useState('Bengaluru')
  function add(){ const a={ id:Date.now(), kw, loc }; candidateApi.addAlert(a); setList([a,...list]) }
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Job Alerts</h1>
    <div className="card" style={{padding:12, margin:'12px 0', display:'flex', gap:8}}>
      <input className="input" placeholder="Keywords" value={kw} onChange={e=>setKw(e.target.value)} />
      <input className="input" placeholder="Location" value={loc} onChange={e=>setLoc(e.target.value)} />
      <button className="btn" onClick={add}>Create Alert</button>
    </div>
    <div className="card" style={{padding:0}}>
      <table className="table" style={{width:'100%'}}><thead><tr><th>Keywords</th><th>Location</th></tr></thead><tbody>
        {list.map(a=><tr key={a.id}><td>{a.kw}</td><td>{a.loc}</td></tr>)}
        {list.length===0 && <tr><td colSpan="2" style={{opacity:.7}}>No alerts set.</td></tr>}
      </tbody></table>
    </div>
  </div>
}
