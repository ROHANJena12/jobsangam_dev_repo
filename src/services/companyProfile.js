
// Unified company profile service.
// Reads recruiter company branding/details from localStorage in a resilient way
// and exposes a single shape the rest of the app can use.
import { read } from './store'

const KEY_MAIN = 'hh_company__' // we will use KEY_MAIN + email

function parseJSONMaybe(v){
  try{ return JSON.parse(v) }catch(e){ return null }
}

export function getCompanyProfile(email){
  if(!email) return {}
  // 1) Preferred: a single JSON blob
  const blob = parseJSONMaybe(localStorage.getItem(KEY_MAIN + email)) 
            || parseJSONMaybe(localStorage.getItem('hhh_company__' + email)) 
            || parseJSONMaybe(localStorage.getItem('hh_company_' + email)) 
            || {}
  // 2) Heuristic scan of keys that look like branding/profile for this email
  const out = { ...blob }
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i)
    if(!k) continue
    const kl = k.toLowerCase()
    if(!kl.includes(email.toLowerCase())) continue
    if(!(kl.includes('company') || kl.includes('branding'))) continue
    const val = localStorage.getItem(k)
    const j = parseJSONMaybe(val)
    if(j && typeof j==='object'){
      Object.assign(out, j)
      continue
    }
    if(kl.includes('logo')) out.logo = val
    else if(kl.includes('website')) out.website = val
    else if(kl.includes('tagline')) out.tagline = val
    else if(kl.includes('about') || kl.includes('desc')) out.about = val
    else if(kl.includes('name')) out.name = val
    else if(kl.includes('images') || kl.includes('gallery')){
      const arr = parseJSONMaybe(val); if(Array.isArray(arr)) out.gallery = arr
    }
  }
  // 3) Fallback to account/company name if present
  try {
    const me = read('hh_user', null) || {}
    if(me.email === email){
      if(!out.name && me.company) out.name = me.company
    }
  } catch(e){}

  return out
}
