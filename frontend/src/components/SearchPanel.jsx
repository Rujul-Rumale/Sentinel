import React,{useState} from 'react'
import {searchPlace,saveHistory} from '../api'
export default function SearchPanel({onResult}){
  const [q,setQ]=useState('')
  const [loading,setLoading]=useState(false)
  const search=async()=>{
    if(!q.trim())return
    setLoading(true)
    try{
      const r=await searchPlace(q)
      await saveHistory({query:q,resultJson:JSON.stringify(r.data)})
      onResult(r.data,q)
    }catch(e){console.error(e)}
    finally{setLoading(false)}
  }
  return(
    <div className="panel">
      <h3>Search place</h3>
      <input value={q} onChange={e=>setQ(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&search()}
        placeholder="Village, district, city..."/>
      <button onClick={search} style={{marginTop:6,width:'100%'}}>
        {loading?'Searching...':'Search'}
      </button>
    </div>
  )
}
