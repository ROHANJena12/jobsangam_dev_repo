import React from 'react'
import RequireOwner from '../components/RequireOwner.jsx'
import { adminApi } from '../services/adminApi'

export default function OwnerAudit(){
  const [rows, setRows] = React.useState([])
  const [actor, setActor] = React.useState('')
  const [action, setAction] = React.useState('')
  const [limit, setLimit] = React.useState(200)

  async function load(){ const r = await adminApi.audit({ actor, action, limit }); if(r && r.ok) setRows(r.items||[]) }
  React.useEffect(()=>{ load() }, [])

  return <RequireOwner>
    <div className="container" style={{padding:'16px 0', display:'grid', gap:12}}>
      <h1 className="h1">Audit Log</h1>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <input className="input" placeholder="actorId (optional)" value={actor} onChange={e=>setActor(e.target.value)} />
        <input className="input" placeholder="action contains…" value={action} onChange={e=>setAction(e.target.value)} />
        <input className="input" type="number" min={1} max={1000} value={limit} onChange={e=>setLimit(parseInt(e.target.value||'200',10))} />
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        <table className="table" style={{width:'100%', minWidth:900}}>
          <thead><tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
          </tr></thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id}>
                <td style={{fontSize:12}}>{(a.createdAt||'').replace('T',' ').replace('Z','')}</td>
                <td>{a.actorId || '—'}</td>
                <td>{a.action}</td>
                <td>{a.targetId || '—'}</td>
                <td><pre style={{margin:0, whiteSpace:'pre-wrap'}}>{JSON.stringify(a.details||{}, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </RequireOwner>
}
