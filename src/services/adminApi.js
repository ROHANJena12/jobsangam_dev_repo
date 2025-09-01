import { COMMUNITY_API_BASE } from '../config/community'

function api(path, opts={}){
  const uid = (typeof localStorage!=='undefined' && localStorage.getItem('uid')) || ''
  return fetch(`${COMMUNITY_API_BASE}${path}`, { headers:{ 'Content-Type':'application/json', 'X-User-Id': uid }, ...opts }).then(r=>r.json())
}

export const adminApi = {
  // Overview/flags/broadcast exist elsewhere
  summary: ()=> api('/api/admin/summary'),
  getFlags: ()=> api('/api/admin/flags'),
  setFlags: (flags)=> api('/api/admin/flags', { method:'POST', body: JSON.stringify(flags||{}) }),
  announce: (text)=> api('/api/admin/announce', { method:'POST', body: JSON.stringify({ text }) }),

  // Users
  users: ({ q='', role='', status='' }={}) => api(`/api/admin/users?q=${encodeURIComponent(q)}&role=${encodeURIComponent(role)}&status=${encodeURIComponent(status)}`),
  updateUser: (id, payload) => api(`/api/admin/users/${id}`, { method:'PATCH', body: JSON.stringify(payload||{}) }),

  // Jobs moderation
  jobs: ({ status='' }={}) => api(`/api/admin/jobs?status=${encodeURIComponent(status)}`),
  approveJob: (id) => api(`/api/admin/jobs/${id}/approve`, { method:'POST' }),
  rejectJob: (id, reason='') => api(`/api/admin/jobs/${id}/reject`, { method:'POST', body: JSON.stringify({ reason }) }),

  // Audit
  audit: ({ actor='', action='', limit=200 }={}) => api(`/api/admin/audit?actor=${encodeURIComponent(actor)}&action=${encodeURIComponent(action)}&limit=${encodeURIComponent(String(limit))}`),
}
