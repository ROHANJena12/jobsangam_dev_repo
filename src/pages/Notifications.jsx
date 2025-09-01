import React from 'react';
import { notify } from '../services/notify';
import { auth } from '../services/store';
import { Link } from 'react-router-dom';

export default function Notifications(){
  const me = auth.me();
  const items = notify.list(me?.email);
  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 className="h2" style={{margin:0}}>Notifications</h1>
        <div style={{display:'flex', gap:8}}>
          <button className="btn-ghost" onClick={()=>{ notify.markAllRead(me?.email); location.reload() }}>Mark all read</button>
          <button className="btn-ghost" onClick={()=>{ if(confirm('Clear all notifications?')){ notify.clear(me?.email); location.reload() } }}>Clear</button>
        </div>
      </div>
      <div style={{display:'grid', gap:8, marginTop:12}}>
        {items.length===0 ? <div style={{opacity:.8}}>No notifications.</div> :
          items.map(n => (
            <div key={n.id} className="card" style={{padding:12, background:'#0f172a', border:'1px solid #1f2530'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div>
                  <div style={{fontWeight:600}}>{n.title}</div>
                  <div style={{opacity:.85}}>{n.body}</div>
                  {n.link && <div style={{marginTop:6}}><Link className="btn-ghost" to={n.link}>Open</Link></div>}
                </div>
                <div style={{opacity:.6, fontSize:12, textAlign:'right'}}>
                  <div>{new Date(n.when).toLocaleString()}</div>
                  <div>{n.read ? 'Read' : 'Unread'}</div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}