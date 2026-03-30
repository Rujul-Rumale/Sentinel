import React, { useState } from 'react'

const Section = ({ label, items, layers, toggle }) => {
  const [open, setOpen] = useState(false)
  const activeCount = items.filter(i => layers[i.key]).length
  return (
    <div style={{ marginBottom: 4 }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 8px', background: '#2d3148', borderRadius: 6,
        cursor: 'pointer', userSelect: 'none', fontSize: 13
      }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: '#7eb8f7' }}>
          {activeCount > 0 && <span style={{ background: '#3d5af1', borderRadius: 10, padding: '1px 6px', marginRight: 6 }}>{activeCount}</span>}
          {open ? '▲' : '▼'}
        </span>
      </div>
      {open && (
        <div style={{ padding: '4px 0 4px 8px' }}>
          {items.map(({ key, label: lbl, desc }) => (
            <div className="layer-toggle" key={key} title={desc || ''}>
              <span style={{ fontSize: 12 }}>{lbl}</span>
              <label className="toggle">
                <input type="checkbox" checked={!!layers[key]} onChange={() => toggle(key)} />
                <span className="slider" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LayerControls({ layers, toggle }) {
  const groups = [
    {
      label: '🛰 Satellite imagery', items: [
        { key: 'viirs', label: 'VIIRS true color', desc: 'Near-realtime true color from Suomi NPP' },
        { key: 'viirsbands', label: 'VIIRS bands 3-6-7', desc: 'False color - vegetation/fire detection' },
        { key: 'nightlights', label: 'Night lights (DNBO)', desc: 'City lights at night' },
        { key: 'himawari', label: 'Himawari-8 geostationary', desc: 'Asia-Pacific 10-min near-realtime' },
      ]
    },
    {
      label: '🔥 MODIS products', items: [
        { key: 'modis', label: 'Fire & thermal anomalies', desc: 'Active fires and heat sources' },
        { key: 'aerosol', label: 'Aerosol / dust / smoke', desc: 'Aerosol optical depth' },
        { key: 'snow', label: 'Snow cover', desc: 'Daily snow extent' },
        { key: 'sst', label: 'Sea surface temp', desc: 'Land/sea surface temperature' },
      ]
    },
    {
      label: '🌍 Atmosphere', items: [
        { key: 'no2', label: 'NO₂ column (OMPS)', desc: 'Nitrogen dioxide concentration' },
        { key: 'soilmoisture', label: 'Soil moisture (SMAP)', desc: 'Surface soil moisture' },
      ]
    },
    {
      label: '🌦 Weather overlays', items: [
        { key: 'precipitation', label: 'Precipitation' },
        { key: 'temperature', label: 'Temperature' },
        { key: 'clouds', label: 'Cloud cover' },
        { key: 'wind', label: 'Wind speed' },
        { key: 'pressure', label: 'Pressure' },
        { key: 'humidity', label: 'Humidity' },
        { key: 'dewpoint', label: 'Dew point' },
        { key: 'snowdepth', label: 'Snow depth' },
      ]
    },
    {
      label: '✈ Live tracking', items: [
        { key: 'flights', label: 'Live flights' },
        { key: 'vessels', label: 'Marine vessels' },
        { key: 'satellites', label: 'ISRO satellites' },
        { key: 'trains', label: 'Train tracker' },
      ]
    },
    {
      label: '🗺 Land data', items: [
        { key: 'lulc', label: 'LULC land cover' },
        { key: 'aqi', label: 'Air quality stations' },
      ]
    },
    {
      label:'🗺 Specialty overlays', items:[
        {key:'seamap', label:'OpenSeaMap nautical', desc:'Depth, buoys, ports - no key'},
        {key:'railways', label:'OpenRailwayMap', desc:'Railway lines and stations'},
        {key:'aviation', label:'OpenAIP aviation', desc:'Airspace, airports, navaids'},
        {key:'topo', label:'Topo contours', desc:'Elevation overlay'},
        {key:'labels', label:'Dark labels overlay', desc:'Place names on dark basemap'},
      ]
    },
  ]
  return (
    <div className="panel">
      <h3>Layers</h3>
      {groups.map(g => (
        <Section key={g.label} label={g.label} items={g.items} layers={layers} toggle={toggle} />
      ))}
    </div>
  )
}
