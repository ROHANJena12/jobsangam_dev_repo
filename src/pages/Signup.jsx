import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login, createAccount } from '../services/store'
import { candidateApi } from '../services/candidateApi'
import { authRegister } from '../services/authApi'

export default function Signup(){
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [role,setRole]=useState('candidate')
  useEffect(()=>{ const as = params.get('as'); if(as==='candidate' || as==='employer') setRole(as==='employer'?'recruiter':'candidate') }, [params])

  const [email,setEmail]=useState('')
  const [name,setName]=useState('')
  const [company,setCompany]=useState('')
  const [password, setPassword] = useState('')
  // Additional profile inputs
  const [location,setLocation] = useState('Bengaluru')
  const [skills,setSkills] = useState('react, javascript')
  const [phone,setPhone] = useState('')
  const [summary,setSummary] = useState('')

  async function submit(e){
    e.preventDefault()
    const mappedRole = role==='recruiter' ? 'employer' : (role==='admin' ? 'admin' : 'candidate')
    try {
      // Wait for registration response
      const result = await authRegister({ name, email, password, role, company, location })
      if (result.error) {
        alert(result.error)
        return
      }
      // Log the user in to establish a session. Only pass basic identity fields.
      const u = login({ role: mappedRole, email, name, company })
      // Persist candidate profile fields if the role is candidate
      if (mappedRole === 'candidate') {
        const skillsArr = skills.split(',').map((s) => s.trim()).filter(Boolean)
        candidateApi.saveProfile({
          name,
          email,
          title: '',
          location,
          skills: skillsArr,
          phone,
          summary,
          resumeSrc: ''
        })
      }
      // Recruiter company info is saved via RecruiterSettings after signup
      if(u.role==='employer') nav('/employer/dashboard')
      else if(u.role==='admin') nav('/admin')
      else nav('/candidate/dashboard')
    } catch (err) {
      alert(err.message || 'Signup failed')
    }
  }

  return <div className="container-p" style={{padding:'48px 0'}}>
    <div className="card" style={{padding:24, maxWidth:560, margin:'0 auto'}}>
      <div className="h2">Create your account</div>
      <form onSubmit={submit} style={{display:'grid', gap:8, marginTop:12}}>
        <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
        <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {role==='recruiter' && (
          <>
            <input className="input" placeholder="Company" value={company} onChange={e=>setCompany(e.target.value)} />
            <input className="input" placeholder="Company Location" value={location} onChange={e=>setLocation(e.target.value)} />
          </>
        )}
        {role==='candidate' && (
          <>
            <input className="input" placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
            <input className="input" placeholder="Skills (comma separated)" value={skills} onChange={e=>setSkills(e.target.value)} />
            <input className="input" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
            <textarea className="input" placeholder="Professional summary" value={summary} onChange={e=>setSummary(e.target.value)} style={{minHeight:80}} />
          </>
        )}
        <button className="btn" type="submit">Sign up</button>
      </form>
      <div style={{marginTop:8}}><a className="btn-ghost" onClick={()=>nav('/login')}>Already have an account? Login</a></div>
    </div>
  </div>
}
