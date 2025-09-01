import React from 'react'
import RequireOwner from '../components/RequireOwner.jsx'
import { adminApi } from '../services/adminApi'

export default function OwnerUsers(){
  const [rows,setRows] = React.useState([])
  const [q,setQ] = React.useState('')
  const [role,setRole] = React.useState('')
  const [status,setStatus] = React.useState('')

  async function load(){ const r = await adminApi.users({ q, role, status }); if(r && r.ok) setRows(r.users||[]) }
  React.useEffect(()=>{ load() }, [])

  async function onSave(u, patch){
    const r = await adminApi.updateUser(u.id, patch)
    if(r && r.ok){
      setRows(rows.map(x => x.id===u.id ? r.user : x))
    }else{
      alert('Update failed')
    }
  }

  return <RequireOwner>
    <div className="container" style={{padding:'16px 0', display:'grid', gap:12}}>
      <h1 className="h1">Manage Users</h1>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <input className="input" placeholder="Search name/email…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="">All roles</option>
          <option>candidate</option>
          <option>employer</option>
          <option>recruiter</option>
          <option>admin</option>
        </select>
        <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All status</option>
          <option>active</option>
          <option>suspended</option>
          <option>deleted</option>
        </select>
        <button className="btn" onClick={load}>Search</button>
        <button className="btn-ghost" onClick={()=>{
          const header=['id','name','email','role','status','company','createdAt']
          const esc=v=>('"'+String(v??'').replaceAll('"','""')+'"')
          const body=(rows||[]).map(u=>header.map(h=>esc(u[h]||'')).join(','))
          const csv = header.join(',')+'\n'+body.join('\n')
          const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'})
          const url = URL.createObjectURL(blob)
          const a=document.createElement('a'); a.href=url; a.download='users.csv'; a.click(); URL.revokeObjectURL(url)
        }}>Export CSV</button>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        <table className="table" style={{width:'100%', minWidth:780}}>
          <thead><tr>
            <th style={{textAlign:'left'}}>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Company</th>
            <th>Created</th>
            <th>Action</th>
          </tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td style={{textAlign:'left'}}>
                  <div style={{fontWeight:600}}>{u.name || '—'}</div>
                  <div style={{opacity:.7, fontSize:12}}>{u.email}</div>
                </td>
                <td>
                  <select className="input" value={u.role||''} onChange={e=>onSave(u, { role:e.target.value })}>
                    <option>candidate</option>
                    <option>employer</option>
                    <option>recruiter</option>
                    <option>admin</option>
                  </select>
                </td>
                <td>
                  <select className="input" value={u.status||'active'} onChange={e=>onSave(u, { status:e.target.value })}>
                    <option>active</option>
                    <option>suspended</option>
                    <option>deleted</option>
                  </select>
                </td>
                <td>
                  <input className="input" style={{minWidth:160}} value={u.company||''} onChange={e=>onSave(u, { company:e.target.value })} />
                </td>
                <td style={{fontSize:12}}>{(u.createdAt||'').slice(0,10)}</td>
                <td>
                  <button className="btn-ghost" onClick={()=>onSave(u, { status: (u.status==='suspended'?'active':'suspended') })}>
                    {u.status==='suspended' ? 'Activate' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </RequireOwner>
}
