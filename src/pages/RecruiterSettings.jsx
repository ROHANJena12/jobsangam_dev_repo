import React, { useState } from 'react'
import { auth } from '../services/store'

/**
 * Recruiter settings page
 *
 * This simplified settings page focuses on company branding.  Recruiters can
 * upload a company logo which will then be displayed in their dashboard and
 * attached to new job postings.  All plan and credit management has been
 * removed from this demo.
 */
export default function RecruiterSettings() {
  // Resolve the current user's email to scope all company branding data
  const me = auth.me() || {}
  const email = me.email || ''

  // Helper to read a key scoped by recruiter email
  const getKey = (base) => base + '_' + email

  // Initialise the logo state from localStorage if available
  const [logoSrc, setLogoSrc] = useState(() => localStorage.getItem(getKey('hh_company_logo')) || '')

  // Additional company information: description, tagline, website and image gallery
  const [desc, setDesc] = useState(() => localStorage.getItem(getKey('hh_company_desc')) || '')
  const [tagline, setTagline] = useState(() => localStorage.getItem(getKey('hh_company_tagline')) || '')
  const [website, setWebsite] = useState(() => localStorage.getItem(getKey('hh_company_website')) || '')
  const [images, setImages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getKey('hh_company_images')) || '[]') || []
    } catch (e) {
      return []
    }
  })

  /**
   * Handle file input changes.  Reads the selected image as a data URL
   * (base64‑encoded) and stores it in localStorage so it persists across
   * reloads.
   */
  function uploadLogo(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target.result
      localStorage.setItem(getKey('hh_company_logo'), src)
      setLogoSrc(src)
    }
    reader.readAsDataURL(file)
  }

  /**
   * Handle changes to the text fields (description, tagline, website).  Persist
   * the values into localStorage so they are used on new job postings.
   */
  function saveCompanyInfo() {
    localStorage.setItem(getKey('hh_company_desc'), desc)
    localStorage.setItem(getKey('hh_company_tagline'), tagline)
    localStorage.setItem(getKey('hh_company_website'), website)
    alert('Company information saved')
  }

  /**
   * Handle additional image uploads.  Supports multiple files.  Each image is
   * converted to a base64 data URL and appended to the existing gallery.  The
   * gallery is stored as a JSON array in localStorage under 'hh_company_images'.
   */
  function uploadImages(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const promises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      })
    })
    Promise.all(promises).then((srcs) => {
      const next = [...images, ...srcs]
      setImages(next)
      localStorage.setItem(getKey('hh_company_images'), JSON.stringify(next))
    })
  }

  /**
   * Remove an image from the gallery by its index.  Updates both state and
   * localStorage.
   */
  function removeImage(idx) {
    const next = images.filter((_, i) => i !== idx)
    setImages(next)
    localStorage.setItem(getKey('hh_company_images'), JSON.stringify(next))
  }

  return (
    <div className="container-p" style={{ padding: '24px 0' }}>
      <h1 className="h2">Recruiter Settings</h1>

      {/* Company branding */}
      <div className="card" style={{ padding: 16, margin: '12px 0' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Company Branding</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Upload logo:</div>
            <input type="file" accept="image/*" onChange={uploadLogo} />
          </div>
          {logoSrc && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src={logoSrc}
                alt="Logo preview"
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
              />
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Current logo</div>
            </div>
          )}
        </div>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          This logo will appear on your job postings and recruiter dashboard.
        </p>
      </div>

      {/* Additional company info */}
      <div className="card" style={{ padding: 16, margin: '12px 0' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Company Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Tagline:</div>
            <input className="input" placeholder="e.g. Empowering innovation" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Website:</div>
            <input className="input" placeholder="https://yourcompany.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Description:</div>
            <textarea className="input" rows={4} placeholder="Tell candidates about your company" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Gallery images:</div>
            <input type="file" accept="image/*" multiple onChange={uploadImages} />
            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {images.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt={`company-${i}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <button className="btn-ghost" onClick={() => removeImage(i)} style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', fontSize: 10, padding: 0 }}>x</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <button className="btn" onClick={saveCompanyInfo}>Save Info</button>
          </div>
        </div>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          This information will be included with future job postings to give applicants more context about your company.
        </p>
      </div>
    </div>
  )
}