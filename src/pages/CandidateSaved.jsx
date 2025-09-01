import React from 'react'
import { candidateApi } from '../services/candidateApi'
import { recruiterApi } from '../services/recruiterApi'
import JobDetailModal from '../components/JobDetailModal.jsx'
import { useToast } from '../components/Toast.jsx'

export default function CandidateSaved(){
  const toast = useToast()
  const [tick,setTick] = React.useState(0)
  const [selected, setSelected] = React.useState(null)
  const me = candidateApi.profile()

  const savedIds = new Set(candidateApi.savedJobs() || [])
  const jobs = recruiterApi.allJobs().filter(j => savedIds.has(j.id))

  function toggle(j){
    try{
      candidateApi.toggleSave(j)
      setTick(v=>v+1)
      toast.show('Removed from saved','success')
    }catch(e){
      toast.show(e?.message || 'Unable to update','error')
    }
  }

  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <h1 className="h2">Saved Jobs</h1>
      <div className="vstack" style={{gap:12}}>
        {jobs.map(j => (
          <div key={j.id} className="card hover" style={{padding:16}} onClick={()=>setSelected(j)}>
            <div className="h5" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span>{j.title}</span>
              <button className="btn ghost" onClick={(e)=>{e.stopPropagation(); toggle(j)}}>Unsave</button>
            </div>
            <div style={{opacity:.8, fontSize:13}}>
              {j.company} • {j.location} • {j.type || 'Full-time'}{j.salary ? ` • ${j.salary}` : ''}
            </div>
            <div style={{marginTop:8, display:'flex', gap:6, flexWrap:'wrap'}}>
              {(j.tags||[]).map(t => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
        ))}
        {jobs.length===0 && <div className="card" style={{padding:16}}>No saved jobs yet.</div>}
      </div>
      {selected && (
        <JobDetailModal job={selected} candidateSkills={me?.skills || []} onClose={()=>setSelected(null)} />
      )}
    </div>
  )
}
