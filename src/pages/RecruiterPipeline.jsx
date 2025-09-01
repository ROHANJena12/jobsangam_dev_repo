import React, { useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { recruiterApi } from '../services/recruiterApi'
import { read } from '../services/store'
const COLUMNS_PREMIUM = ['applied','shortlisted','interview','offer','hired','rejected']
// In this simplified build there is no distinction between free and premium pipelines.
// All users see the full set of columns defined above.
const COLUMNS_FREE = COLUMNS_PREMIUM
export default function RecruiterPipeline(){
  const appsMap = read('hh_apps', {})
  // Always use the full pipeline.  Premium checks have been removed.
  const cols = COLUMNS_PREMIUM
  const data = useMemo(()=>{
    const byStatus = Object.fromEntries(cols.map(c=>[c,[]]))
    Object.entries(appsMap).forEach(([jid,arr])=>{
      arr.forEach(a=>{
        const st=(a.status||'applied').toLowerCase()
        if(byStatus[st]) byStatus[st].push({ ...a, jid })
      })
    })
    return byStatus
  }, [appsMap])
  const [state,setState]=useState(data)
  function onDragEnd(result){
    const {source,destination} = result; if(!destination) return
    const from=source.droppableId,to=destination.droppableId
    if(from===to && source.index===destination.index) return
    const next={...state}; const item=next[from].splice(source.index,1)[0]; item.status=to; next[to].splice(destination.index,0,item); setState(next)
    const apps = read('hh_apps', {}); const list=apps[item.jid]||[]; apps[item.jid]=list.map(a=> a.email===item.email ? {...a, status: to} : a ); localStorage.setItem('hh_apps', JSON.stringify(apps))
  }

  /**
   * Move a candidate to a different status without dragging.  This helper
   * allows the recruiter to update a candidate’s pipeline stage via a
   * dropdown select on the card.  It mirrors the logic of onDragEnd but
   * uses the current item data directly rather than relying on drag
   * indices.
   *
   * @param {Object} item The candidate application object to move.
   * @param {string} to The destination status key (e.g. 'shortlisted').
   */
  function moveItem(item, to){
    const from = (item.status || 'applied').toLowerCase()
    if(!to || from === to) return
    // Remove from the current column
    const next = { ...state }
    const idx = (next[from] || []).findIndex(c => c.jid === item.jid && c.email === item.email)
    if(idx >= 0) {
      next[from].splice(idx, 1)
    }
    // Insert into the destination column
    const updated = { ...item, status: to }
    if(!next[to]) next[to] = []
    next[to] = [...next[to], updated]
    setState(next)
    // Persist status change to localStorage
    const apps = read('hh_apps', {})
    const list = apps[item.jid] || []
    apps[item.jid] = list.map(a => a.email === item.email ? { ...a, status: to } : a)
    localStorage.setItem('hh_apps', JSON.stringify(apps))
  }
  return <div className="container-p" style={{padding:'24px 0'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h1 className="h2">Pipeline</h1></div>
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${cols.length}, 1fr)`,gap:8}}>
        {cols.map(col=> (
          <Droppable droppableId={col} key={col}>
            {(provided)=>(
              <div ref={provided.innerRef} {...provided.droppableProps} className="card" style={{padding:8,minHeight:300}}>
                <div style={{fontWeight:600, marginBottom:6, textTransform:'capitalize'}}>{col}</div>
                {state[col]?.map((a,idx)=>(
                  <Draggable draggableId={a.jid+'_'+a.email} index={idx} key={a.jid+'_'+a.email}>
                    {(p)=>(
                      <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="card" style={{padding:8, marginBottom:6}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:4}}>
                          <div>
                            <div style={{fontSize:14,fontWeight:600}}>{a.candidate?.name||a.email}</div>
                            <div style={{fontSize:12,opacity:.7}}>{a.email}</div>
                          </div>
                          {/* Manual status selector: provides a fallback when drag‑and‑drop isn’t available */}
                          <select
                            value={(a.status || 'applied').toLowerCase()}
                            onChange={e => moveItem(a, e.target.value)}
                            style={{fontSize:12, padding:'2px 4px'}}
                          >
                            {cols.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                          </select>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
    {/* Show a helpful message when there are no applications across all columns */}
    {Object.values(state).every(arr => (arr || []).length === 0) && (
      <div style={{fontSize:14, opacity:.7, marginTop:12}}>No applications yet.</div>
    )}
  </div>
}
