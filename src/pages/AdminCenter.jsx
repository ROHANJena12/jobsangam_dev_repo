import React from 'react'
import RequireOwner from '../components/RequireOwner.jsx'
import { adminApi } from '../services/adminApi'

function Card({title,children}){ return <div className="card" style={{padding:16}}><h2 className="h2" style={{marginBottom:8}}>{title}</h2>{children}</div> }

export default function AdminCenter(){
  const [counts,setCounts]=React.useState(null)
  const [flags,setFlags]=React.useState({})
  const [msg,setMsg]=React.useState('')

  React.useEffect(()=>{ adminApi.summary().then(r=>{ if(r&&r.ok) setCounts(r.counts) }); adminApi.getFlags().then(r=>{ if(r&&r.ok) setFlags(r.flags||{}) }) },[])

  const setFlag=(k,v)=> setFlags({ ...(flags||{}), [k]:!!v })
  async function saveFlags(){ const r=await adminApi.setFlags(flags); if(!(r&&r.ok)) alert('Failed to save flags') }
  async function sendBroadcast(e){ e.preventDefault(); if(!msg.trim()) return; const r=await adminApi.announce(msg); if(r&&r.ok){ setMsg(''); alert('Broadcast sent to '+r.created+' users') } else alert('Failed to send') }

  return <RequireOwner>
    <div className="container" style={{padding:'16px 0', maxWidth:1000, display:'grid', gap:12}}>
      <h1 className="h1">Owner · Admin Center</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12}}>
        <Card title="Overview">
          {!counts ? <div style={{opacity:.7}}>Loading…</div> : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8}}>
              {Object.entries(counts).map(([k,v])=>(
                <div key={k} className="stat">
                  <div style={{opacity:.6, fontSize:12}}>{k}</div>
                  <div style={{fontSize:22, fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Feature Flags">
          <div style={{display:'grid', gap:8}}>
            {['communityEnabled','messagingEnabled','jobPostingEnabled','requireJobApproval','newBranding'].map(key=>(
              <label key={key} style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="checkbox" checked={!!flags[key]} onChange={e=>setFlag(key, e.target.checked)} /> {key}
              </label>
            ))}
            <button className="btn" onClick={saveFlags}>Save Flags</button>
          </div>
        </Card>
        <Card title="Broadcast">
          <form onSubmit={sendBroadcast} style={{display:'grid', gap:8}}>
            <textarea className="input" rows={3} placeholder="Write an announcement…" value={msg} onChange={e=>setMsg(e.target.value)} />
            <button className="btn">Send to all users</button>
          </form>
          <div style={{opacity:.7, fontSize:12, marginTop:6}}>Users will see this in their notifications.</div>
        </Card>
      </div>
          <div className="card" style={{display:'grid', gap:8, padding:16}}>
        <div style={{fontWeight:600, fontSize:18}}>Admin Shortcuts</div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <a className="btn" href="/owner/users">Manage Users</a>
          <a className="btn" href="/owner/jobs">Job Moderation</a>
          <a className="btn" href="/owner/audit">Audit Log</a>
        </div>
      </div>
    </div>
  </RequireOwner>
}
