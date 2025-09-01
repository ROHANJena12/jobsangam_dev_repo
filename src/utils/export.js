export function downloadCSV(filename, rows){
  const headers = Object.keys(rows[0]||{sample:''})
  const csv = [headers.join(',')].concat(rows.map(r=> headers.map(h=> JSON.stringify(r[h]??'')).join(','))).join('\n')
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click()
}
export function downloadXLSX(filename, rows){ downloadCSV(filename.replace(/\.xlsx$/i,'.csv'), rows) }
