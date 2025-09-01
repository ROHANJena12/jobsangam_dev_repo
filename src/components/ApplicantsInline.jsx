import React from 'react'
import { read } from '../services/store'

export default function ApplicantsInline({ job }){
  const [openProfile, setOpenProfile] = React.useState(null)
  const [resumeInput, setResumeInput] = React.useState('')

  const apps = React.useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('hh_apps') || '{}')
      const arr = Array.isArray(raw?.[job?.id]) ? raw[job.id] : []
      return arr
    } catch (e) { return [] }
  }, [job?.id])

  const jobTags = React.useMemo(() => (job?.tags || []).map(s => String(s).toLowerCase()), [job?.tags])

  function scoreFor(cand){
    const skills = (cand?.skills || cand?.tags || []).map(s => String(s).toLowerCase())
    if (skills.length === 0 || jobTags.length === 0) return 0
    let match = 0
    for (const t of jobTags) if (skills.includes(t)) match++
    return Math.round((match / Math.max(1, jobTags.length)) * 100)
  }

  function pretty(x){
    if (!x) return ''
    if (Array.isArray(x)) return x.join(', ')
    return String(x)
  }

  function pickResumeLink(c){
    const direct = c?.resumeDataUrl || c?.resumeUrl || c?.resume || c?.resumeLink || c?.cvUrl || c?.cv || c?.resume_url
      || c?.candidate?.resumeDataUrl || c?.candidate?.resumeUrl || c?.candidate?.resume || c?.candidate?.resumeLink || c?.candidate?.cvUrl || c?.candidate?.cv || c?.candidate?.resume_url
    if (direct) return direct
    const email = c?.email || c?.candidate?.email
    if (!email) return ''
    const key = 'hh_resume_profile_' + email
    const fromProfile = read(key, '')
    return fromProfile || ''
  }

  function viewerUrl(link){
    try{
      const lower = link.toLowerCase()
      if (lower.startsWith('data:application/pdf') || lower.endsWith('.pdf')) return link
      const base = 'https://docs.google.com/gview?embedded=1&url='
      return base + encodeURIComponent(link)
    }catch(e){ return link }
  }

  function saveResumeLinkForCandidate(link){
    if (!openProfile || !link) return
    try{
      const raw = JSON.parse(localStorage.getItem('hh_apps') || '{}')
      const arr = Array.isArray(raw?.[job?.id]) ? raw[job.id] : []
      const email = openProfile.email
      const idx = arr.findIndex(a => a.email === email)
      if (idx >= 0){
        arr[idx] = { ...arr[idx], resumeUrl: link }
      }
      raw[job.id] = arr
      localStorage.setItem('hh_apps', JSON.stringify(raw))
      setOpenProfile(prev => ({...prev, resumeUrl: link}))
      setResumeInput('')
    }catch(e){}
  }

  return (
    <div style={{borderTop:'1px solid #1f2530', background:'#0f172a'}}>
      {(apps||[]).length === 0 ? (
        <div style={{padding:'12px 16px', opacity:.7}}>No applicants yet.</div>
      ) : (
        apps.map((a, idx) => {
          const name = a.name || a.fullName || (a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : (a.email || 'Candidate'))
          const score = scoreFor(a)
          return (
            <div key={a.email || idx} style={{display:'grid', gridTemplateColumns:'1.2fr .8fr .8fr .6fr .4fr', gap:12, alignItems:'center', padding:'10px 12px', borderBottom:'1px solid #0f1422'}}>
              <div>
                <div style={{fontWeight:600}}>{name}</div>
                <div style={{opacity:.75, fontSize:13}}>{a.email}</div>
              </div>
              <div style={{opacity:.85}}>{a.experience || a.exp || (a.experienceYears ? `${a.experienceYears} yrs` : '')}</div>
              <div style={{opacity:.85, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={pretty(a.skills)}>{pretty(a.skills)}</div>
              <div><span className="chip">{isNaN(score)?'–':`${score}% match`}</span></div>
              <div style={{textAlign:'right'}}>
                <button className="btn-ghost" onClick={()=>{ setOpenProfile(a); setResumeInput(''); }}>Profile</button>
              </div>
            </div>
          )
        })
      )}

      {openProfile && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{width:'min(1000px, 96vw)', height:'min(85vh, 900px)', background:'#0b1220', border:'1px solid #1f2530', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column'}}>
            <div style={{padding:16, borderBottom:'1px solid #1f2530', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div className="h2" style={{margin:0}}>Candidate Profile</div>
              <button className="btn-ghost" onClick={()=>setOpenProfile(null)}>Close</button>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:16, overflow:'auto'}}>
              <div>
                <div style={{fontSize:18, fontWeight:600}}>{openProfile.name || openProfile.fullName || openProfile.candidate?.name || openProfile.email}</div>
                <div style={{opacity:.75, marginTop:4}}>{openProfile.email}</div>
                <div style={{marginTop:10}}><strong>Experience:</strong> {openProfile.experience || openProfile.experienceYears || '—'}</div>
                <div style={{marginTop:8}}><strong>Skills:</strong> {pretty(openProfile.skills || openProfile.candidate?.skills) || '—'}</div>
                <div style={{marginTop:8}}><strong>Location:</strong> {openProfile.location || '—'}</div>
                <div style={{marginTop:8}}><strong>Status:</strong> {openProfile.status || 'applied'}</div>
                <div style={{marginTop:8}}><strong>Applied:</strong> {openProfile.appliedAt || openProfile.when || ''}</div>

                {(() => {
                  const link = pickResumeLink(openProfile)
                  if (link) return null
                  return (
                    <div style={{marginTop:12}}>
                      <div style={{opacity:.8, marginBottom:6}}>No resume found. Paste a resume URL (PDF/DOC public link) or a PDF data URL:</div>
                      <div style={{display:'flex', gap:8}}>
                        <input value={resumeInput} onChange={e=>setResumeInput(e.target.value)} placeholder="https://... or data:application/pdf;base64,..." className="input" style={{flex:1}} />
                        <button className="btn" onClick={()=>saveResumeLinkForCandidate(resumeInput)}>Save</button>
                      </div>
                    </div>
                  )
                })()}

              </div>
              <div style={{height:'65vh', background:'#0f1422', border:'1px solid #1f2530', borderRadius:10, overflow:'hidden'}}>
                {(() => {
                  const l = pickResumeLink(openProfile);
                  if (!l) return <div style={{padding:12, opacity:.7}}>No resume uploaded.</div>
                  const v = viewerUrl(l);
                  return <iframe src={v} title="Resume" style={{width:'100%', height:'100%', border:0}} />
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}