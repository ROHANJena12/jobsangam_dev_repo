import { USE_COMMUNITY_BACKEND, COMMUNITY_API_BASE } from '../config/community'
function api(path, opts={}){
  const uid = (typeof localStorage!=='undefined' && localStorage.getItem('uid')) || ''
  return fetch(`${COMMUNITY_API_BASE}${path}`, { headers:{ 'Content-Type':'application/json', 'X-User-Id': uid }, credentials:'omit', ...opts }).then(r=>r.json())
}
export const commAuth = { enabled:()=>USE_COMMUNITY_BACKEND===true, login:(email,password)=>api('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})}), register:({name,email,password,role,company})=>api('/api/auth/register',{method:'POST',body:JSON.stringify({name,email,password,role,company})}), me:()=>api('/api/auth/me') }
export const commMessages = { threads:()=>api('/api/threads'), messages:(otherId)=>api(`/api/messages/${otherId}`), send:(otherId,text)=>api(`/api/messages/${otherId}`,{method:'POST',body:JSON.stringify({text})}), markRead:(otherId)=>api(`/api/messages/${otherId}/read`,{method:'POST'}), unreadCount:()=>api('/api/unread-count') }
export const commJobs = { all:()=>api('/api/jobs'), post:(b)=>api('/api/jobs',{method:'POST',body:JSON.stringify(b)}), apply:(jobId)=>api(`/api/apply/${jobId}`,{method:'POST'}), recruiters:()=>api('/api/recruiters') }
export const commProfiles = { users:()=>api('/api/users'), profile:(id)=>api(`/api/profile/${id}`), connect:(id)=>api(`/api/connect/${id}`,{method:'POST'}) }
