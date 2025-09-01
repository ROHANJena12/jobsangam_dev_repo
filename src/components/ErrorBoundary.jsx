import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){
    super(props)
    this.state = { error: null, info: null }
  }
  static getDerivedStateFromError(error){
    return { error }
  }
  componentDidCatch(error, info){
    this.setState({ info })
    console.error('[App ErrorBoundary] Caught error:', error, info)
  }
  render(){
    const { error, info } = this.state
    if(error){
      return (
        <div style={{padding:24}}>
          <h2>Something went wrong</h2>
          <div className="card" style={{padding:12, marginTop:12}}>
            <div style={{fontWeight:600}}>Error</div>
            <pre style={{whiteSpace:'pre-wrap'}}>{String(error?.message || error)}</pre>
          </div>
          {info?.componentStack && (
            <div className="card" style={{padding:12, marginTop:12}}>
              <div style={{fontWeight:600}}>Component stack</div>
              <pre style={{whiteSpace:'pre-wrap', fontSize:12, opacity:.8}}>{info.componentStack}</pre>
            </div>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
