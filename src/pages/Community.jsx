import React, { useEffect, useMemo, useState } from 'react'
import { community } from '../services/community'
import { notify, auth } from '../services/store'
const CATS=['All','IT','Data','Marketing','Design','Management','Other']
export default function Community(){
  /**
   * Send a connect request to the post author.  Credits and premium checks have
   * been removed; everyone can connect for free.  A notification is stored
   * locally for administrative review and a simple alert is shown to the user.
   */
  function connectToAuthor(post) {
    const me = auth.me() || { email: 'recruiter@demo' }
    // simulate sending a connect request to an administrator
    notify({
      to: 'admin',
      title: 'Connect request',
      body: `${me.email} requested intro to ${post.author}`,
      meta: { postId: post.id }
    })
    alert('Connect request sent!')
  }

  const [cat,setCat]=useState('All')
  const [q,setQ]=useState('')
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [list,setList]=useState([])
  useEffect(()=>{ community.seedIfNeeded(); setList(community.all()) }, [])
  const filtered = useMemo(()=>{ let l = cat==='All'? list : list.filter(p=>p.category===cat); if(q) l = l.filter(p => (p.title+' '+p.body).toLowerCase().includes(q.toLowerCase())); return l }, [list, cat, q])
  function post(){ if(!title || !body){ alert('Add a title and body'); return } ; community.addPost({title, body, category: cat==='All'?'General':cat}); setTitle(''); setBody(''); setList(community.all()) }
  function comment(pid){ const t = prompt('Write a comment'); if(!t) return; community.addComment(pid, t); setList(community.all()) }
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Community</h1>
    <div className="card" style={{padding:12, margin:'12px 0'}}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8}}>
        <select className="input" value={cat} onChange={e=>setCat(e.target.value)}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
        <input className="input" placeholder="Search posts" value={q} onChange={e=>setQ(e.target.value)} />
        <span></span><span></span>
      </div>
      <div className="card" style={{padding:12, marginTop:8}}>
        <div style={{fontWeight:600, marginBottom:6}}>Start a discussion</div>
        <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="input" placeholder="Write something helpful…" value={body} onChange={e=>setBody(e.target.value)} style={{marginTop:6, height:100}} />
        <div style={{marginTop:8}}><button className="btn" onClick={post}>Post</button></div>
      </div>
    </div>
    <div style={{display:'grid', gap:8}}>
      {filtered.map(p=>(
        <div key={p.id} className="card" style={{padding:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div className="h2" style={{margin:0}}>{p.title}</div><div style={{fontSize:12,opacity:.7}}>{p.category} · by {p.author}</div></div>
            <button className="btn-ghost" onClick={()=>comment(p.id)}>Comment</button>
          </div>
          <div style={{marginTop:6}}>{p.body}
            <div style={{marginTop:8}}>
              <button className="btn" onClick={() => connectToAuthor(p)}>Connect</button>
            </div></div>
          <div style={{marginTop:6, fontSize:13, opacity:.8}}>{p.comments.length===0? <i>No comments yet.</i> : <ul style={{margin:0,paddingLeft:16}}>{p.comments.map(c=>(<li key={c.id}><b>{c.author}:</b> {c.text}</li>))}</ul>}</div>
        </div>
      ))}
      {filtered.length===0 && <div style={{opacity:.7}}>No posts yet.</div>}
    </div>
  </div>
}
