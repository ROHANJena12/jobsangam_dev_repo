import { commMessages, commAuth } from './communityBridge'

// Very lightweight localStorage-backed messaging for demo purposes.
// Conversations are keyed by id, each has participants (array of emails),
// and messages: [{ id, sender, body, ts, readBy: [emails] }]

import { read, write } from './store'
import { auth } from './store'

const KEY = 'hh_messages'

function now(){ return new Date().toISOString() }
function uid(){ return Math.random().toString(36).slice(2) }

function load(){ return read(KEY, { conversations: [] }) }
function save(data){ write(KEY, data) }

function normalizeEmail(x){ return (x||'').trim().toLowerCase() }

export function listConversations(myEmail = (auth.me()||{}).email){
  const data = load()
  const me = normalizeEmail(myEmail)
  return data.conversations
    .filter(c => c.participants.map(normalizeEmail).includes(me))
    .sort((a,b)=> (b.lastTs||'').localeCompare(a.lastTs||''))
}

export function getConversation(id){
  const data = load()
  return data.conversations.find(c=>c.id===id) || null
}

export function findOrCreateWith(otherEmail, initialBody=''){
  const me = (auth.me()||{}).email
  const a = normalizeEmail(me), b = normalizeEmail(otherEmail)
  if(!a || !b) throw new Error('Both participants required')
  const data = load()
  let convo = data.conversations.find(c=>{
    const p = c.participants.map(normalizeEmail)
    return p.includes(a) && p.includes(b) && p.length===2
  })
  if(!convo){
    convo = { id: uid(), participants:[me, otherEmail], lastTs: now(), messages: [] }
    data.conversations.push(convo)
    save(data)
  }
  if(initialBody){
    sendMessage(convo.id, initialBody, me)
  }
  return convo
}

export function sendMessage(conversationId, body, senderEmail=(auth.me()||{}).email){
  const data = load()
  const c = data.conversations.find(x=>x.id===conversationId)
  if(!c) throw new Error('Conversation not found')
  const msg = { id: uid(), body: (body||'').trim(), sender: senderEmail, ts: now(), readBy: [senderEmail] }
  if(!msg.body) return c
  c.messages.push(msg)
  c.lastTs = msg.ts
  save(data)
  return c
}

export function markRead(conversationId, readerEmail=(auth.me()||{}).email){
  const data = load()
  const c = data.conversations.find(x=>x.id===conversationId)
  if(!c) return
  c.messages.forEach(m=>{
    if(!m.readBy) m.readBy=[]
    if(!m.readBy.includes(readerEmail)) m.readBy.push(readerEmail)
  })
  save(data)
}

export function unreadCount(conversation, myEmail=(auth.me()||{}).email){
  const me = normalizeEmail(myEmail)
  return (conversation?.messages||[]).filter(m => !(m.readBy||[]).map(normalizeEmail).includes(me)).length
}

// Seed a demo conversation if none exist and a user is logged-in
export function ensureDemoThread(){
  const me = auth.me()
  if(!me) return
  const data = load()
  if(data.conversations.length) return
  const other = me.role==='employer' ? 'candidate@example.com' : 'recruiter@technova.co'
  const c = { id: uid(), participants:[me.email, other], lastTs: now(), messages: [] }
  c.messages.push({ id: uid(), body:'Hi there! Feel free to try the messaging demo.', sender: other, ts: now(), readBy:[other] })
  c.messages.push({ id: uid(), body:'Hello! Looks great — can we schedule a quick call?', sender: me.email, ts: now(), readBy:[me.email, other] })
  data.conversations.push(c)
  save(data)
}

// Community backend proxy
export async function threads(){ if(commAuth.enabled()) return await commMessages.threads(); const d=load(); return d.conversations; }
export async function messages(otherId){ if(commAuth.enabled()) return await commMessages.messages(otherId); const d=load(); const c=d.conversations.find(x=>x.participants.includes(otherId)); return (c&&c.messages)||[]; }
export async function send(otherId, text){ if(commAuth.enabled()) return await commMessages.send(otherId,text); const me = auth.me(); return sendMessage(otherId, text, me.email); }
export async function unreadTotal(){ if(commAuth.enabled()) { const r=await commMessages.unreadCount(); return (r&&(r.unread||r.count))||0; } return unread(); }
