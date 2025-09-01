
import React from 'react'
import { getCredits, addCredits, premium, setPlan, auth } from '../services/store'
import { Link } from 'react-router-dom'

export default function Plans(){
  const me = auth.me()
  const isPro = premium()
  const [credits, setCredits] = React.useState(getCredits())

  function buyCredits(qty){
    const next = addCredits(qty)
    setCredits(next)
  }
  function upgrade(plan='pro'){
    setPlan(plan)
    alert('Upgraded to '+plan.toUpperCase()+' (demo). Enjoy more Connect!')
    window.location.reload()
  }
  function downgrade(){
    setPlan('free')
    alert('Switched to Free plan.')
    window.location.reload()
  }

  return (
    <div className="container-p" style={{padding:'24px 0'}}>
      <h1 className="h2">Plans & Credits</h1>
      {!me && <div className="card" style={{padding:12, marginTop:12}}>
        Please <Link to="/login">login</Link> as a recruiter to manage your plan.
      </div>}
      {me && (
        <div className="card" style={{padding:16, marginTop:12}}>
          <div style={{marginBottom:12}}>
            <div><b>User:</b> {me.name || me.email}</div>
            <div><b>Plan:</b> {isPro ? 'Pro' : 'Free'}</div>
            {!isPro && <div><b>Credits:</b> {credits}</div>}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:12}}>
            <div className="card" style={{padding:16}}>
              <div className="h2" style={{margin:0}}>Free</div>
              <ul style={{marginTop:8, opacity:.85}}>
                <li>Basic dashboard</li>
                <li>“Connect” consumes credits</li>
                <li>Community read</li>
              </ul>
              {!isPro && <button className="btn" onClick={()=>buyCredits(5)} style={{marginTop:8}}>Buy 5 credits</button>}
              {!isPro && <button className="btn-ghost" onClick={()=>buyCredits(20)} style={{marginLeft:8, marginTop:8}}>Buy 20 credits</button>}
              {isPro && <div className="pill" style={{marginTop:8}}>Included in Pro</div>}
            </div>

            <div className="card" style={{padding:16}}>
              <div className="h2" style={{margin:0}}>Pro</div>
              <ul style={{marginTop:8, opacity:.85}}>
                <li>Unlimited “Connect” (no credit cost)</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
              </ul>
              {isPro
                ? <button className="btn-ghost" onClick={downgrade} style={{marginTop:8}}>Switch to Free</button>
                : <button className="btn" onClick={()=>upgrade('pro')} style={{marginTop:8}}>Upgrade (demo)</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
