import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div style={{padding:'32px 16px'}}>
      <h1 style={{marginBottom:8}}>Page not found</h1>
      <p style={{opacity:0.8, marginBottom:16}}>The page you are looking for doesn’t exist or may have moved.</p>
      <Link className="btn" to="/">Go home</Link>
    </div>
  )
}