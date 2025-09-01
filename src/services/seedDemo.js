import { read, write } from './store'
const JOBS_KEY='hh_jobs', APPS_KEY='hh_apps'
export function seedDemoIfNeeded(){
  if(localStorage.getItem('hh_seeded_full_v1')) return
  // Do not automatically sign in a demo user.  Only seed sample jobs if the
  // jobs list is empty.  We also avoid setting any company branding on the
  // root keys so that recruiter settings remain scoped by email.
  const userEmail = 'recruiter@technova.co'
  // Provide a fallback logo for seeded jobs using a generic placeholder
  const defaultLogo = 'https://avatars.githubusercontent.com/u/9919?s=200&v=4'
  const job1={ id:'job001', title:'Frontend React Developer', company:'TechNova Systems', location:'Bengaluru', salary:'₹8–12 LPA', type:'Full-time', tags:['react','javascript','css'], description:'Build UI features and improve performance.', ownerEmail:userEmail, postedAt:new Date().toISOString(), views:42, featured:false, logo: defaultLogo }
  const job2={ id:'job002', title:'Data Analyst', company:'TechNova Systems', location:'Hyderabad', salary:'₹6–9 LPA', type:'Full-time', tags:['sql','python','excel'], description:'Analyze data, build dashboards, support decisions.', ownerEmail:userEmail, postedAt:new Date().toISOString(), views:37, featured:true, logo: defaultLogo }
  write(JOBS_KEY,[job1,job2])
  const apps={}
  apps[job1.id]=[
    { email:'priya@example.com', status:'applied', candidate:{ name:'Priya Sharma', skills:['react','node.js','css'] } },
    { email:'ananya@example.com', status:'shortlisted', candidate:{ name:'Ananya Gupta', skills:['react','typescript'] } }
  ]
  apps[job2.id]=[
    { email:'rohit@example.com', status:'interview', candidate:{ name:'Rohit Verma', skills:['sql','python','excel'] } }
  ]
  write(APPS_KEY,apps)
  // History + resumes
  write('hh_hist_'+job1.id+'__'+'priya@example.com', [{when:new Date().toISOString(), from:'-', to:'applied'}])
  write('hh_hist_'+job1.id+'__'+'ananya@example.com', [{when:new Date().toISOString(), from:'applied', to:'shortlisted'}])
  write('hh_hist_'+job2.id+'__'+'rohit@example.com', [{when:new Date().toISOString(), from:'shortlisted', to:'interview'}])
  write('hh_resume_'+job1.id+'__'+'priya@example.com', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
  write('hh_resume_'+job2.id+'__'+'rohit@example.com', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
  // Scheduler
  const today=new Date()
  const fmt=(d)=>{ const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes()) }
  write('hh_slots_'+job1.id,[{id:Date.now(),when:fmt(new Date(today.getFullYear(),today.getMonth(),today.getDate()+1,14,0)),status:'open'},{id:Date.now()+1,when:fmt(new Date(today.getFullYear(),today.getMonth(),today.getDate()+2,16,0)),status:'open'}])
  write('hh_slots_'+job2.id,[{id:Date.now()+2,when:fmt(new Date(today.getFullYear(),today.getMonth(),today.getDate()+3,11,30)),status:'open'}])
  // Revenue
  write('hh_revenue',[{id:Date.now()-100000,type:'boost',amount:299,currency:'INR',jobId:job2.id},{id:Date.now()-50000,type:'plan-pro',amount:999,currency:'INR',who:userEmail}])
  // Community seed
  write('hh_posts',[
    { id:'p1', title:'Best React interview prep?', body:'Share your favorite resources and tips!', category:'IT', author:'Priya S', createdAt:new Date().toISOString(), approved:true, comments:[{id:'c1', author:'Ananya', text:'react.dev/learn + coding exercises', createdAt:new Date().toISOString()}] },
    { id:'p2', title:'SQL vs NoSQL for analytics roles', body:'What do recruiters expect?', category:'Data', author:'Rohit V', createdAt:new Date().toISOString(), approved:true, comments:[] },
  ])
  localStorage.setItem('hh_seeded_full_v1','1')
}
