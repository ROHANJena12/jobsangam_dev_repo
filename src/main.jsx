import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { seedDemoIfNeeded } from './services/seedDemo'

seedDemoIfNeeded()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
if (window.__bootDiagOk) window.__bootDiagOk('App mounted');

 