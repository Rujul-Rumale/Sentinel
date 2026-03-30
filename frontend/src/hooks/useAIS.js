import {useEffect,useState} from 'react'
import {getVessels} from '../api'

const MAX_VESSELS = 2000
const INDIA_REGION = {
  minLat: -5,
  maxLat: 35,
  minLon: 55,
  maxLon: 100
}

const isNearIndia = vessel =>
  vessel.lat != null && vessel.lon != null &&
  vessel.lat >= INDIA_REGION.minLat &&
  vessel.lat <= INDIA_REGION.maxLat &&
  vessel.lon >= INDIA_REGION.minLon &&
  vessel.lon <= INDIA_REGION.maxLon

export default function useAIS(active){
  const [vessels,setVessels]=useState([])

  useEffect(()=>{
    if(!active){
      setVessels([])
      return
    }

    const fetch=async()=>{
      try{
        const r=await getVessels()
        const next=(r.data||[]).filter(v=>v.lat!=null&&v.lon!=null)
        const nearIndia=next.filter(isNearIndia)
        const rest=next.filter(v=>!isNearIndia(v))
        setVessels([...nearIndia,...rest].slice(0,MAX_VESSELS))
      }catch(e){}
    }

    fetch()
    const t=setInterval(fetch,5000)
    return ()=>clearInterval(t)
  },[active])

  return vessels
}
