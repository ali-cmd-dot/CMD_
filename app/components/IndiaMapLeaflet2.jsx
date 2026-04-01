'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { Maximize2, Minimize2, MapPin, Activity, TrendingUp, Zap } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export default function IndiaMapLeaflet({ installationTrackerData }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isFullscreen])

  if (!isMounted) {
    return (
      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#060e08', borderRadius:16 }}>
        <div style={{ textAlign:'center' }}>
          <div className="loading-spinner-clean" />
          <p style={{ color:'rgba(255,255,255,0.4)', marginTop:16, fontSize:14 }}>Loading Network Map...</p>
        </div>
      </div>
    )
  }

  if (!installationTrackerData || !installationTrackerData.cityCount) {
    return (
      <div style={{ textAlign:'center', padding:'80px 0', color:'rgba(255,255,255,0.4)', background:'#060e08' }}>
        <Activity size={40} style={{ marginBottom:12, opacity:0.4 }} />
        <p>Loading device data...</p>
      </div>
    )
  }

  // City coordinates
  const cityCoordinates = {
    'mumbai': { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
    'delhi': { lat: 28.7041, lng: 77.1025, label: 'Delhi' },
    'new delhi': { lat: 28.6139, lng: 77.2090, label: 'New Delhi' },
    'bengaluru': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
    'bangalore': { lat: 12.9716, lng: 77.5946, label: 'Bangalore' },
    'banagalore': { lat: 12.9716, lng: 77.5946, label: 'Bangalore' },
    'banaglore': { lat: 12.9716, lng: 77.5946, label: 'Bangalore' },
    'kolkata': { lat: 22.5726, lng: 88.3639, label: 'Kolkata' },
    'kolkota': { lat: 22.5726, lng: 88.3639, label: 'Kolkata' },
    'chennai': { lat: 13.0827, lng: 80.2707, label: 'Chennai' },
    'hyderabad': { lat: 17.3850, lng: 78.4867, label: 'Hyderabad' },
    'pune': { lat: 18.5204, lng: 73.8567, label: 'Pune' },
    'ahmedabad': { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad' },
    'patna': { lat: 25.5941, lng: 85.1376, label: 'Patna' },
    'surat': { lat: 21.1702, lng: 72.8311, label: 'Surat' },
    'jaipur': { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
    'jaipuar': { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
    'lucknow': { lat: 26.8467, lng: 80.9462, label: 'Lucknow' },
    'kanpur': { lat: 26.4499, lng: 80.3319, label: 'Kanpur' },
    'nagpur': { lat: 21.1458, lng: 79.0882, label: 'Nagpur' },
    'indore': { lat: 22.7196, lng: 75.8577, label: 'Indore' },
    'thane': { lat: 19.2183, lng: 72.9781, label: 'Thane' },
    'bhopal': { lat: 23.2599, lng: 77.4126, label: 'Bhopal' },
    'visakhapatnam': { lat: 17.6869, lng: 83.2185, label: 'Visakhapatnam' },
    'vizag': { lat: 17.6869, lng: 83.2185, label: 'Vizag' },
    'vadodara': { lat: 22.3072, lng: 73.1812, label: 'Vadodara' },
    'baroda': { lat: 22.3072, lng: 73.1812, label: 'Baroda' },
    'ghaziabad': { lat: 28.6692, lng: 77.4538, label: 'Ghaziabad' },
    'ludhiana': { lat: 30.9010, lng: 75.8573, label: 'Ludhiana' },
    'ludhiana punjab': { lat: 30.9010, lng: 75.8573, label: 'Ludhiana' },
    'ludhiana punajb': { lat: 30.9010, lng: 75.8573, label: 'Ludhiana' },
    'agra': { lat: 27.1767, lng: 78.0081, label: 'Agra' },
    'nashik': { lat: 19.9975, lng: 73.7898, label: 'Nashik' },
    'faridabad': { lat: 28.4089, lng: 77.3178, label: 'Faridabad' },
    'meerut': { lat: 28.9845, lng: 77.7064, label: 'Meerut' },
    'rajkot': { lat: 22.3039, lng: 70.8022, label: 'Rajkot' },
    'varanasi': { lat: 25.3176, lng: 82.9739, label: 'Varanasi' },
    'srinagar': { lat: 34.0837, lng: 74.7973, label: 'Srinagar' },
    'aurangabad': { lat: 19.8762, lng: 75.3433, label: 'Aurangabad' },
    'dhanbad': { lat: 23.7957, lng: 86.4304, label: 'Dhanbad' },
    'amritsar': { lat: 31.6340, lng: 74.8723, label: 'Amritsar' },
    'amritar': { lat: 31.6340, lng: 74.8723, label: 'Amritsar' },
    'navi mumbai': { lat: 19.0330, lng: 73.0297, label: 'Navi Mumbai' },
    'allahabad': { lat: 25.4358, lng: 81.8463, label: 'Allahabad' },
    'prayagraj': { lat: 25.4358, lng: 81.8463, label: 'Prayagraj' },
    'ranchi': { lat: 23.3441, lng: 85.3096, label: 'Ranchi' },
    'howrah': { lat: 22.5958, lng: 88.2636, label: 'Howrah' },
    'coimbatore': { lat: 11.0168, lng: 76.9558, label: 'Coimbatore' },
    'coiambatore': { lat: 11.0168, lng: 76.9558, label: 'Coimbatore' },
    'jabalpur': { lat: 23.1815, lng: 79.9864, label: 'Jabalpur' },
    'gwalior': { lat: 26.2183, lng: 78.1828, label: 'Gwalior' },
    'vijayawada': { lat: 16.5062, lng: 80.6480, label: 'Vijayawada' },
    'vijaywada': { lat: 16.5062, lng: 80.6480, label: 'Vijayawada' },
    'jodhpur': { lat: 26.2389, lng: 73.0243, label: 'Jodhpur' },
    'madurai': { lat: 9.9252, lng: 78.1198, label: 'Madurai' },
    'raipur': { lat: 21.2514, lng: 81.6296, label: 'Raipur' },
    'kota': { lat: 25.2138, lng: 75.8648, label: 'Kota' },
    'chandigarh': { lat: 30.7333, lng: 76.7794, label: 'Chandigarh' },
    'guwahati': { lat: 26.1445, lng: 91.7362, label: 'Guwahati' },
    'guwathi': { lat: 26.1445, lng: 91.7362, label: 'Guwahati' },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, label: 'Thiruvananthapuram' },
    'trivandrum': { lat: 8.5241, lng: 76.9366, label: 'Trivandrum' },
    'solapur': { lat: 17.6599, lng: 75.9064, label: 'Solapur' },
    'tiruchirappalli': { lat: 10.7905, lng: 78.7047, label: 'Tiruchirappalli' },
    'trichy': { lat: 10.7905, lng: 78.7047, label: 'Trichy' },
    'tiruppur': { lat: 11.1085, lng: 77.3411, label: 'Tiruppur' },
    'bareilly': { lat: 28.3670, lng: 79.4304, label: 'Bareilly' },
    'mysore': { lat: 12.2958, lng: 76.6394, label: 'Mysore' },
    'mysuru': { lat: 12.2958, lng: 76.6394, label: 'Mysuru' },
    'salem': { lat: 11.6643, lng: 78.1460, label: 'Salem' },
    'gurgaon': { lat: 28.4595, lng: 77.0266, label: 'Gurgaon' },
    'gurugram': { lat: 28.4595, lng: 77.0266, label: 'Gurugram' },
    'gurgoan': { lat: 28.4595, lng: 77.0266, label: 'Gurgaon' },
    'aligarh': { lat: 27.8974, lng: 78.0880, label: 'Aligarh' },
    'jalandhar': { lat: 31.3260, lng: 75.5762, label: 'Jalandhar' },
    'bhubaneswar': { lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar' },
    'bhubaneshwar': { lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar' },
    'bhubneshwar': { lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar' },
    'noida': { lat: 28.5355, lng: 77.3910, label: 'Noida' },
    'moradabad': { lat: 28.8389, lng: 78.7378, label: 'Moradabad' },
    'mordabad': { lat: 28.8389, lng: 78.7378, label: 'Moradabad' },
    'kochi': { lat: 9.9312, lng: 76.2673, label: 'Kochi' },
    'cochin': { lat: 9.9312, lng: 76.2673, label: 'Cochin' },
    'mangalore': { lat: 12.9141, lng: 74.8560, label: 'Mangalore' },
    'mangaluru': { lat: 12.9141, lng: 74.8560, label: 'Mangaluru' },
    'warangal': { lat: 17.9689, lng: 79.5941, label: 'Warangal' },
    'kalyan': { lat: 19.2403, lng: 73.1305, label: 'Kalyan' },
    'dombivli': { lat: 19.2183, lng: 73.0868, label: 'Dombivli' },
    'vasai': { lat: 19.4614, lng: 72.7875, label: 'Vasai' },
    'virar': { lat: 19.4559, lng: 72.8111, label: 'Virar' },
    'pimpri': { lat: 18.6298, lng: 73.7997, label: 'Pimpri' },
    'bikaner': { lat: 28.0229, lng: 73.3119, label: 'Bikaner' },
    'amravati': { lat: 20.9374, lng: 77.7796, label: 'Amravati' },
    'udaipur': { lat: 24.5854, lng: 73.7125, label: 'Udaipur' },
    'jamshedpur': { lat: 22.8046, lng: 86.2029, label: 'Jamshedpur' },
    'jamshedhpur': { lat: 22.8046, lng: 86.2029, label: 'Jamshedpur' },
    'bhilai': { lat: 21.1938, lng: 81.3509, label: 'Bhilai' },
    'cuttack': { lat: 20.4625, lng: 85.8830, label: 'Cuttack' },
    'dehradun': { lat: 30.3165, lng: 78.0322, label: 'Dehradun' },
    'asansol': { lat: 23.6839, lng: 86.9524, label: 'Asansol' },
    'nanded': { lat: 19.1383, lng: 77.3210, label: 'Nanded' },
    'ajmer': { lat: 26.4499, lng: 74.6399, label: 'Ajmer' },
    'jamnagar': { lat: 22.4707, lng: 70.0577, label: 'Jamnagar' },
    'ujjain': { lat: 23.1765, lng: 75.7885, label: 'Ujjain' },
    'sangli': { lat: 16.8524, lng: 74.5815, label: 'Sangli' },
    'jhansi': { lat: 25.4484, lng: 78.5685, label: 'Jhansi' },
    'nellore': { lat: 14.4426, lng: 79.9865, label: 'Nellore' },
    'jammu': { lat: 32.7266, lng: 74.8570, label: 'Jammu' },
    'belgaum': { lat: 15.8497, lng: 74.4977, label: 'Belgaum' },
    'belagavi': { lat: 15.8497, lng: 74.4977, label: 'Belagavi' },
    'tirunelveli': { lat: 8.7139, lng: 77.7567, label: 'Tirunelveli' },
    'gaya': { lat: 24.7955, lng: 84.9994, label: 'Gaya' },
    'tirupati': { lat: 13.6288, lng: 79.4192, label: 'Tirupati' },
    'davanagere': { lat: 14.4644, lng: 75.9218, label: 'Davanagere' },
    'kozhikode': { lat: 11.2588, lng: 75.7804, label: 'Kozhikode' },
    'calicut': { lat: 11.2588, lng: 75.7804, label: 'Calicut' },
    'akola': { lat: 20.7333, lng: 77.0082, label: 'Akola' },
    'kurnool': { lat: 15.8281, lng: 78.0373, label: 'Kurnool' },
    'rajahmundry': { lat: 17.0005, lng: 81.8040, label: 'Rajahmundry' },
    'bhagalpur': { lat: 25.2425, lng: 86.9842, label: 'Bhagalpur' },
    'latur': { lat: 18.3996, lng: 76.5630, label: 'Latur' },
    'iatur': { lat: 18.3996, lng: 76.5630, label: 'Latur' },
    'muzaffarpur': { lat: 26.1225, lng: 85.3906, label: 'Muzaffarpur' },
    'mathura': { lat: 27.4924, lng: 77.6737, label: 'Mathura' },
    'kollam': { lat: 8.8932, lng: 76.6141, label: 'Kollam' },
    'kadapa': { lat: 14.4674, lng: 78.8241, label: 'Kadapa' },
    'imphal': { lat: 24.8170, lng: 93.9368, label: 'Imphal' },
    'anantapur': { lat: 14.6819, lng: 77.6006, label: 'Anantapur' },
    'anantapuram': { lat: 14.6819, lng: 77.6006, label: 'Anantapuram' },
    'karimnagar': { lat: 18.4386, lng: 79.1288, label: 'Karimnagar' },
    'patiala': { lat: 30.3398, lng: 76.3869, label: 'Patiala' },
    'rohtak': { lat: 28.8955, lng: 76.6066, label: 'Rohtak' },
    'panipat': { lat: 29.3909, lng: 76.9635, label: 'Panipat' },
    'durgapur': { lat: 23.5204, lng: 87.3119, label: 'Durgapur' },
    'siliguri': { lat: 26.7271, lng: 88.3953, label: 'Siliguri' },
    'secunderabad': { lat: 17.4399, lng: 78.4983, label: 'Secunderabad' },
    'khammam': { lat: 17.2473, lng: 80.1436, label: 'Khammam' },
    'bhimavaram': { lat: 16.5449, lng: 81.5212, label: 'Bhimavaram' },
    'hajipur': { lat: 25.6892, lng: 85.2100, label: 'Hajipur' },
    'bilaspur': { lat: 22.0797, lng: 82.1409, label: 'Bilaspur' },
    'jalgaon': { lat: 21.0077, lng: 75.5626, label: 'Jalgaon' },
    'vellore': { lat: 12.9165, lng: 79.1325, label: 'Vellore' },
    'vallore': { lat: 12.9165, lng: 79.1325, label: 'Vellore' },
    'gandhinagar': { lat: 23.2156, lng: 72.6369, label: 'Gandhinagar' },
    'cuddalore': { lat: 11.7480, lng: 79.7714, label: 'Cuddalore' },
    'kumbakonam': { lat: 10.9617, lng: 79.3881, label: 'Kumbakonam' },
    'dindigul': { lat: 10.3673, lng: 77.9803, label: 'Dindigul' },
    'thanjavur': { lat: 10.7870, lng: 79.1378, label: 'Thanjavur' },
    'tanjore': { lat: 10.7870, lng: 79.1378, label: 'Tanjore' },
    'bharuch': { lat: 21.7051, lng: 72.9959, label: 'Bharuch' },
    'barasat': { lat: 22.7237, lng: 88.4820, label: 'Barasat' },
    'panchkula': { lat: 30.6942, lng: 76.8534, label: 'Panchkula' },
    'raurkela': { lat: 22.2497, lng: 84.8644, label: 'Raurkela' },
    'vizianagaram': { lat: 18.1067, lng: 83.4124, label: 'Vizianagaram' },
    'rewari': { lat: 28.1988, lng: 76.6194, label: 'Rewari' },
    'yamunanagar': { lat: 30.1290, lng: 77.2674, label: 'Yamunanagar' },
    'panaji': { lat: 15.4909, lng: 73.8278, label: 'Panaji' },
    'goa': { lat: 15.2993, lng: 74.1240, label: 'Goa' },
    'ernakulam': { lat: 9.9816, lng: 76.2999, label: 'Ernakulam' },
    'guntur': { lat: 16.3067, lng: 80.4365, label: 'Guntur' },
    'erode': { lat: 11.3410, lng: 77.7172, label: 'Erode' },
    'sonipat': { lat: 28.9931, lng: 77.0151, label: 'Sonipat' },
    'sonipar': { lat: 28.9931, lng: 77.0151, label: 'Sonipat' },
    'ambala': { lat: 30.3782, lng: 76.7826, label: 'Ambala' },
    'solan': { lat: 30.9045, lng: 77.0967, label: 'Solan' },
    'manali': { lat: 32.2396, lng: 77.1887, label: 'Manali' },
    'rudrapur': { lat: 28.9845, lng: 79.4052, label: 'Rudrapur' },
    'haridwar': { lat: 29.9457, lng: 78.1642, label: 'Haridwar' },
    'hosur': { lat: 12.7409, lng: 77.8253, label: 'Hosur' },
    'beed': { lat: 18.9894, lng: 75.7566, label: 'Beed' },
    'jhajjar': { lat: 28.6063, lng: 76.6565, label: 'Jhajjar' },
    'manesar': { lat: 28.3632, lng: 76.9318, label: 'Manesar' },
    'bhiwadi': { lat: 28.2110, lng: 76.8606, label: 'Bhiwadi' },
    'noida': { lat: 28.5355, lng: 77.3910, label: 'Noida' },
    'up': { lat: 26.8467, lng: 80.9462, label: 'Uttar Pradesh' },
    'kerala': { lat: 10.8505, lng: 76.2711, label: 'Kerala' },
    'punjab': { lat: 31.1471, lng: 75.3412, label: 'Punjab' },
    'haryana': { lat: 29.0588, lng: 76.0856, label: 'Haryana' },
    'assam': { lat: 26.2006, lng: 92.9376, label: 'Assam' },
    'rajasthan': { lat: 27.0238, lng: 74.2179, label: 'Rajasthan' },
    'singapore': { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
    'jalna': { lat: 19.8347, lng: 75.8800, label: 'Jalna' },
    'satara': { lat: 17.6805, lng: 74.0183, label: 'Satara' },
    'ahmednagar': { lat: 19.0948, lng: 74.7480, label: 'Ahmednagar' },
    'hattigarh': { lat: 26.4009673, lng: 92.86918, label: 'Hattigarh' },
    
  }

  const normalizeCityName = (name) => {
    return name
      .replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u205F\u3000]/g, '')
      .replace(/[^\w\s\-()]/g, '')
      .toLowerCase().trim().replace(/\s+/g, ' ')
  }

  const normalizedCoords = {}
  Object.keys(cityCoordinates).forEach(key => {
    normalizedCoords[normalizeCityName(key)] = cityCoordinates[key]
  })

  const citiesBreakdown = installationTrackerData.citiesBreakdown || []

  const cityData = citiesBreakdown.map(cityInfo => {
    const rawName = cityInfo.city
    const cityKey = normalizeCityName(rawName)
    let coords = normalizedCoords[cityKey]
    if (!coords) {
      const alphaOnly = cityKey.replace(/[^a-z]/g, '')
      for (const [key, val] of Object.entries(normalizedCoords)) {
        if (key.replace(/[^a-z]/g, '') === alphaOnly) { coords = val; break }
      }
    }
    if (!coords) {
      for (const [key, val] of Object.entries(normalizedCoords)) {
        if (cityKey.startsWith(key) || key.startsWith(cityKey)) { coords = val; break }
      }
    }
    if (coords) return { ...coords, count: cityInfo.count, key: cityKey, rawName }
    return null
  }).filter(Boolean)

  const totalDevices = Object.values(installationTrackerData.cityCount || {}).reduce((a,b)=>a+b, 0)
  const totalCities  = citiesBreakdown.length

  const getMarkerColor = (count) => {
    if (count > 500) return '#ef4444'
    if (count > 200) return '#f97316'
    if (count > 100) return '#f59e0b'
    if (count > 50)  return '#eab308'
    return '#22c55e'
  }
  const getMarkerSize = (count) => {
    if (count > 500) return 28
    if (count > 200) return 24
    if (count > 100) return 20
    if (count > 50)  return 16
    return 12
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const MapView = () => (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <MapContainer
        center={[22.5, 79.5]}
        zoom={5}
        style={{ height:'100%', width:'100%', background:'#f0f9ff' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          maxZoom={19}
        />
        {cityData.map((city, index) => (
          <CircleMarker
            key={index}
            center={[city.lat, city.lng]}
            radius={getMarkerSize(city.count)}
            pathOptions={{ fillColor: getMarkerColor(city.count), fillOpacity: 0.9, color: '#ffffff', weight: 2.5 }}
          >
            <Tooltip permanent direction="center" className="count-tooltip" opacity={1}>
              <span style={{ fontWeight:900, color:'white', fontSize: city.count>200?'13px':city.count>100?'12px':'10px', textShadow:'0 2px 6px rgba(0,0,0,0.95)' }}>
                {city.count}
              </span>
            </Tooltip>
            <Popup>
              <div style={{ padding:'4px 8px', minWidth:120 }}>
                <div style={{ fontWeight:800, fontSize:15, marginBottom:6, color:'white' }}>{city.label}</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>
                  <span style={{ fontWeight:700, fontSize:18, color:'#4ade80' }}>{city.count}</span> devices
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* ── Stats Overlay — top left — FULLY INLINE STYLED ── */}
      <div style={{ position:'absolute', top:16, left:16, zIndex:10000, display:'flex', flexDirection:'column', gap:8 }}>

        {/* Cities card */}
        <div style={{ background:'rgba(9,20,11,0.97)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderRadius:14, padding:'12px 16px', border:'1px solid rgba(34,197,94,0.25)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <MapPin size={17} color="white" />
            </div>
            <div>
              <div style={{ color:'rgba(74,222,128,0.85)', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.13em', marginBottom:3 }}>Pan India · Cities</div>
              <div
                style={{ color:'#ffffff', fontSize:20, fontWeight:900, letterSpacing:'-0.01em', filter:'blur(7px)', transition:'filter 0.3s', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.filter='blur(0px)'}
                onMouseLeave={e => e.currentTarget.style.filter='blur(7px)'}
              >{totalCities}</div>
            </div>
          </div>
        </div>

        {/* Devices card */}
        <div style={{ background:'rgba(9,20,11,0.97)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderRadius:14, padding:'12px 16px', border:'1px solid rgba(34,197,94,0.25)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#8b5cf6,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Activity size={17} color="white" />
            </div>
            <div>
              <div style={{ color:'rgba(74,222,128,0.85)', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.13em', marginBottom:3 }}>Deployed · Devices</div>
              <div
                style={{ color:'#ffffff', fontSize:20, fontWeight:900, letterSpacing:'-0.01em', filter:'blur(7px)', transition:'filter 0.3s', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.filter='blur(0px)'}
                onMouseLeave={e => e.currentTarget.style.filter='blur(7px)'}
              >{totalDevices.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Coverage card */}
        <div style={{ background:'rgba(9,20,11,0.97)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderRadius:14, padding:'12px 16px', border:'1px solid rgba(34,197,94,0.25)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <TrendingUp size={17} color="white" />
            </div>
            <div>
              <div style={{ color:'rgba(74,222,128,0.85)', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.13em', marginBottom:3 }}>Coverage</div>
              <div style={{ color:'#ffffff', fontSize:20, fontWeight:900, letterSpacing:'-0.01em' }}>Pan India</div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Expand button — top right ── */}
      <button
        onClick={toggleFullscreen}
        style={{ position:'absolute', top:16, right:16, zIndex:10000, background:'rgba(9,20,11,0.97)', backdropFilter:'blur(12px)', border:'1px solid rgba(34,197,94,0.25)', color:'#ffffff', padding:'10px 18px', borderRadius:10, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}
        onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.15)'; e.currentTarget.style.borderColor='#22c55e'; e.currentTarget.style.color='#4ade80'}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(9,20,11,0.97)'; e.currentTarget.style.borderColor='rgba(34,197,94,0.25)'; e.currentTarget.style.color='#ffffff'}}
      >
        <Maximize2 size={15} />
        Expand Map
      </button>

      {/* ── Legend — bottom right — FULLY INLINE ── */}
      <div style={{ position:'absolute', bottom:20, right:20, zIndex:10000 }}>
        <div style={{ background:'rgba(9,20,11,0.97)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderRadius:14, padding:'16px 18px', border:'1px solid rgba(34,197,94,0.25)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)', minWidth:180 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:'1px solid rgba(34,197,94,0.15)' }}>
            <Zap size={15} color="#4ade80" />
            <span style={{ color:'white', fontWeight:700, fontSize:13 }}>Device Density</span>
          </div>
          {[
            { color:'#ef4444', label:'500+ devices' },
            { color:'#f97316', label:'200-500' },
            { color:'#f59e0b', label:'100-200' },
            { color:'#eab308', label:'50-100' },
            { color:'#22c55e', label:'1-50' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'5px 6px', borderRadius:7 }}>
              <div style={{ width:13, height:13, borderRadius:'50%', background:item.color, boxShadow:`0 0 8px ${item.color}55`, border:'2px solid rgba(255,255,255,0.2)', flexShrink:0 }} />
              <span style={{ color:'rgba(255,255,255,0.78)', fontSize:12, fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isFullscreen) {
    return (
      <div style={{ position:'fixed', inset:0, width:'100vw', height:'100vh', zIndex:999999, background:'#f0f9ff', display:'flex', flexDirection:'column' }}>
        {/* Cautio header strip — fullscreen, bigger with meaningful text */}
        <div style={{
          background:'#0a1a0d',
          borderBottom:'1px solid rgba(34,197,94,0.2)',
          padding:'0 28px',
          height:76,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexShrink:0,
          zIndex:1000000,
        }}>
          {/* Left — logo + heading */}
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <img src="/cautio_shield.webp" alt="Cautio" style={{ width:42, height:42, objectFit:'contain', filter:'drop-shadow(0 0 12px rgba(34,197,94,0.5))' }} />
            <div>
              <div style={{ color:'rgba(74,222,128,0.8)', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>Cautio · Pan India Network</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'#ffffff', fontSize:20, fontWeight:900, letterSpacing:'-0.02em' }}>Cautio Fleet Network,</span>
                <span style={{ color:'#4ade80', fontSize:20, fontWeight:900, fontStyle:'italic', letterSpacing:'-0.02em' }}>Safer Roads</span>
              </div>
            </div>
          </div>

          {/* Right — exit button only */}
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <button
              onClick={toggleFullscreen}
              style={{ background:'rgba(248,65,65,0.12)', border:'1px solid rgba(248,65,65,0.35)', color:'#fca5a5', padding:'10px 20px', borderRadius:10, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}
            >
              <Minimize2 size={16} />
              Exit Fullscreen
            </button>
          </div>
        </div>

        {/* Map fills remaining height */}
        <div style={{ flex:1, position:'relative' }}>
          <MapView />
        </div>
      </div>
    )
  }

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background:'#f0f9ff' }}>
      <MapView />
    </div>
  )
}
