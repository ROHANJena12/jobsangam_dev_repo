import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, authenticateAccount } from '../services/store'

export default function Login(){
  const nav = useNavigate()
  const [email,setEmail]=useState('')
  const [password, setPassword] = useState('')

  function submit(e){
    e.preventDefault()
    // Attempt to authenticate against stored accounts
    const acc = authenticateAccount({ email, password })
    if (!acc) {
      alert('Invalid email or password')
      return
    }
    
    // Set session using stored account details
    const u = login({ role: acc.role, email: acc.email, name: acc.name, company: acc.company })
    // Smart redirect
    if (u.role === 'employer') {
      try {
        const last = localStorage.getItem('hhh_last_recruiter_path');
        nav(last && last.startsWith('/recruiter/') ? last : '/recruiter/my-jobs');
      } catch (e) {
        nav('/recruiter/my-jobs');
      }
    } else if (u.role === 'admin') {
      nav('/admin')
    } else {
      nav('/candidate/dashboard')
    }

  }

  return <div className="container-p" style={{padding:'48px 0'}}>
    <div className="card" style={{padding:24, maxWidth:560, margin:'0 auto'}}>
      <div className="h2">Login</div>
      <form onSubmit={submit} style={{display:'grid', gap:8, marginTop:12}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit">Login</button>
      </form>
      <div style={{marginTop:8}}><a className="btn-ghost" onClick={()=>nav('/signup')}>Create an account</a></div>
    </div>
  </div>
}
