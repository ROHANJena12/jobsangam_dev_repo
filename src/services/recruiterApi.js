import { read, write, auth } from './store'
const JOBS_KEY='hh_jobs', APPS_KEY='hh_apps'

export const recruiterApi = {
  getJob(id, { bumpViews=false } = {}){ const all=this.allJobs(); const j=all.find(x=>x.id===id); if(!j) return null; if(bumpViews){ const i=all.findIndex(x=>x.id===id); all[i]={...all[i], views:(all[i].views||0)+1}; write(JOBS_KEY, all); } return j; },
  /**
   * Return all jobs posted in the system.  If no jobs exist in localStorage,
   * automatically seed the store with a handful of demo jobs so that the
   * home page and job search have content.  Seeding happens only once: if
   * jobs already exist the stored list is returned unchanged.
   */
  allJobs() {
    let jobs = read(JOBS_KEY, []) || []
    // Auto‑seed with sample jobs if none exist.  This makes the demo usable
    // immediately after loading without the recruiter having to post jobs.
    if (jobs.length === 0) {
      const now = new Date().toISOString()
      jobs = [
        {
          id: 'j_demo1',
          title: 'Frontend Developer (React)',
          company: 'TechNova Systems',
          location: 'Remote',
          salary: '₹8–12 LPA',
          type: 'Full‑time',
          tags: ['react','javascript','css'],
          domain: 'engineering',
          functionalArea: 'Frontend Engineering',
          description: 'Build UI features and improve performance.',
          ownerEmail: 'recruiter@technova.co',
          postedAt: now,
          views: 0,
          featured: false,
          domain: 'engineering',
          functionalArea: 'Software Engineering'
        },
        {
          id: 'j_demo2',
          title: 'Backend Developer (Node.js)',
          company: 'TechNova Systems',
          location: 'Bengaluru',
          salary: '₹10–15 LPA',
          type: 'Full‑time',
          tags: ['node','express','mongodb'],
          domain: 'engineering',
          functionalArea: 'Backend Engineering',
          description: 'Develop scalable APIs and microservices.',
          ownerEmail: 'recruiter@technova.co',
          postedAt: now,
          views: 0,
          featured: false,
          domain: 'engineering',
          functionalArea: 'Software Engineering'
        },
        {
          id: 'j_demo3',
          title: 'Data Analyst',
          company: 'DataCraft Analytics',
          location: 'Hyderabad',
          salary: '₹6–9 LPA',
          type: 'Full‑time',
          tags: ['sql', 'python', 'excel'],
          description: 'Analyze data and generate actionable insights.',
          ownerEmail: 'recruiter@datacraft.co',
          postedAt: now,
          views: 0,
          featured: false,
          domain: 'engineering',
          functionalArea: 'Software Engineering'
        },
        {
          id: 'j_demo4',
          title: 'Marketing Manager',
          company: 'AdTechly',
          location: 'Delhi NCR',
          salary: '₹8–14 LPA',
          type: 'Full‑time',
          tags: ['marketing', 'digital', 'seo'],
          description: 'Lead marketing campaigns and digital strategy.',
          ownerEmail: 'recruiter@adtechly.com',
          postedAt: now,
          views: 0,
          featured: false
        }
      ]
      write(JOBS_KEY, jobs)
    }
    return jobs
  },
  myJobs(){ const me=auth.me(); return this.allJobs().filter(j=> j.ownerEmail===me?.email) },
  applicants(jobId){ const apps=read(APPS_KEY, {}); return apps[jobId]||[] },
  setStatus(jobId, email, status){
    // record history
    const histKey = 'hh_hist_'+jobId+'__'+email
    const apps=read(APPS_KEY, {}); const arr=apps[jobId]||[]
    let prev='applied'; arr.forEach(a=>{ if(a.email===email){ prev=a.status||'applied' } })
    const when=new Date().toISOString()
    const hist = read(histKey, [])||[]; hist.push({ when, from: prev, to: status }); write(histKey, hist)
    apps[jobId]=arr.map(a=> a.email===email?{...a,status}:a ); write(APPS_KEY, apps)
  },
  createJob(job){ const all=this.allJobs(); write(JOBS_KEY,[job,...all]) },
  updateJob(id, patch){ const all=this.allJobs(); const i=all.findIndex(j=>j.id===id); if(i>=0){ all[i]={...all[i],...patch}; write(JOBS_KEY,all) } },
  deleteJob(id){ const all=this.allJobs().filter(j=>j.id!==id); write(JOBS_KEY,all); const apps=read(APPS_KEY, {}); delete apps[id]; write(APPS_KEY, apps) },
  toggleArchive(id){ const all=this.allJobs(); const i=all.findIndex(j=>j.id===id); if(i>=0){ all[i].archived=!all[i].archived; write(JOBS_KEY,all) } },
  cloneJob(id){ const all=this.allJobs(); const j=all.find(x=>x.id===id); if(!j) return; const copy={...j, id:'j_'+Math.random().toString(36).slice(2,9), postedAt:new Date().toISOString(), views:0, featured:false}; write(JOBS_KEY,[copy,...all]) },
  computeRelevancy(job, cand){ const jt=(job.tags||[]).map(s=>s.toLowerCase()); const cs=(cand.skills||[]).map(s=>s.toLowerCase()); const match = jt.filter(s=>cs.includes(s)).length; return Math.round((match / Math.max(1,jt.length))*100) }
}
