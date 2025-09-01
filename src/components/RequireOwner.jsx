import React from 'react'
import { Navigate } from 'react-router-dom'
import { auth } from '../services/store'
import { OWNER_EMAIL } from '../config/owner'

export default function RequireOwner({ children }){
  const me = auth.me()
  const ok = !!me && (me.email||'').toLowerCase() === (OWNER_EMAIL||'').toLowerCase()
  if(!ok) return <Navigate to="/" replace />
  return children
}
