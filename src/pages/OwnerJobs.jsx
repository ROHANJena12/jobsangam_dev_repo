import React from 'react'
import RequireOwner from '../components/RequireOwner.jsx'
import { adminApi } from '../services/adminApi'

function toCSV(rows){
  if(!rows || !rows.length) return ''
  const header = ['id','title','company','location','salaryMin','salaryMax','status','tags','createdAt','postedBy']
  const esc = v => ('"'+String(v).replaceAll('"','""')+'"')
  const body = rows.map(j => header.map(h => esc(Array.isArray(j[h])? j[h].join('|') : (j[h]??''))).join(','))
  return header.join(',') + '\n' + body.join('\n')
}

export default function OwnerJobs(){
  const [status, setStatus] = React.useState('pending')
  const [rows, setRows] = React.useState([])
  const [reason, setReason] = React.useState('')
  const [sel, setSel] = React.useState({}) // id -> true

  async function load(){ const r = await adminApi.jobs({ status }); if(r && r.ok) setRows(r.jobs||[]) }
  React.useEffect(()=>{ load() }, [status])

  function toggle(id, v){ setSel(s => ({ ...s, [id]: v ?? !s[id] })) }
  function toggleAll(e){ const v = e.target.checked; const next = {}; rows.forEach(j => next[j.id]=v); setSel(next) }
  const selected = rows.filter(j => sel[j.id])

  async function approve(j){ const r = await adminApi.approveJob(j.id); if(r && r.ok){ setRows(rows.filter(x=>x.id!==j.id)); setSel(s=>{ const n={...s}; delete n[j.id]; return n }) } else alert('Approve failed') }
  async function reject(j){ const r = await adminApi.rejectJob(j.id, reason); if(r && r.ok){ setRows(rows.filter(x=>x.id!==j.id)); setSel(s=>{ const n={...s}; delete n[j.id]; return n }); setReason('') } else alert('Reject failed') }

  async function bulkApprove(){
    if(selected.length===0) return alert('Select rows first')
    for(const j of selected){ await adminApi.approveJob(j.id) }
    await load(); setSel({})
  }
  async function bulkReject(){
    if(selected.length===0) return alert('Select rows first')
    const why = reason || prompt('Reject reason for selected?') || ''
    for(const j of selected){ await adminApi.rejectJob(j.id, why) }
    await load(); setSel({}); setReason('')
  }

  function downloadCSV(){
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `jobs_${status}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return <RequireOwner>
    <div className="container" style={{padding:'16px 0', display:'grid', gap:12}}>
      <h1 className="h1">Job Moderation</h1>
      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
        <label>Status:</label>
        <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
          <option>pending</option>
          <option>approved</option>
          <option>rejected</option>
        </select>
        <button className="btn" onClick={load}>Refresh</button>
        <button className="btn-ghost" onClick={downloadCSV}>Export CSV</button>
        <span style={{opacity:.6, fontSize:12}}>{rows.length} rows</span>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        <table className="table" style={{width:'100%', minWidth:980}}>
          <thead><tr>
            <th><input type="checkbox" onChange={toggleAll} checked={rows.length>0 && selected.length===rows.length} /></th>
            <th style={{textAlign:'left'}}>Job</th>
            <th>Company</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Posted By</th>
            <th>Created</th>
            <th>Actions</th>
          </tr></thead>
          <tbody>
            {rows.map(j => (
              <tr key={j.id}>
                <td><input type="checkbox" checked={!!sel[j.id]} onChange={()=>toggle(j.id)} /></td>
                <td style={{textAlign:'left'}}>
                  <div style={{fontWeight:600}}>{j.title}</div>
                  <div style={{opacity:.7, fontSize:12}}>{(j.tags||[]).join(', ')}</div>
                </td>
                <td>{j.company || j.companyName || '—'}</td>
                <td>{j.location || '—'}</td>
                <td>{(j.salaryMin||j.salaryMax)? `${j.salaryMin||''}-${j.salaryMax||''}` : '—'}</td>
                <td>{j.postedBy || '—'}</td>
                <td style={{fontSize:12}}>{(j.createdAt||'').slice(0,10)}</td>
                <td style={{display:'grid', gap:6}}>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                    <button className="btn" onClick={()=>approve(j)}>Approve</button>
                    <button className="btn-ghost" onClick={()=>reject(j)}>Reject</button>
                  </div>
                  <textarea className="input" rows={1} placeholder="Reject reason…" value={reason} onChange={e=>setReason(e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{display:'flex', gap:8, alignItems:'center', padding:12, justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <div style={{fontWeight:600}}>Bulk actions ({selected.length} selected)</div>
          <button className="btn" onClick={bulkApprove}>Approve Selected</button>
          <button className="btn-ghost" onClick={bulkReject}>Reject Selected</button>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <label style={{opacity:.7}}>Reason:</label>
          <input className="input" placeholder="optional reason" value={reason} onChange={e=>setReason(e.target.value)} />
        </div>
      </div>
    </div>
  </RequireOwner>
}
