import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { recruiterApi } from '../services/recruiterApi'
import { auth } from '../services/store'

/** =====================
 * Animated Neurons Canvas
 * ======================*/
function NeuronsCanvas({ className, line='rgba(56,189,248,', dot='rgba(125,211,252,0.9)' }){
  const canvasRef = useRef(null)
  const parentRef = useRef(null)

  useEffect(()=>{
    const canvas = canvasRef.current
    const parent = parentRef.current
    if(!canvas || !parent) return
    const ctx = canvas.getContext('2d')
    let width=0, height=0, raf=0
    const DPR = window.devicePixelRatio || 1
    let dots = []

    function init(){
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(width * DPR))
      canvas.height = Math.max(1, Math.floor(height * DPR))
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(DPR,0,0,DPR,0,0)

      const count = Math.max(28, Math.floor((width*height)/14000))
      dots = Array.from({length: count}).map(()=> ({
        x: Math.random()*width,
        y: Math.random()*height,
        vx: (Math.random()-0.5)*0.35,
        vy: (Math.random()-0.5)*0.35
      }))
    }

    function step(){
      ctx.clearRect(0,0,width,height)
      for(const d of dots){
        d.x += d.vx; d.y += d.vy
        if(d.x<0||d.x>width) d.vx*=-1
        if(d.y<0||d.y>height) d.vy*=-1
      }
      for(let i=0;i<dots.length;i++){
        for(let j=i+1;j<dots.length;j++){
          const a=dots[i], b=dots[j]
          const dx=a.x-b.x, dy=a.y-b.y
          const dist=Math.hypot(dx,dy)
          if(dist<120){
            const alpha = Math.max(0, 1 - dist/120) * .6
            ctx.strokeStyle = `${line}${alpha})`
            ctx.lineWidth=1
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke()
          }
        }
      }
      ctx.fillStyle = dot
      for(const d of dots){
        ctx.beginPath(); ctx.arc(d.x,d.y,1.6,0,Math.PI*2); ctx.fill()
      }
      raf = requestAnimationFrame(step)
    }

    const ro = new ResizeObserver(()=>init())
    ro.observe(parent)
    init(); step()
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect() }
  }, [line, dot])

  return <div ref={parentRef} className={className} style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:0}}>
    <canvas ref={canvasRef} />
  </div>
}

/** Small stat pill */
function Stat({label, value}){
  return <div style={{display:'flex', gap:6, alignItems:'center'}}>
    <div style={{opacity:.85}}>{label}</div>
    <span className="pill pill-soft">{value}</span>
  </div>
}

