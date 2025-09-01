import React from 'react'
import { read, write } from '../services/store'

/**
 * Admin dashboard. Only visible to users with role `admin`. Shows
 * high‑level stats, recent revenue events and basic post moderation.
 */
export default function AdminDashboard(){
  // Aggregate counts
  const jobs = read('hh_jobs', []) || []
  const apps = read('hh_apps', {}) || {}
  const posts = read('hh_posts', []) || []
  const revenue = read('hh_revenue', []) || []
  const usersCount = 1 // placeholder – in a real app you’d count users
  function toggleApprove(pid){
    const arr = [...posts]
    const i = arr.findIndex(p => p.id === pid)
    if(i>=0){ arr[i].approved = !arr[i].approved; write('hh_posts', arr) }
  }
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Admin Dashboard</h1>
    <div className="card" style={{padding:16, margin:'12px 0'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12}}>
        <div className="card" style={{padding:12}}><div style={{fontSize:12,opacity:.7}}>Users</div><div style={{fontSize:24,fontWeight:700}}>{usersCount}</div></div>
        <div className="card" style={{padding:12}}><div style={{fontSize:12,opacity:.7}}>Jobs</div><div style={{fontSize:24,fontWeight:700}}>{jobs.length}</div></div>
        <div className="card" style={{padding:12}}><div style={{fontSize:12,opacity:.7}}>Applications</div><div style={{fontSize:24,fontWeight:700}}>{Object.values(apps).reduce((a,b)=>a + (b?.length||0), 0)}</div></div>
        <div className="card" style={{padding:12}}><div style={{fontSize:12,opacity:.7}}>Revenue events</div><div style={{fontSize:24,fontWeight:700}}>{revenue.length}</div></div>
      </div>
    </div>
    <div className="card" style={{padding:16, margin:'12px 0'}}>
      <h2 className="h2" style={{marginBottom:8}}>Revenue Log</h2>
      <table className="table" style={{width:'100%',fontSize:12}}>
        <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>
          {revenue.map((r,i)=>(<tr key={r.id || i}><td>{r.id}</td><td>{r.type}</td><td>₹{r.amount}</td><td>{new Date(r.id).toLocaleString()}</td></tr>))}
          {revenue.length===0 && <tr><td colSpan="4" style={{textAlign:'center',opacity:.6}}>No revenue yet</td></tr>}
        </tbody>
      </table>
    </div>
    <div className="card" style={{padding:16, margin:'12px 0'}}>
      <h2 className="h2" style={{marginBottom:8}}>Community Moderation</h2>
      <table className="table" style={{width:'100%',fontSize:12}}>
        <thead><tr><th>Title</th><th>Author</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {posts.map(p=>(<tr key={p.id}><td>{p.title}</td><td>{p.author}</td><td>{p.approved?'Approved':'Pending'}</td><td><button className="btn-ghost" onClick={()=>toggleApprove(p.id)}>{p.approved?'Unapprove':'Approve'}</button></td></tr>))}
          {posts.length===0 && <tr><td colSpan="4" style={{textAlign:'center',opacity:.6}}>No posts</td></tr>}
        </tbody>
      </table>
      <div className="card" style={{padding:16, marginTop:12}}>
    <div style={{fontWeight:600, fontSize:18, marginBottom:8}}>Owner Shortcuts</div>
    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
      <a className="btn" href="/owner">Owner Center</a>
      <a className="btn" href="/owner/jobs">Job Moderation</a>
      <a className="btn" href="/owner/users">Manage Users</a>
      <a className="btn" href="/owner/audit">Audit Log</a>
      <span style={{opacity:.6}}>or use /admin/users, /admin/jobs, /admin/audit</span>
    </div>
  </div>
</div>
  </div>
}