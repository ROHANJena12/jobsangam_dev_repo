import React, { useState } from 'react';
import { recruiterApi } from '../services/recruiterApi';
import { auth } from '../services/store';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../components/SearchableSelect.jsx';
import { getGlossary } from '../services/glossary';
import { getCompanyProfile } from '../services/companyProfile';

function Field({label, children}){
  return (
    <label style={{display:'grid', gap:6}}>
      <div style={{fontSize:12, opacity:.85}}>{label}</div>
      {children}
    </label>
  );
}

export default function RecruiterPostJob(){
  const { skills: SKILLS, locations: LOCATIONS, experience: EXPERIENCE_RANGES, domains: DOMAINS, functions: FUNCTIONS } = getGlossary();
  const me = auth.me();
  const _companyProfile = getCompanyProfile(me?.email||'');
  const nav = useNavigate();
  const [title,setTitle]=useState('');
  const [company,setCompany]=useState(_companyProfile?.name || me?.company || '');
  const [department,setDepartment]=useState('');
  const [location,setLocation]=useState('Bengaluru, IN');
  const [workMode,setWorkMode]=useState('On-site');
  const [type,setType]=useState('Full-time');
  const [seniority,setSeniority]=useState('Mid');
  const [salaryMin,setSalaryMin]=useState('');
  const [salaryMax,setSalaryMax]=useState('');
  const [currency,setCurrency]=useState('INR');
  const [experience,setExperience]=useState('2-5 years');
  const [skills,setSkills]=useState(['React','JavaScript','CSS']);
  const [domain,setDomain] = useState('');
  const [functionalArea,setFunctionalArea] = useState('');
  const [description,setDescription]=useState('Build UI features and improve performance.');
  const [responsibilities,setResponsibilities]=useState('Develop features;Collaborate with backend;Write tests');
  const [requirements,setRequirements]=useState('2+ years React;Strong JS/TS;CSS fundamentals');
  const [applicationUrl,setApplicationUrl]=useState('https://example.com/apply');
  const [applicationEmail,setApplicationEmail]=useState(me?.email || '');
  const [deadline,setDeadline]=useState('');
  const [logo,setLogo]=useState(_companyProfile?.logo || '');
  const [featured,setFeatured]=useState(false);
function onLogo(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=> setLogo(String(ev.target?.result || ''));
    reader.readAsDataURL(file);
  }

  function post(e){
    e.preventDefault();
    const job = {
      id: 'job' + Date.now(),
      title,
      company: company || me?.company || 'Company',
      department,
      location,
      workMode,
      type,
      seniority,
      salary: (salaryMin && salaryMax) ? `${currency} ${salaryMin} - ${salaryMax}` : '',
      currency,
      experience,
      tags: Array.isArray(skills) ? skills : String(skills).split(',').map(s=>s.trim()).filter(Boolean),
      description,
      responsibilities: responsibilities.split(';').map(s=>s.trim()).filter(Boolean),
      requirements: requirements.split(';').map(s=>s.trim()).filter(Boolean),
      application: { url: applicationUrl, email: applicationEmail },
      deadline,
      logo,
      createdAt: new Date().toISOString(),
      ownerEmail: me?.email || 'recruiter@example.com',
      views: 0,
      featured,
      domain,
      functionalArea
    };
    // Merge company profile details automatically
    try {
      const cp = _companyProfile || {}
      job.company = job.company || cp.name || me?.company || ''
      if (cp.logo) job.logo = cp.logo
      if (cp.tagline) job.companyTagline = cp.tagline
      if (cp.website) job.companyWebsite = cp.website
      if (cp.about) job.companyDesc = cp.about
      if (Array.isArray(cp.gallery)) job.companyImages = cp.gallery
    } catch(e) {}
    /*__AUTO_COMPANY_MERGE__*/
    recruiterApi.createJob(job);
    alert('Job posted!');
    // Go to My Jobs in same tab (this page likely opened in a new tab).
    nav('/recruiter/my-jobs');
  }

  const inputStyle = {background:'#0b1220', color:'#e5e7eb', border:'1px solid #1f2530'};

  return (
    <div className="container-p" style={{padding:'24px 0', background:'#0b1220', color:'#e5e7eb', minHeight:'100vh'}}>
      <h1 className="h2" style={{margin:'0 0 12px'}}>Post a Job</h1>
      <form id='postJobForm' onSubmit={post} className="card" style={{display:'grid', gap:12, padding:16, background:'#0f172a', border:'1px solid #1f2530'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <Field label="Job Title"><input className="input" style={inputStyle} value={title} onChange={e=>setTitle(e.target.value)} required/></Field>
          <Field label="Company"><input className="input" style={inputStyle} value={company} onChange={e=>setCompany(e.target.value)} /></Field>
          <Field label="Department"><input className="input" style={inputStyle} value={department} onChange={e=>setDepartment(e.target.value)} placeholder="e.g., Engineering" /></Field>
          <Field label="Location"><SearchableSelect options={LOCATIONS} value={location} onChange={setLocation} placeholder="Choose location" style={inputStyle} /></Field>
          <Field label="Work Mode">
            <select className="input" style={inputStyle} value={workMode} onChange={e=>setWorkMode(e.target.value)}>
              <option>On-site</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>
          </Field>
          <Field label="Employment Type">
            <select className="input" style={inputStyle} value={type} onChange={e=>setType(e.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </Field>
          <Field label="Seniority">
            <select className="input" style={inputStyle} value={seniority} onChange={e=>setSeniority(e.target.value)}>
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
              <option>Lead</option>
            </select>
          </Field>
          <Field label="Experience"><SearchableSelect options={EXPERIENCE_RANGES} value={experience} onChange={setExperience} placeholder="Select range (e.g., 3-5)" style={inputStyle} /></Field>
          <Field label="Salary (min)"><input className="input" style={inputStyle} value={salaryMin} onChange={e=>setSalaryMin(e.target.value)} placeholder="e.g., 8 LPA"/></Field>
          <Field label="Salary (max)"><input className="input" style={inputStyle} value={salaryMax} onChange={e=>setSalaryMax(e.target.value)} placeholder="e.g., 15 LPA"/></Field>
          <Field label="Currency">
            <select className="input" style={inputStyle} value={currency} onChange={e=>setCurrency(e.target.value)}>
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </Field>
          <Field label="Skills"><SearchableSelect options={SKILLS} value={skills} onChange={setSkills} placeholder="Add skills" style={inputStyle} multi /></Field>
        </div>

        
<div className="grid2">
  <Field label="Domain">
    <SearchableSelect options={DOMAINS} value={domain} onChange={setDomain} placeholder="Select domain" style={inputStyle} />
  </Field>
  <Field label="Functional Area">
    <SearchableSelect options={FUNCTIONS} value={functionalArea} onChange={setFunctionalArea} placeholder="Select functional area" style={inputStyle} />
  </Field>
</div>
<Field label="Description">
          <textarea className="input" rows={5} style={inputStyle} value={description} onChange={e=>setDescription(e.target.value)} />
        </Field>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <Field label="Responsibilities (separate with ';')"><textarea className="input" rows={4} style={inputStyle} value={responsibilities} onChange={e=>setResponsibilities(e.target.value)} /></Field>
          <Field label="Requirements (separate with ';')"><textarea className="input" rows={4} style={inputStyle} value={requirements} onChange={e=>setRequirements(e.target.value)} /></Field>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          <Field label="Application URL"><input className="input" style={inputStyle} value={applicationUrl} onChange={e=>setApplicationUrl(e.target.value)} /></Field>
          <Field label="Application Email"><input className="input" style={inputStyle} value={applicationEmail} onChange={e=>setApplicationEmail(e.target.value)} /></Field>
          <Field label="Deadline"><input className="input" type="date" style={inputStyle} value={deadline} onChange={e=>setDeadline(e.target.value)} /></Field>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, alignItems:'center'}}>
          <Field label="Company Logo">
            <input type="file" accept="image/*" onChange={onLogo} />
            {logo && <img src={logo} alt="logo" style={{height:48, marginTop:8, borderRadius:8}} />}
          </Field>
          <Field label="Featured">
            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)} />
              <span>Feature this job</span>
            </label>
          </Field>
        </div>

        <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
          <button type="submit" className="btn">Post Job</button>
        </div>
    </form>
    </div>
  );
}