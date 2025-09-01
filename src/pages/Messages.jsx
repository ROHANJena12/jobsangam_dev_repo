
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ensureDemoThread, listConversations, getConversation, sendMessage, markRead, unreadCount } from '../services/messagesApi'
import { auth } from '../services/store'

function Avatar({ email, size=32 }){
  const letter = (email||'?')[0].toUpperCase()
  return <div style={{width:size,height:size,borderRadius:999,background:'#0f172a',border:'1px solid #1f2530',display:'grid',placeItems:'center'}}>{letter}</div>
}

function formatTime(ts){
  try { const d=new Date(ts); return d.toLocaleString() } catch { return '' }
}

export default function Messages(){
  const me = auth.me()
  const [convos, setConvos] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [body, setBody] = useState('')
  const listRef = useRef(null)
  const chatRef = useRef(null)

  useEffect(()=>{ ensureDemoThread(); refresh() }, [])
  function refresh(){
    const list = listConversations(me?.email)
    setConvos(list)
    if(!activeId && list[0]) setActiveId(list[0].id)
  }

  const active = useMemo(()=> convos.find(c=>c.id===activeId) || getConversation(activeId), [convos, activeId])
  const other = useMemo(()=>{
    const mine = (me?.email||'').toLowerCase()
    const x = (active?.participants||[]).find(p=> (p||'').toLowerCase()!==mine)
    return x || 'Someone'
  }, [active, me])

  useEffect(()=>{
    if(active?.id){ markRead(active.id, me?.email); setTimeout(refresh, 0) }
  }, [active?.id])

  useEffect(()=>{
    const el = chatRef.current
    if(el) el.scrollTop = el.scrollHeight
  }, [active?.messages?.length])

  function onSend(){
    if(!body.trim()) return
    sendMessage(activeId, body, me?.email)
    setBody('')
    refresh()
  }

  return (
    <div className="messages-wrap">
      <div className="messages-left" ref={listRef}>
        <div className="messages-head">Messages</div>
        <div className="conv-list">
          {convos.map(c=>{
            const last = c.messages[c.messages.length-1]
            const unread = unreadCount(c, me?.email)
            const mine = (me?.email||'').toLowerCase()
            const other = c.participants.find(p=> (p||'').toLowerCase()!==mine)
            return (
              <button key={c.id} className={"conv-item "+(c.id===activeId?'active':'')} onClick={()=>setActiveId(c.id)}>
                <Avatar email={other} />
                <div className="conv-main">
                  <div className="conv-title">{other}</div>
                  <div className="conv-snippet">{(last?.sender===me?.email?'You: ':'') + (last?.body||'')}</div>
                </div>
                <div className="conv-meta">
                  <div className="time small muted">{formatTime(last?.ts)}</div>
                  {unread>0 && <span className="badge">{unread}</span>}
                </div>
              </button>
            )
          })}
          {convos.length===0 && <div className="muted small" style={{padding:'8px 10px'}}>No conversations yet.</div>}
        </div>
      </div>
      <div className="messages-right">
        {active ? (
          <>
            <div className="chat-head">
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Avatar email={other} />
                <div>
                  <div className="chat-title">{other}</div>
                  <div className="small muted">Conversation</div>
                </div>
              </div>
            </div>
            <div className="chat-scroll" ref={chatRef}>
              {(active.messages||[]).map(m=>(
                <div key={m.id} className={"bubble "+(m.sender===me?.email?'mine':'')}>
                  <div className="body">{m.body}</div>
                  <div className="meta small muted">{formatTime(m.ts)}</div>
                </div>
              ))}
            </div>
            <div className="composer">
              <input className="input" value={body} onChange={e=>setBody(e.target.value)} placeholder="Type a message…" onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); onSend() } }} />
              <button className="btn" onClick={onSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="muted" style={{padding:12}}>Select a conversation</div>
        )}
      </div>
    </div>
  )
}
