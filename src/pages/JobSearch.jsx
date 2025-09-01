import React, {useMemo, useState } from 'react'
import '../styles.jobs.css'
import { recruiterApi } from '../services/recruiterApi'
import { candidateApi } from '../services/candidateApi'
import JobDetailModal from '../components/JobDetailModal.jsx'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../components/Toast.jsx'

/** Map domain chips to real keywords in jobs */
const DOMAIN_KEYWORDS = {
  data:        ['data','data science','ml','ai','analytics','bi','python','pandas'],
  operations:  ['operations','ops','supply','logistics','support','customer'],
  marketing:   ['marketing', 'seo', 'sem', 'content', 'copy', 'growth', 'brand', 'performance'],
  engineering: ['engineer', 'developer', 'frontend', 'backend', 'full stack', 'react', 'node', 'python', 'java', 'javascript'],
  finance:     ['finance', 'accountant', 'accounts', 'tax', 'analyst', 'risk'],
  sales:       ['sales', 'business development', 'bd', 'account executive', 'sales manager'],
  hr:          ['hr', 'human resources', 'talent', 'recruiter', 'people'],
  design:      ['design', 'designer', 'ui', 'ux', 'product design', 'graphic'],
}

function canonicalDomain(x){
  if(!x) return ''
  const s = x.toLowerCase().trim()
  // direct keys and common synonyms
  const table = {
    'marketing': 'marketing', 'growth': 'marketing', 'seo': 'marketing', 'sem': 'marketing', 'content': 'marketing',
    'engineering': 'engineering', 'it': 'engineering', 'it & software': 'engineering', 'software': 'engineering',
    'developer': 'engineering', 'development': 'engineering', 'tech': 'engineering', 'technology': 'engineering',
    'data science': 'data', 'data': 'data', 'ml': 'data', 'ai': 'data',
    'finance': 'finance', 'accounting': 'finance', 'accounts': 'finance', 'tax': 'finance',
    'sales': 'sales', 'bd': 'sales', 'business development': 'sales',
    'hr': 'hr', 'human resources': 'hr', 'people': 'hr', 'recruiter': 'hr',
    'design': 'design', 'product design': 'design', 'ui': 'design', 'ux': 'design',
    'operations': 'operations', 'ops': 'operations',
  }
  if(table[s]) return table[s]
  // fuzzy: if any token matches a known keyword, map to that family
  for(const [key, list] of Object.entries(DOMAIN_KEYWORDS)){
    if(list.some(kw => s.includes(kw))) return key
  }
  return s
}
export default function JobSearch(){
const [params] = useSearchParams()
  const faParam = params.get('fa') || params.get('function') || params.get('functional');
;
const me = candidateApi.profile()
  const [q,setQ] = useState((params.get('q') || params.get('title') || '').trim())

function clearFilters(){
  try {
    const np = new URLSearchParams(params);
    ['q','title','loc','domain'].forEach(k => np.delete(k));
    setParams(np);
  } catch (e) {}
  setQ(''); setLoc(''); setDomainSel(''); setFuncSel(''); setVer(v=>v+1);
}
  const [loc,setLoc] = useState((params.get('loc') || '').trim())
  const [selected,setSelected] = useState(null)
  const [ver,setVer] = useState(0)
const toast = useToast()
  const domainParam = (params.get('domain') || '').trim().toLowerCase()

  const jobs = recruiterApi.allJobs()

  const list = useMemo(() => {
    let k = jobs.slice()

    // text query across title + description + tags
    if(q){
      const qq = q.toLowerCase()
      k = k.filter(j => {
        const title = (j.title||'').toLowerCase()
        const desc  = (j.description||'').toLowerCase()
        const tags  = (j.tags||[]).map(t => (t||'').toLowerCase())
        return title.includes(qq) || desc.includes(qq) || tags.some(t=>t.includes(qq))
      })
    }

    // location filter
    if(loc){
      const ll = loc.toLowerCase()
      k = k.filter(j => (j.location||'').toLowerCase().includes(ll))
    }

    // apply popular domain filter strictly (no fallback to all jobs)
    if(domainParam){
      const canon = canonicalDomain(domainParam); const keywords = DOMAIN_KEYWORDS[canon] || [domainParam]
      const matchesDomain = (j) => {
        if (j.domain) { return canonicalDomain(j.domain) === canon }
        const title = (j.title||'').toLowerCase()
        const desc  = (j.description||'').toLowerCase()
        const tags  = (j.tags||[]).map(t => (t||'').toLowerCase())
        return keywords.some(kw =>
          title.includes(kw) ||
          desc.includes(kw) ||
          tags.some(t => t.includes(kw))
        )
      }
      k = k.filter(matchesDomain)
    }

    // functional area filter
    if (faParam) {
      const fa = String(faParam).toLowerCase()
      k = k.filter(j => (j.functionalArea||'').toLowerCase().includes(fa))
    }

    // score & sort (re-using your existing helper)
    return k
      .map(j => ({ j, score: recruiterApi.computeRelevancy(j, me) }))
      .sort((a,b) => b.score - a.score)

  }, [jobs, q, loc, me, domainParam])

  function onSave(e, j){
    e.stopPropagation()
    try{
      candidateApi.toggleSave(j)
      setVer(v=>v+1); toast.show('Applied successfully', 'success'); toast.show('Saved to your list', 'success')
    }catch(err){
      toast.show(err.message || 'Unable to save job.', 'error')
    }
  }
  function onApply(e, j){
    e.stopPropagation()
    try{
      candidateApi.apply(j)
      setVer(v=>v+1)
    }catch(err){
      toast.show(err.message || 'Unable to apply.', 'error')
    }
  }


  const savedIds = new Set(candidateApi.savedJobs() || [])
  const appliedIds = new Set((candidateApi.applications() || []).map(a => a.jobId))
  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <h1 className="h2">Job Search</h1>

      <div style={{display:'grid', gridTemplateColumns:'1fr 180px', gap:12, margin:'12px 0 20px'}}>
        <input className="input" placeholder="Search by title or skills" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={loc} onChange={e=>setLoc(e.target.value)}>
          <option value="">All locations</option>
          <option>Bengaluru</option>
          <option>Hyderabad</option>
          <option>Pune</option>
          <option>Remote</option>
        </select>
      </div>

      {domainParam && (
        <div style={{marginBottom:8, fontSize:13, opacity:.8}}>
          Filtering by <b>{(domainParam||'')[0]? (domainParam[0].toUpperCase()+domainParam.slice(1)) : canon}</b> · <span style={{opacity:.7}}>matches: {list.length}</span>
        </div>
      )}

      {list.length===0 && (
        <div className="card" style={{padding:16, marginBottom:12}}>
          No jobs found for this domain yet.
        </div>
      )}

      {!domainParam || faParam ? (
        <div className="vstack" style={{gap:12}}>
          {list.map(({j}) => (
            <div key={j.id} className="card hover" style={{padding:16}} onClick={()=>setSelected(j)}>
              <div className="h5" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>{j.title}</span>
                <span style={{display:'flex', gap:8}}>
                  <button className="btn ghost" onClick={(e)=>onSave(e,j)} disabled={savedIds.has(j.id)}>{savedIds.has(j.id) ? 'Saved ✓' : 'Save'}</button>
                  <button className="btn primary" onClick={(e)=>onApply(e,j)} disabled={appliedIds.has(j.id)}>{appliedIds.has(j.id) ? 'Applied ✓' : 'Apply'}</button>
                </span>
              </div>
              <div style={{opacity:.8, fontSize:13}}>
                {j.company} • {j.location} • {j.type || 'Full-time'}{j.salary ? ` • ${j.salary}` : ''}
              </div>
              {j.companyTagline && (
                <div style={{marginTop:6, fontSize:13, opacity:.8}}>{j.companyTagline}</div>
              )}
              {(!domainParam) && (
                <div style={{marginTop:8, display:'flex', gap:6, flexWrap:'wrap'}}>
                  {(j.tags||[]).map(t => <span key={t} className="chip">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        (()=>{
          const groups = {}
          for (const {j} of list){
            const key = j.functionalArea || 'Other'
            ;(groups[key] ||= []).push(j)
          }
          const order = Object.keys(groups).sort()
          return (
            <div className="vstack" style={{gap:16}}>
              {order.map(key => (
                <div key={key} className="vstack" style={{gap:12}}>
                  <div className="h4" style={{marginTop:8}}>{key}</div>
                  {groups[key].map(j => (
                    <div key={j.id} className="card hover" style={{padding:16}} onClick={()=>setSelected(j)}>
                      <div className="h5" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span>{j.title}</span>
                        <span style={{display:'flex', gap:8}}>
                          <button className="btn ghost" onClick={(e)=>onSave(e,j)} disabled={savedIds.has(j.id)}>{savedIds.has(j.id) ? 'Saved ✓' : 'Save'}</button>
                          <button className="btn primary" onClick={(e)=>onApply(e,j)} disabled={appliedIds.has(j.id)}>{appliedIds.has(j.id) ? 'Applied ✓' : 'Apply'}</button>
                        </span>
                      </div>
                      <div style={{opacity:.8, fontSize:13}}>
                        {j.company} • {j.location} • {j.type || 'Full-time'}{j.salary ? ` • ${j.salary}` : ''}
                      </div>
                      {j.companyTagline && (
                        <div style={{marginTop:6, fontSize:13, opacity:.8}}>{j.companyTagline}</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })()
      )}


      {selected && (
        <JobDetailModal job={selected} candidateSkills={me?.skills || []} onClose={()=>setSelected(null)} />
      )}
    </div>
  )
}