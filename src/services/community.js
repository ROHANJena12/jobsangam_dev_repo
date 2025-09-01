// src/services/community.js
import { read, write } from './store'

const KEY = 'hh_community_v1'

const seedData = [
  { id:1, title:'How to switch from QA to SDET?', body:'Tips about roadmap and learning resources.', cat:'IT', author:'Rohit', comments:[{by:'Akhilesh', text:'Focus on JS + Cypress first.'}], likes:4 },
  { id:2, title:'Best analytics portfolio examples?', body:'Share links please.', cat:'Data', author:'Priya', comments:[{by:'Karan', text:'Look at Kaggle + Streamlit apps.'}], likes:7 },
  { id:3, title:'Marketing manager interview tips', body:'What questions to expect?', cat:'Marketing', author:'Sana', comments:[], likes:3 },
]

function save(list){ write(KEY, list) }
function all(){ return read(KEY, []) }

export const community = {
  seedIfNeeded(){
    const cur = all()
    if(!cur || cur.length===0){ save(seedData) }
  },
  all(){
    return all()
  },
  addPost({title, body, cat, author='Anonymous'}){
    const list = all()
    const p = { id: Date.now(), title, body, cat, author, comments:[], likes:0 }
    list.unshift(p); save(list); return p
  },
  addComment(postId, text, by='Recruiter'){
    const list = all()
    const p = list.find(x=>x.id===postId); if(!p) return
    p.comments.push({ by, text }); save(list)
  },
  like(postId){
    const list = all()
    const p = list.find(x=>x.id===postId); if(!p) return
    p.likes = (p.likes||0)+1; save(list)
  }
}