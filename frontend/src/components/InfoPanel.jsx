import React from 'react'
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts'
import {saveLocation} from '../api'
const COLORS=['#4caf82','#3d5af1','#f0b429','#f44336','#9c27b0','#00bcd4']
export default function InfoPanel({weather,aqi,lulc,rainfall,selected,layers}){
  const bookmark=async()=>{
    if(!selected)return
    await saveLocation({name:selected.name,lat:selected.lat,lon:selected.lon,type:'bookmark',metadata:'{}'})
    alert('Bookmarked!')
  }
  const aqiLevel=v=>v<50?'good':v<100?'moderate':'bad'
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {selected&&(
        <div className="panel">
          <h3>{selected.name}</h3>
          <div style={{fontSize:12,color:'#aab'}}>
            {selected.lat?.toFixed(4)}, {selected.lon?.toFixed(4)}
          </div>
          <button className="bookmark-btn" onClick={bookmark}>+ Bookmark</button>
        </div>
      )}
      {weather&&(
        <div className="panel">
          <h3>Weather</h3>
          <div style={{fontSize:13}}>
            🌡 {weather.current?.temperature_2m}°C &nbsp;
            💧 {weather.current?.precipitation}mm &nbsp;
            💨 {weather.current?.windspeed_10m} km/h
          </div>
          {weather.daily&&(
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={weather.daily.time?.map((t,i)=>({
                day:t.slice(5),max:weather.daily.temperature_2m_max[i],
                min:weather.daily.temperature_2m_min[i]
              }))}>
                <XAxis dataKey="day" tick={{fontSize:9,fill:'#aab'}}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:'#22263a',border:'none',fontSize:11}}/>
                <Bar dataKey="max" fill="#f0b429" radius={2}/>
                <Bar dataKey="min" fill="#3d5af1" radius={2}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
      {aqi&&(
        <div className="panel">
          <h3>Air quality</h3>
          {aqi.results?.slice(0,2).map((loc,i)=>(
            <div key={i} style={{fontSize:12,marginBottom:4}}>
              <span style={{color:'#aab'}}>{loc.name} </span>
              {loc.parameters?.map((p,j)=>(
                <span key={j} className={`tag ${aqiLevel(p.lastValue)}`}>
                  {p.parameter}: {p.lastValue?.toFixed(1)}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      {lulc&&(
        <div className="panel">
          <h3>Land use</h3>
          <PieChart width={280} height={120}>
            <Pie data={lulc} cx={140} cy={60} innerRadius={30} outerRadius={55}
              dataKey="value" nameKey="name">
              {lulc.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
            </Pie>
            <Tooltip contentStyle={{background:'#22263a',border:'none',fontSize:11}}/>
          </PieChart>
        </div>
      )}
      {rainfall&&(
        <div className="panel">
          <h3>Rainfall</h3>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={rainfall.records?.slice(0,12)}>
              <XAxis dataKey="subdivision" tick={{fontSize:8,fill:'#aab'}}/>
              <YAxis hide/>
              <Tooltip contentStyle={{background:'#22263a',border:'none',fontSize:11}}/>
              <Bar dataKey="jan_rainfall" fill="#3d5af1" radius={2}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {(layers?.precipitation||layers?.temperature||layers?.clouds||layers?.wind)&&(
        <div className="panel">
          <h3>Weather legend</h3>
          {layers?.precipitation&&<div style={{fontSize:11,marginBottom:4}}>
            <span style={{color:'#aab'}}>Precipitation</span>
            <img src="https://openweathermap.org/img/legend/precipitation.png"
              style={{width:'100%',marginTop:4}} alt="precipitation legend"/>
          </div>}
          {layers?.temperature&&<div style={{fontSize:11,marginBottom:4}}>
            <span style={{color:'#aab'}}>Temperature</span>
            <img src="https://openweathermap.org/img/legend/temp.png"
              style={{width:'100%',marginTop:4}} alt="temp legend"/>
          </div>}
          {layers?.wind&&<div style={{fontSize:11}}>
            <span style={{color:'#aab'}}>Wind speed</span>
            <img src="https://openweathermap.org/img/legend/wind.png"
              style={{width:'100%',marginTop:4}} alt="wind legend"/>
          </div>}
        </div>
      )}
    </div>
  )
}
