
import React from "react";

export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  multi = false,
  allowCreate = false,
  style = {},
}){
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  const rootRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(()=>{
    function onDoc(e){
      if (rootRef.current && !rootRef.current.contains(e.target)){
        setOpen(false);
        setIsTyping(false);
        setQ("");
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  },[]);

  const list = React.useMemo(()=>{
    const needle = (q ?? "").trim().toLowerCase();
    return options.filter(o => o.toLowerCase().includes(needle));
  }, [q, options]);

  function addOpt(opt){
    if (multi){
      const curr = Array.isArray(value) ? value.slice() : [];
      if (!curr.includes(opt)) {
        onChange(curr.concat([opt]));
      }
      setQ("");
      setIsTyping(false);
    }else{
      onChange(opt);
      setQ("");
      setIsTyping(false);
      setOpen(false);
    }
  }

  function removeOpt(opt){
    if (!multi) return;
    const curr = Array.isArray(value) ? value : [];
    onChange(curr.filter(v=>v!==opt));
  }

  // For single-select, show typed query while typing; otherwise show selected value
  const displayValue = multi ? "" : (isTyping ? q : (value || ""));

  const chip = (txt) => (
    <span key={txt} className="badge" style={{marginRight:6, marginBottom:4}}>
      {txt} {multi && <button onClick={(e)=>{e.stopPropagation();removeOpt(txt);}} style={{marginLeft:6,opacity:.8}}>×</button>}
    </span>
  );

  function handleKeyDown(e){
    if (e.key === "Enter"){
      e.preventDefault();
      if (list.length){ addOpt(list[0]); }
    } else if (e.key === "Backspace" && !multi){
      // If there's a current selection and query is empty, clear selection
      if ((q ?? "") === "" && value){
        onChange("");
        setIsTyping(true);
      }
    } else if (e.key === "Escape"){
      setOpen(false);
      setIsTyping(false);
      setQ("");
    }
  }

  return (
    <label ref={rootRef} style={{display:"grid", gap:6, position:"relative"}}>
      {label && <div style={{fontSize:12, opacity:.85}}>{label}</div>}
      <div className="input" style={{display:"flex", alignItems:"center", gap:6, cursor:"text", ...style}} onClick={()=>{ setOpen(true); inputRef.current?.focus(); }}>
        {multi ? (
          <div style={{display:"flex", flexWrap:"wrap", alignItems:"center", flex:1}} onClick={()=>inputRef.current?.focus()}>
            {(Array.isArray(value)?value:[]).map(chip)}
            <input
              ref={inputRef}
              value={q}
              onChange={(e)=>{ setQ(e.target.value); setIsTyping(true); }}
              onFocus={()=>{ setOpen(true); setIsTyping(true); }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{background:"transparent", border:"none", outline:"none", color:"inherit"}}
            />
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              value={displayValue}
              onChange={(e)=>{ setQ(e.target.value); setIsTyping(true); setOpen(true); }}
              onFocus={()=>{ setOpen(true); setIsTyping(true); }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{flex:1, background:"transparent", border:"none", outline:"none", color:"inherit"}}
            />
            {value ? (
              <button
                type="button"
                className="btn-ghost"
                onClick={(e)=>{ e.stopPropagation(); onChange(""); setQ(""); setIsTyping(true); inputRef.current?.focus(); }}
                title="Clear"
              >×</button>
            ) : null}
          </>
        )}
      </div>
      {open && (
        <div className="card" style={{position:"absolute", zIndex:9999, top:"100%", left:0, right:0, maxHeight:260, overflowY:"auto", background:"#0f172a", border:"1px solid #1f2530"}}>
          {list.length === 0 ? (
            allowCreate && (q ?? "").trim() ? (
              <div className="btn-ghost" onClick={()=>addOpt((q ?? "").trim())}>Add “{(q ?? "").trim()}”</div>
            ) : (
              <div style={{padding:8, opacity:.8}}>No results</div>
            )
          ) : (
            list.map(opt => (
              <div
                key={opt}
                className="btn-ghost"
                onClick={()=>addOpt(opt)}
                style={{display:"flex", justifyContent:"space-between"}}
              >
                <span>{opt}</span>
                {multi
                  ? (Array.isArray(value) && value.includes(opt) ? <span>✓</span> : null)
                  : (value === opt ? <span>✓</span> : null)
                }
              </div>
            ))
          )}
        </div>
      )}
    </label>
  );
}
