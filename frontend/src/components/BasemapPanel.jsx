import React from 'react'

const maps = [
  { key:'osm', label:'OpenStreetMap', desc:'Default street map' },
  { key:'esri', label:'ESRI World Imagery', desc:'High-res satellite' },
  { key:'esriclarity', label:'ESRI Clarity', desc:'Sharp detail satellite' },
  { key:'topo', label:'Topo map', desc:'Elevation contours' },
  { key:'dark', label:'Dark (CARTO)', desc:'Dark base for overlays' },
  { key:'terrain', label:'Terrain (Stamen)', desc:'Shaded relief' },
]

export default function BasemapPanel({ basemap, setBasemap }) {
  return (
    <div className="panel">
      <h3>Base map</h3>
      {maps.map(m => (
        <div key={m.key} onClick={() => setBasemap(m.key)}
          style={{
            padding:'6px 8px', marginBottom:3, borderRadius:6, cursor:'pointer',
            background: basemap===m.key ? '#3d5af1' : '#2d3148',
            fontSize:12, display:'flex', justifyContent:'space-between'
          }}>
          <span style={{fontWeight: basemap===m.key?600:400}}>{m.label}</span>
          <span style={{color: basemap===m.key?'#cde':'#556', fontSize:11}}>{m.desc}</span>
        </div>
      ))}
    </div>
  )
}