export default function Home(){
  const nav = useNavigate()
  const me = auth.me()
  const jobs = recruiterApi.myJobs()
  const featured = jobs.slice(0, 6)

  // Modes/tabs control visuals and quick filters
  const [mode,setMode] = useState('tech') // 'tech' | 'nontech' | 'remote' | 'fresher'
  const line = mode==='tech' ? 'rgba(56,189,248,' : mode==='nontech' ? 'rgba(168,85,247,' : 'rgba(34,197,94,'
  const dot  = mode==='tech' ? 'rgba(125,211,252,0.9)' : mode==='nontech' ? 'rgba(245,208,254,0.9)' : 'rgba(134,239,172,0.9)'

  // live search
  const [title,setTitle] = useState('Frontend React Developer')
  const [loc,setLoc] = useState('Bengaluru')

  // live suggestions from available jobs (fallback to myJobs)
  const allJobs = recruiterApi.allJobs ? recruiterApi.allJobs() : recruiterApi.myJobs()
  const suggestions = useMemo(()=>{
    const q = (title||'').toLowerCase().trim()
    const l = (loc||'').toLowerCase().trim()
    return (allJobs||[]).filter(j=>{
      const t = (j.title||'').toLowerCase()
      const d = (j.description||'').toLowerCase()
      const tags = (j.tags||[]).join(' ').toLowerCase()
      const locok = !l || (j.location||'').toLowerCase().includes(l)
      const qok = !q || t.includes(q) || d.includes(q) || tags.includes(q)
      return locok && qok
    }).slice(0,5)
  }, [title, loc, allJobs])
  const popular = ['React Developer','Data Analyst','DevOps Engineer','Marketing Manager','Product Designer']


  const DOMAINS = [
    {k:'it', name:'IT & Software'},
    {k:'data', name:'Data Science'},
    {k:'mkt', name:'Marketing'},
    {k:'fin', name:'Finance'},
    {k:'design', name:'Design'},
    {k:'hr', name:'HR'},
    {k:'ops', name:'Operations'},
  ]

  const filteredFeatured = useMemo(()=>{
    if(mode==='remote') return featured.filter(j=> (j.location||'').toLowerCase().includes('remote'))
    if(mode==='fresher') return featured.filter(j=> /intern|junior|fresher/i.test(j.title||''))
    return featured
  }, [featured, mode])

  const cta = { borderRadius:999, padding:'10px 14px', border:'1px solid #1f2530', background:'#0f172a', color:'#e5e7eb', cursor:'pointer' }
  const primary = { ...cta, background:'#0ea5e9', color:'#031b16', border:'none' }

  return (
    <div className="container-p" style={{paddingTop:8, paddingBottom:32}}>


      {/* HERO */}
      <section className="hero-card" style={{
        position:'relative', borderRadius:24, padding:24,
        background:`radial-gradient(1200px 380px at 20% 40%, ${mode==='tech' ? 'rgba(56,189,248,.22)' : mode==='nontech' ? 'rgba(168,85,247,.20)' : 'rgba(34,197,94,.18)'}, transparent 60%), #0f172a`,
        border:'1px solid #1f2530', overflow:'hidden', marginTop:12
      }}>
        <NeuronsCanvas className="hero-neurons" line={line} dot={dot} />
        <div className="hero-grid">
          <div>
            <div className="hero-topline">
              <span>✨ New: Smart matching + Resume Builder</span>
              <div className="segmented">
                {['tech','nontech','remote','fresher'].map(m=>(
                  <button key={m} className={mode===m?'active':''} onClick={()=>setMode(m)}>
                    {m==='tech'?'Tech':m==='nontech'?'Non‑Tech':m==='remote'?'Remote':'Fresher'}
                  </button>
                ))}
              </div>
            </div>
            <h1 className="headline">Land your <span className="accent">next role</span> faster</h1>
            <p className="lede">
              A modern Indian job portal with <strong>Match%</strong>, <strong>ATS‑friendly resumes</strong>, and <strong>recruiter pipelines</strong>. Beautiful, fast, and community‑driven.
            </p>
            <div className="cta-row">
              <button style={primary} onClick={()=>nav('/candidate')}>I’m a Candidate</button>
              <button style={cta} onClick={()=>nav('/employer')}>I’m a Recruiter</button>
              <button style={cta} onClick={()=>nav('/jobs')}>Browse Jobs</button>
            </div>
            <div className="stats">
              <Stat label="Trending" value="Marketing Manager" />
              <Stat label="Avg. time‑to‑apply" value="~60s" />
              <Stat label="Community posts" value="2k+" />
            </div>
          </div>

          {/* Right search card */}
          <div className="card glass live-card">
            <div className="live-head">
              <div className="muted">Live Search</div>
              <div className="live-popular">
                {popular.map((p,i)=> (
                  <button key={i} className="pill pill-soft" onClick={()=>setTitle(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div className="search-grid">
              <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Job title e.g. React Developer" />
              <input className="input" value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Location e.g. Bengaluru" />
              <button className="btn" onClick={()=>nav(`/jobs?q=${encodeURIComponent(title)}&loc=${encodeURIComponent(loc)}`)}>Search</button>
            </div>
            <div className="results">
              {suggestions.length>0 ? suggestions.map((j)=> (
                <div key={j.id} className="result-row">
                  <div className="result-main">
                    <div className="result-title">{j.title}</div>
                    <div className="result-meta muted small">{j.company} · {j.location} · {j.type}</div>
                    <div className="result-tags">{(j.tags||[]).slice(0,3).map((t,i)=>(<span key={i} className="pill pill-soft">{t}</span>))}</div>
                  </div>
                  <div className="result-cta">
                    <button className="btn-ghost" onClick={()=>nav('/jobs')}>View</button>
                    <button className="btn">Apply</button>
                  </div>
                </div>
              )) : (
                <div className="skeletons">
                  <div className="skeleton-row"><span className="s1"></span><span className="s2"></span></div>
                  <div className="skeleton-row"><span className="s1"></span><span className="s2"></span></div>
                  <div className="skeleton-row"><span className="s1"></span><span className="s2"></span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="marquee-wrap">
        <div className="marquee">
          {['React','Java','DevOps','Data Science','Design','Finance','Marketing','Cloud','Security','SRE','Python','Analytics','Copywriting','HR','Sales'].map((t,i)=>(
            <button key={i} className="pill" style={{cursor:'pointer'}} onClick={()=>nav(`/jobs?domain=${encodeURIComponent(t)}`)}>{t}</button>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section>
        <div className="section-head">
          <h2>Explore by domain</h2>
          <Link className="btn-ghost" to="/jobs">View all</Link>
        </div>
        <div className="domain-grid">
          {DOMAINS.map(d=>(
            <button key={d.k} className="card domain" onClick={()=>nav(`/jobs?domain=${encodeURIComponent(d.name)}`)}>
              <div className="domain-title">{d.name}</div>
              <div className="small muted">Explore jobs in {d.name.split('&')[0].trim()}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      <section>
        <div className="section-head">
          <h2>{mode==='remote'?'Remote ':mode==='fresher'?'Fresher ':''}Featured jobs</h2>
          <Link className="btn-ghost" to="/jobs">Browse Jobs</Link>
        </div>
        <div className="jobs-grid">
          {filteredFeatured.map(j=>(
            <div key={j.id} className="card job hover-lift">
              <div className="job-title">{j.title}</div>
              <div className="muted small">{j.company} · {j.location} · {j.type}</div>
              <div className="tags">
                {(j.tags||[]).slice(0,4).map((t,i)=>(<span key={i} className="pill pill-soft">{t}</span>))}
              </div>
              <div className="job-cta">
                <button className="btn-ghost" onClick={()=>nav('/jobs')}>View</button>
                <button className="btn">Apply</button>
              </div>
            </div>
          ))}
          {filteredFeatured.length===0 && (
            <div className="muted" style={{opacity:.8}}>No featured jobs yet.</div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="brand">HireHorizonHub</div>
            <p className="small muted">A modern job portal with Match%, ATS‑friendly resumes, and recruiter pipelines.</p>
          </div>
          <div>
            <div className="foot-head">Product</div>
            <ul>
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/candidate">Resume Builder</Link></li>
              <li><Link to="/recruiter/my-jobs">Recruiter</Link></li>
            </ul>
          </div>
          <div>
            <div className="foot-head">Company</div>
            <ul>
              <li><Link to="/community">Community</Link></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div>
            <div className="foot-head">Support</div>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="small muted" style={{marginTop:12}}>© {new Date().getFullYear()} HireHorizonHub. All rights reserved.</div>
      </footer>
    </div>
  )
}
