import React from 'react'

const Field = ({ label, value }) => value != null && value !== '' ? (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0',
    borderBottom: '1px solid #2d3148', fontSize: 12 }}>
    <span style={{ color: '#778' }}>{label}</span>
    <span style={{ color: '#eee', fontWeight: 500 }}>{value}</span>
  </div>
) : null

export default function DetailPanel({ item, type, onClose }) {
  if (!item) return null

  const renderFlight = () => (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        {item.callsign || item.icao}
        <span style={{ fontSize: 11, marginLeft: 8, color: '#7eb8f7',
          background: '#1a2a4a', padding: '2px 8px', borderRadius: 4 }}>LIVE</span>
      </div>
      <div style={{ fontSize: 11, color: '#556', marginBottom: 10 }}>Aircraft · {item.icao}</div>
      <Field label="Altitude" value={item.altitude ? Math.round(item.altitude) + ' m (' + Math.round(item.altitude * 3.281) + ' ft)' : null} />
      <Field label="Speed" value={item.velocity ? Math.round(item.velocity * 3.6) + ' km/h' : null} />
      <Field label="Heading" value={item.heading ? Math.round(item.heading) + '°' : null} />
      <Field label="Vertical rate" value={item.vertRate ? item.vertRate + ' m/s' : null} />
      <Field label="On ground" value={item.onGround != null ? (item.onGround ? 'Yes' : 'No') : null} />
      <Field label="Squawk" value={item.squawk} />
      <Field label="Country" value={item.originCountry} />
      <Field label="Position" value={item.lat && item.lon ? item.lat.toFixed(4) + ', ' + item.lon.toFixed(4) : null} />
    </>
  )

  const renderVessel = () => (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        {item.name || 'Unknown vessel'}
        <span style={{ fontSize: 11, marginLeft: 8, color: '#4caf82',
          background: '#1a3d2b', padding: '2px 8px', borderRadius: 4 }}>AIS</span>
      </div>
      <div style={{ fontSize: 11, color: '#556', marginBottom: 10 }}>MMSI: {item.mmsi}</div>
      <Field label="Ship type" value={item.shipType} />
      <Field label="Speed" value={item.speed ? item.speed + ' kn' : null} />
      <Field label="Heading" value={item.heading ? item.heading + '°' : null} />
      <Field label="Destination" value={item.destination} />
      <Field label="Flag" value={item.flag} />
      <Field label="Position" value={item.lat && item.lon ? item.lat.toFixed(4) + ', ' + item.lon.toFixed(4) : null} />
    </>
  )

  const renderSatellite = () => (
    <>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        {item.name}
        <span style={{ fontSize: 11, marginLeft: 8, color: '#f0b429',
          background: '#3d3000', padding: '2px 8px', borderRadius: 4 }}>ORBIT</span>
      </div>
      <div style={{ fontSize: 11, color: '#556', marginBottom: 10 }}>NORAD: {item.norad}</div>
      <Field label="Latitude" value={item.lat?.toFixed(4)} />
      <Field label="Longitude" value={item.lon?.toFixed(4)} />
      <Field label="Altitude" value={item.altitude ? Math.round(item.altitude) + ' km' : null} />
      <Field label="Azimuth" value={item.azimuth ? item.azimuth + '°' : null} />
      <Field label="Elevation" value={item.elevation ? item.elevation + '°' : null} />
    </>
  )

  return (
    <div style={{
      position: 'absolute', bottom: 20, right: 20, width: 280,
      background: '#1a1d26', borderRadius: 10, padding: 16, zIndex: 2000,
      border: '1px solid #3d4166', boxShadow: '0 4px 24px rgba(0,0,0,0.5)'
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 10, right: 10, background: 'none',
        border: 'none', color: '#778', cursor: 'pointer', fontSize: 16
      }}>✕</button>
      {type === 'flight' && renderFlight()}
      {type === 'vessel' && renderVessel()}
      {type === 'satellite' && renderSatellite()}
    </div>
  )
}
