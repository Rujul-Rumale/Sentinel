import React,{useEffect,useState} from 'react'
import {getSavedLocations,deleteLocation,getHistory} from '../api'
export default function BookmarksPanel({onSelect}){
  const [locs,setLocs]=useState([])
  const [hist,setHist]=useState([])
  useEffect(()=>{
    getSavedLocations().then(r=>setLocs(r.data)).catch(()=>{})
    getHistory().then(r=>setHist(r.data)).catch(()=>{})
  },[])
  const del=async id=>{
    await deleteLocation(id)
    setLocs(l=>l.filter(x=>x.id!==id))
  }
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div className="panel">
        <h3>Bookmarks</h3>
        {locs.length===0&&<div style={{fontSize:12,color:'#666'}}>No bookmarks yet</div>}
        {locs.map(l=>(
          <div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span className="history-item" onClick={()=>onSelect(l)}>{l.name}</span>
            <button className="delete-btn" onClick={()=>del(l.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="panel">
        <h3>Recent searches</h3>
        {hist.slice(0,10).map((h,i)=>(
          <div key={i} className="history-item">{h.query}</div>
        ))}
      </div>
    </div>
  )
}
