import React, { useMemo } from 'react'
import { candidateApi } from '../services/candidateApi'
import { recruiterApi } from '../services/recruiterApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
export default function CandidateAnalytics(){
  const apps = candidateApi.applications()
  const jobs = recruiterApi.allJobs()
  const perStatus = useMemo(()=>{ const m={}; apps.forEach(a=>{ m[a.status]=(m[a.status]||0)+1 }); return Object.entries(m).map(([name,value])=>({name,value})) }, [apps])
  const perLocation = useMemo(()=>{ const m={}; apps.forEach(a=>{ const j=jobs.find(x=>x.id===a.jobId)||{}; const k=j.location||'—'; m[k]=(m[k]||0)+1 }); return Object.entries(m).map(([name,value])=>({name,value})) }, [apps, jobs])
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">My Analytics</h1>
    <div className="card" style={{padding:16, margin:'12px 0'}}>
      <div style={{fontWeight:600, marginBottom:6}}>Applications by status</div>
      <div style={{width:'100%',height:280}}>
        <ResponsiveContainer><BarChart data={perStatus}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" /></BarChart></ResponsiveContainer>
      </div>
    </div>
    <div className="card" style={{padding:16}}>
      <div style={{fontWeight:600, marginBottom:6}}>Applications by location</div>
      <div style={{width:'100%',height:280}}>
        <ResponsiveContainer><BarChart data={perLocation}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" /></BarChart></ResponsiveContainer>
      </div>
    </div>
  </div>
}
