import {useEffect,useState} from 'react'
import {getFlights} from '../api'
export default function useFlights(active){
  const [flights,setFlights]=useState([])
  useEffect(()=>{
    if(!active)return
    const fetch=async()=>{
      try{
        const r=await getFlights()
        const states=r.data?.states||[]
        setFlights(states.filter(s=>s[6]&&s[5]).map(s=>({
          icao:s[0], callsign:(s[1]||'').trim(),
          originCountry:s[2], lon:s[5], lat:s[6],
          altitude:s[7], onGround:s[8], velocity:s[9],
          heading:s[10], vertRate:s[11], squawk:s[14]
        })))
      }catch(e){}
    }
    fetch()
    const t=setInterval(fetch,15000)
    return ()=>clearInterval(t)
  },[active])
  return flights
}
