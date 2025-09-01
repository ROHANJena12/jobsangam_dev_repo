import React from 'react'
export default function PrepResources(){
  return <div className="container-p" style={{padding:'24px 0'}}>
    <h1 className="h2">Preparation Resources</h1>
    <div className="card" style={{padding:12}}>
      <ul style={{lineHeight:1.8}}>
        <li>DSA practice: arrays, strings, recursion, trees.</li>
        <li>System design: caching, sharding, queues.</li>
        <li>React: hooks, state, effects, performance, accessibility.</li>
        <li>SQL: joins, window functions, indexing.</li>
      </ul>
      <div style={{fontSize:12,opacity:.7, marginTop:8}}>Tip: Use the Resume Builder to export an ATS-friendly PDF.</div>
    </div>
  </div>
}
