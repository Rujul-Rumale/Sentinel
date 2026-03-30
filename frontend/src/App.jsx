import React, { useCallback, useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, WMSTileLayer } from 'react-leaflet'
import L from 'leaflet'
import SearchPanel from './components/SearchPanel'
import BasemapPanel from './components/BasemapPanel'
import LayerControls from './components/LayerControls'
import InfoPanel from './components/InfoPanel'
import BookmarksPanel from './components/BookmarksPanel'
import WeatherLegend from './components/WeatherLegend'
import DetailPanel from './components/DetailPanel'
import ErrorModal from './components/ErrorModal'
import useFlights from './hooks/useFlights'
import useAIS from './hooks/useAIS'
import { getAir, getRainfall, getWeather } from './api'

const BASEMAPS = {
  osm: { url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution:'© OpenStreetMap' },
  esri: { url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution:'© Esri, Maxar, Earthstar Geographics' },
  esriclarity: { url:'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution:'© Esri Clarity' },
  topo: { url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution:'© OpenTopoMap' },
  dark: { url:'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', attribution:'© CARTO' },
  terrain: { url:'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', attribution:'© Stamen/OSM' },
}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function App() {
  const [basemap, setBasemap] = useState('osm')
  const [layers, setLayers] = useState({
    flights: false, vessels: false, satellites: false,
    lulc: false, modis: false, viirs: false, aqi: false,
    precipitation: false, temperature: false, clouds: false, wind: false,
    pressure: false, humidity: false, dewpoint: false, snowdepth: false,
    seamap: false, railways: false, aviation: false, topo: false, labels: false,
    trains: false, viirslands: false, nightlights: false, himawari: false,
    aerosol: false, snow: false, sst: false, no2: false, soilmoisture: false,
    viirsands: false, viirsbands: false
  })
  const toggle = useCallback(key => {
    setLayers(current => {
      if (key === 'viirsbands') {
        const next = !current.viirsbands
        return { ...current, viirsbands: next, viirslands: next, viirsands: next }
      }
      return { ...current, [key]: !current[key] }
    })
  }, [])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [lulc, setLulc] = useState(null)
  const [rainfall, setRainfall] = useState(null)
  const [owmKey, setOwmKey] = useState('')
  const [error, setError] = useState(null)
  const [showError, setShowError] = useState(false)
  const GIBS = 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi'

  const handleApiError = useCallback((err) => {
    if (err.response?.status === 401 || err.status === 401 || err.message?.includes('401')) {
      const msg = err.response?.data?.message || "API key was invalidated or timed out. Please check your configuration."
      setError(msg)
      setShowError(true)
    }
  }, [])
  const gibsProps = { format: 'image/png', transparent: true, version: '1.3.0', tileSize: 256, attribution: 'NASA GIBS' }

  useEffect(() => {
    fetch('/api/owm-key').then(r => {
      if (!r.ok) throw r
      return r.json()
    })
      .then(d => setOwmKey(d.key))
      .catch(e => handleApiError(e))
  }, [handleApiError])

  const flights = useFlights(layers.flights)
  const vessels = useAIS(layers.vessels)

  const onSearchResult = useCallback(async (data, query) => {
    if (!data || !data.length) return
    const place = Array.isArray(data) ? data[0] : data
    const lat = parseFloat(place.lat || place.latitude)
    const lon = parseFloat(place.lon || place.longitude)
    if (isNaN(lat) || isNaN(lon)) return
    const loc = { name: place.name || place.place || query, lat, lon }
    setSelected(loc)
    try { const r = await getWeather(lat, lon); setWeather(r.data) } catch (e) { handleApiError(e) }
    try { const r = await getAir(lat, lon); setAqi(r.data) } catch (e) { handleApiError(e) }
    try { const r = await getRainfall(); setRainfall(r.data) } catch (e) { handleApiError(e) }
  }, [handleApiError])

  const onBookmarkSelect = useCallback(loc => {
    setSelected(loc)
  }, [])

  return (
    <div className="app">
      <div className="sidebar">
        <div style={{ fontSize: 18, fontWeight: 700, color: '#7eb8f7', padding: '4px 0', letterSpacing: '0.05em' }}>
          Sentinel India
        </div>
        <SearchPanel onResult={onSearchResult} />
        <BasemapPanel basemap={basemap} setBasemap={setBasemap} />
        <LayerControls layers={layers} toggle={toggle} />
        <InfoPanel weather={weather} aqi={aqi} lulc={lulc} rainfall={rainfall} selected={selected} layers={layers} />
        <BookmarksPanel onSelect={onBookmarkSelect} />
      </div>
      <div className="map-container">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={BASEMAPS[basemap].url} attribution={BASEMAPS[basemap].attribution} />

          {layers.viirs && (
            <WMSTileLayer
              url={GIBS}
              layers="VIIRS_SNPP_CorrectedReflectance_TrueColor"
              format="image/jpeg"
              transparent={false}
              version="1.3.0"
              tileSize={256}
              opacity={0.9}
              attribution="NASA GIBS"
            />
          )}

          {layers.modis && (
            <WMSTileLayer
              url={GIBS}
              layers="MODIS_Terra_Thermal_Anomalies_All"
              format="image/png"
              transparent
              version="1.3.0"
              tileSize={256}
              opacity={0.8}
              attribution="NASA GIBS"
            />
          )}

          {layers.viirslands && <WMSTileLayer url={GIBS} layers="VIIRS_SNPP_CorrectedReflectance_BandsM3-I3-M11" {...gibsProps} opacity={0.9} />}
          {layers.nightlights && <WMSTileLayer url={GIBS} layers="VIIRS_Black_Marble" {...gibsProps} opacity={0.9} />}
          {layers.himawari && <WMSTileLayer url={GIBS} layers="Himawari_AHI_Band03_Red_Visible_1km" {...gibsProps} opacity={0.9} />}
          {layers.aerosol && <WMSTileLayer url={GIBS} layers="MODIS_Terra_Aerosol" {...gibsProps} opacity={0.7} />}
          {layers.snow && <WMSTileLayer url={GIBS} layers="MODIS_Terra_Snow_Cover_Daily" {...gibsProps} opacity={0.8} />}
          {layers.sst && <WMSTileLayer url={GIBS} layers="MODIS_Terra_Land_Surface_Temp_Day" {...gibsProps} opacity={0.7} />}
          {layers.no2 && <WMSTileLayer url={GIBS} layers="OMPS_NM_NRT_NO2_Total_Column" {...gibsProps} opacity={0.7} />}
          {layers.soilmoisture && <WMSTileLayer url={GIBS} layers="SMAP_L1_Passive_Enhanced_Brightness_Temp_Vert_AM" {...gibsProps} opacity={0.7} />}

          {layers.precipitation && owmKey && (
            <TileLayer
              url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${owmKey}`}
              opacity={0.85}
              attribution="OWM Weather Tiles"
            />
          )}
          {layers.temperature && owmKey && (
            <TileLayer
              url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${owmKey}`}
              opacity={0.8}
              attribution="OWM Weather Tiles"
            />
          )}
          {layers.clouds && owmKey && (
            <TileLayer
              url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${owmKey}`}
              opacity={0.8}
              attribution="OWM Weather Tiles"
            />
          )}
          {layers.wind && owmKey && (
            <TileLayer
              url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${owmKey}`}
              opacity={0.85}
              attribution="OWM Weather Tiles"
            />
          )}
          {layers.pressure && owmKey && (
            <TileLayer
              url={`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${owmKey}`}
              opacity={0.75}
              attribution="OWM Weather Tiles"
            />
          )}
          {layers.humidity && owmKey && (
            <TileLayer
              url={`https://maps.openweathermap.org/maps/2.0/weather/1h/HRD0/{z}/{x}/{y}?appid=${owmKey}&fill_bound=true&opacity=0.8`}
              opacity={0.8}
              attribution="OWM Maps 2.0"
            />
          )}
          {layers.dewpoint && owmKey && (
            <TileLayer
              url={`https://maps.openweathermap.org/maps/2.0/weather/1h/TD2/{z}/{x}/{y}?appid=${owmKey}&fill_bound=true&opacity=0.8`}
              opacity={0.8}
              attribution="OWM Maps 2.0"
            />
          )}
          {layers.snowdepth && owmKey && (
            <TileLayer
              url={`https://maps.openweathermap.org/maps/2.0/weather/1h/SD0/{z}/{x}/{y}?appid=${owmKey}&fill_bound=true&opacity=0.85`}
              opacity={0.85}
              attribution="OWM Maps 2.0"
            />
          )}

          {layers.seamap && (
            <TileLayer
              url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
              opacity={0.8}
              attribution="© OpenSeaMap"
            />
          )}
          {layers.railways && (
            <TileLayer
              url="https://a.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
              opacity={0.8}
              attribution="© OpenRailwayMap"
            />
          )}
          {layers.aviation && (
            <TileLayer
              url="https://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png"
              subdomains="12"
              tms
              opacity={0.8}
              attribution="openAIP Data"
              minZoom={4}
              maxZoom={14}
            />
          )}
          {layers.topo && (
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              opacity={0.7}
              attribution="© OpenTopoMap"
            />
          )}
          {layers.labels && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
              opacity={0.9}
              attribution="© CARTO"
            />
          )}

          {selected && (
            <Marker position={[selected.lat, selected.lon]}>
              <Popup>{selected.name}</Popup>
            </Marker>
          )}

          {layers.flights && flights.map(f => (
            <Marker
              key={f.icao}
              position={[f.lat, f.lon]}
              icon={L.divIcon({
                html: `<div style="transform:rotate(${f.heading || 0}deg);font-size:18px;line-height:1">✈</div>`,
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
              eventHandlers={{ click: () => setDetail({ item: f, type: 'flight' }) }}
            >
              <Popup>
                <b>{f.callsign || f.icao}</b><br />
                Altitude: {f.altitude ? `${Math.round(f.altitude)}m` : 'unknown'}<br />
                Speed: {f.velocity ? `${Math.round(f.velocity * 3.6)} km/h` : 'unknown'}<br />
                Heading: {f.heading ? `${Math.round(f.heading)}°` : 'unknown'}<br />
                Country: {f.originCountry || 'unknown'}
              </Popup>
            </Marker>
          ))}

          {layers.vessels && vessels.map(v => (
            v.lat != null && v.lon != null && (
              <Marker
                key={v.mmsi}
                position={[v.lat, v.lon]}
                icon={L.divIcon({
                  html: '<div style="font-size:16px;line-height:1">🚢</div>',
                  className: '',
                  iconSize: [18, 18],
                  iconAnchor: [9, 9]
                })}
                eventHandlers={{ click: () => setDetail({ item: v, type: 'vessel' }) }}
              >
                <Popup>
                  <b>{v.name || 'Unknown vessel'}</b><br />
                  MMSI: {v.mmsi}<br />
                  Speed: {v.speed || 'unknown'}<br />
                  Type: {v.shipType || 'unknown'}
                </Popup>
              </Marker>
            )
          ))}

          <WeatherLegend layers={layers} />
        </MapContainer>
        <DetailPanel
          item={detail?.item}
          type={detail?.type}
          onClose={() => setDetail(null)}
        />
        <ErrorModal
          show={showError}
          message={error}
          onClose={() => setShowError(false)}
        />
      </div>
    </div>
  )
}
