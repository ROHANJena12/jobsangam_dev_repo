import React, {createContext, useContext, useState, useCallback, useMemo, useEffect} from 'react'

const ToastCtx = createContext({ show: () => {} })

export function ToastProvider({children}){
  const [list,setList] = useState([]) // {id,msg,type}
  const show = useCallback((msg, type='info', ttl=2500) => {
    const id = Math.random().toString(36).slice(2,9)
    setList(v => [...v, {id, msg, type}])
    // auto remove
    setTimeout(() => {
      setList(v => v.filter(t => t.id !== id))
    }, ttl)
  }, [])

  const value = useMemo(()=>({show}),[show])

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div style={styles.host}>
        {list.map(t => (
          <div key={t.id} style={{...styles.toast, ...(t.type==='error'?styles.error:{}), ...(t.type==='success'?styles.success:{})}}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast(){
  return useContext(ToastCtx)
}

const styles = {
  host: {
    position:'fixed', right:16, bottom:16, display:'flex', flexDirection:'column', gap:8, zIndex: 9999
  },
  toast: {
    background:'#222', color:'#fff', padding:'10px 12px', borderRadius:8, boxShadow:'0 6px 16px rgba(0,0,0,.35)', fontSize:13, maxWidth:320
  },
  success: { background: '#174b2f' },
  error: { background: '#6b1f22' }
}
