import React, { useMemo } from 'react'
import { recruiterApi } from '../services/recruiterApi'
import { candidateApi } from '../services/candidateApi'
import { useToast } from '../components/Toast.jsx'

export default function CandidateDashboard(){
  const [ver,setVer] = React.useState(0)
  const toast = useToast()
  const me = candidateApi.profile()
  const jobs = recruiterApi.allJobs()
  const applications = candidateApi.applications()
  const saved = candidateApi.savedJobs()

  const recommended = useMemo(()=> {
    return jobs
      .map(j => ({ j, score: recruiterApi.computeRelevancy(j, me) }))
      .sort((a,b)=> b.score - a.score)
      .slice(0,5)
  }, [jobs, me])

  const completeness = (() => {
    let score = 0
    if (me.skills && me.skills.length) score += 30
    if (me.resumeSrc) score += 50
    if (me.summary) score += 20
    return Math.min(100, score)
  })()

  function onSave(j){
    try{ candidateApi.toggleSave(j); setVer(v=>v+1); toast.show('Saved to your list','success') }catch(e){ toast.show(e.message||'Unable to save','error') }
  }
  function onApply(j){
    try{ candidateApi.apply(j); setVer(v=>v+1); toast.show('Applied successfully','success') }catch(e){ toast.show(e.message||'Unable to apply','error') }
  }


  const savedIds = new Set(candidateApi.savedJobs() || [])
  const appliedIds = new Set((candidateApi.applications() || []).map(a => a.jobId))

  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <h1 className="h2">Candidate Dashboard</h1>

      <div className="card" style={{padding:16, margin:'12px 0'}}>
        <div style={{fontWeight:600, marginBottom:6}}>Overview</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          <Stat title="Applications" value={applications.length} />
          <Stat title="Saved Jobs" value={saved.length} />
          <Stat title="Alerts" value={candidateApi.alerts().length} />
          <Stat title="Profile Completeness" value={completeness + '%'} />
        </div>
      </div>

      <div className="card" style={{padding:16, margin:'12px 0'}}>
        <div style={{fontWeight:600, marginBottom:6}}>Recommended Jobs</div>
        <div className="vstack" style={{gap:8}}>
          {recommended.map(({j,score}) => (
            <div key={j.id} className="card" style={{padding:12}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div className="h5" style={{margin:0}}>{j.title} <span style={{opacity:.7, fontSize:12, marginLeft:8}}>Match: <b>{score}%</b></span></div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn ghost" onClick={()=>onSave(j)} disabled={savedIds.has(j.id)}>{savedIds.has(j.id) ? "Saved ✓" : "Save"}</button>
                  <button className="btn primary" onClick={()=>onApply(j)} disabled={appliedIds.has(j.id)}>{appliedIds.has(j.id) ? "Applied ✓" : "Apply"}</button>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,opacity:.7}}>{j.logo && <img src={j.logo} alt={(j.company||'') + ' logo'} style={{width:20,height:20,borderRadius:4}}/>}<span>{j.company} · {j.location} · {j.type || 'Full-time'} {j.salary? '· '+j.salary : ''}</span></div>
            </div>
          ))}
          {recommended.length===0 && <div style={{fontSize:14,opacity:.7}}>No recommendations yet.</div>}
        </div>
      </div>
    </div>
  )
}

function Stat({title,value}){
  return (
    <div className="card" style={{padding:12, display:'flex', flexDirection:'column', gap:4}}>
      <div style={{fontSize:12,opacity:.7}}>{title}</div>
      <div style={{fontSize:22,fontWeight:700}}>{value}</div>
    </div>
  )
}
