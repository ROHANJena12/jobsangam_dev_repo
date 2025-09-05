export function CompleteProfilePopup({ open, onComplete, onSkip }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', color: '#222', borderRadius: 8, padding: 32, minWidth: 320,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center'
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Complete Your Profile</div>
        <div style={{ marginBottom: 24 }}>Your profile is not complete. Please complete your profile to increase your chances of getting hired.</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button className="btn" onClick={onComplete}>Complete Profile</button>
          <button className="btn-ghost" onClick={onSkip}>Skip for later</button>
        </div>
      </div>
    </div>
  )
}