import React from 'react'
import { candidateApi } from '../services/candidateApi'
import { useToast } from '../components/Toast.jsx'

export default function CandidateAlerts(){
  const toast = useToast()
  const [alerts, setAlerts] = React.useState(()=> {
    try { return candidateApi.alerts() || [] } catch { return [] }
  })
  const [text, setText] = React.useState('')

  function refresh(){
    try { setAlerts(candidateApi.alerts() || []) } catch { setAlerts([]) }
  }

  function add(){
    const q = text.trim()
    if(!q){ toast.show('Enter keywords to create an alert','error'); return }
    try {
      candidateApi.addAlert(q)
      setText('')
      refresh()
      toast.show('Alert created','success')
    } catch(e){
      toast.show(e?.message || 'Unable to create alert','error')
    }
  }

  function remove(id){
    try {
      candidateApi.removeAlert(id)
      refresh()
      toast.show('Alert deleted','success')
    } catch(e){
      toast.show(e?.message || 'Unable to delete alert','error')
    }
  }

  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <h1 className="h2">Job Alerts</h1>

      <div className="card" style={{padding:12, margin:'8px 0 16px', display:'flex', gap:8}}>
        <input className="input" placeholder="react, javascript" value={text} onChange={e=>setText(e.target.value)} style={{flex:1}} />
        <button className="btn primary" onClick={add}>Create</button>
      </div>

      <div className="vstack" style={{gap:8}}>
        {alerts.map(a => (
          <div key={a.id} className="card" style={{padding:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div className="h5" style={{margin:0}}>{a.query}</div>
              <div style={{fontSize:12,opacity:.7}}>Created: {new Date(a.created).toLocaleString()}</div>
            </div>
            <button className="btn ghost" onClick={()=>remove(a.id)}>Delete</button>
          </div>
        ))}
        {alerts.length===0 && <div className="card" style={{padding:16}}>No alerts yet. Create one above.</div>}
      </div>
    </div>
  )
}
