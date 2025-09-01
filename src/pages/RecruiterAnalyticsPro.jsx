import React, { useMemo, useState } from 'react'
import { recruiterApi } from '../services/recruiterApi'
import { read } from '../services/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
export default function RecruiterAnalyticsPro() {
  const jobs = recruiterApi.myJobs()
  const appsMap = read('hh_apps', {})
  const [job, setJob] = useState('all')
  const [loc, setLoc] = useState('all')
  // The analytics page is now always unlocked.  Premium and credit checks
  // have been removed so everyone can explore these insights.
  const perJob = jobs.map((j) => ({ name: j.title, apps: (appsMap[j.id] || []).length }))
  const funnel = useMemo(() => {
    let f={applied:0,shortlisted:0,interview:0,offer:0,hired:0,rejected:0}
    Object.entries(appsMap).forEach(([jid, arr])=>{
      const j = jobs.find(x=>x.id===jid); if(!j) return
      if(job!=='all' && job!==jid) return
      if(loc!=='all' && (j.location||'').toLowerCase()!==loc.toLowerCase()) return
      arr.forEach(a=>{ f[a.status||'applied']=(f[a.status||'applied']||0)+1 })
    })
    return Object.entries(f).map(([k,v])=>({name:k,value:v}))
  }, [appsMap, job, loc])
  const skills = useMemo(() => {
    const map={}
    Object.entries(appsMap).forEach(([jid,arr])=>{
      const j = jobs.find(x=>x.id===jid); if(!j) return
      if(job!=='all' && job!==jid) return
      if(loc!=='all' && (j.location||'').toLowerCase()!==loc.toLowerCase()) return
      arr.forEach(a=> (a.candidate?.skills||[]).forEach(s=>{ const k=s.toLowerCase(); map[k]=(map[k]||0)+1 }))
    })
    return Object.entries(map).map(([k,v])=>({name:k,count:v})).sort((a,b)=>b.count-a.count).slice(0,10)
  }, [appsMap, job, loc])
  const locations = Array.from(new Set(jobs.map((j) => j.location))).filter(Boolean)

  return (
    <div className="container-p" style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="h2">Recruiter Analytics</h1>
      </div>
      {/* Filters */}
      <div className="card" style={{ padding: 16, margin: '12px 0' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Filters</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <select className="input" value={job} onChange={(e) => setJob(e.target.value)}>
            <option value="all">All jobs</option>
            {jobs.map((j) => (
              <option value={j.id} key={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <select className="input" value={loc} onChange={(e) => setLoc(e.target.value)}>
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select className="input" disabled>
            <option>Last 30 days (demo)</option>
          </select>
        </div>
      </div>
      {/* Applications per job */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Applications per job</div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={perJob}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="apps" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Funnel conversion */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Funnel conversion</div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Top candidate skills */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Top candidate skills</div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={skills}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
