'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Maximize2, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function FitBounds({ cities }) {
  const map = useMap()
  
  useEffect(() => {
    if (cities && cities.length > 0) {
      const bounds = cities.map(city => [city.lat, city.lng])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [cities, map])
  
  return null
}

export default function IndiaMapLeaflet({ installationTrackerData }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!installationTrackerData || !installationTrackerData.cityCount) {
    return <div className="text-center py-20 text-gray-500">Loading map data...</div>
  }

  const activeCities = Object.keys(installationTrackerData.cityCount)

  const cityCoordinates = {
    'mumbai': { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
    'delhi': { lat: 28.7041, lng: 77.1025, label: 'Delhi' },
    'bengaluru': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
    'kolkata': { lat: 22.5726, lng: 88.3639, label: 'Kolkata' },
    'chennai': { lat: 13.0827, lng: 80.2707, label: 'Chennai' },
    'hyderabad': { lat: 17.3850, lng: 78.4867, label: 'Hyderabad' },
    'pune': { lat: 18.5204, lng: 73.8567, label: 'Pune' },
    'ahmedabad': { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad' },
    'surat': { lat: 21.1702, lng: 72.8311, label: 'Surat' },
    'jaipur': { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
    'lucknow': { lat: 26.8467, lng: 80.9462, label: 'Lucknow' },
    'kanpur': { lat: 26.4499, lng: 80.3319, label: 'Kanpur' },
    'nagpur': { lat: 21.1458, lng: 79.0882, label: 'Nagpur' },
    'indore': { lat: 22.7196, lng: 75.8577, label: 'Indore' },
    'thane': { lat: 19.2183, lng: 72.9781, label: 'Thane' },
    'bhopal': { lat: 23.2599, lng: 77.4126, label: 'Bhopal' },
    'visakhapatnam': { lat: 17.6869, lng: 83.2185, label: 'Vizag' },
    'patna': { lat: 25.5941, lng: 85.1376, label: 'Patna' },
    'vadodara': { lat: 22.3072, lng: 73.1812, label: 'Vadodara' },
    'ghaziabad': { lat: 28.6692, lng: 77.4538, label: 'Ghaziabad' },
    'ludhiana': { lat: 30.9010, lng: 75.8573, label: 'Ludhiana' },
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
    'navi mumbai': { lat: 19.0330, lng: 73.0297, label: 'Navi Mumbai' },
    'allahabad': { lat: 25.4358, lng: 81.8463, label: 'Prayagraj' },
    'ranchi': { lat: 23.3441, lng: 85.3096, label: 'Ranchi' },
    'howrah': { lat: 22.5958, lng: 88.2636, label: 'Howrah' },
    'coimbatore': { lat: 11.0168, lng: 76.9558, label: 'Coimbatore' },
    'jabalpur': { lat: 23.1815, lng: 79.9864, label: 'Jabalpur' },
    'gwalior': { lat: 26.2183, lng: 78.1828, label: 'Gwalior' },
    'vijayawada': { lat: 16.5062, lng: 80.6480, label: 'Vijayawada' },
    'jodhpur': { lat: 26.2389, lng: 73.0243, label: 'Jodhpur' },
    'madurai': { lat: 9.9252, lng: 78.1198, label: 'Madurai' },
    'raipur': { lat: 21.2514, lng: 81.6296, label: 'Raipur' },
    'kota': { lat: 25.2138, lng: 75.8648, label: 'Kota' },
    'chandigarh': { lat: 30.7333, lng: 76.7794, label: 'Chandigarh' },
    'guwahati': { lat: 26.1445, lng: 91.7362, label: 'Guwahati' },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, label: 'Trivandrum' },
    'solapur': { lat: 17.6599, lng: 75.9064, label: 'Solapur' },
    'tiruchirappalli': { lat: 10.7905, lng: 78.7047, label: 'Trichy' },
    'tiruppur': { lat: 11.1085, lng: 77.3411, label: 'Tiruppur' },
    'bareilly': { lat: 28.3670, lng: 79.4304, label: 'Bareilly' },
    'mysore': { lat: 12.2958, lng: 76.6394, label: 'Mysuru' },
    'salem': { lat: 11.6643, lng: 78.1460, label: 'Salem' },
    'gurgaon': { lat: 28.4595, lng: 77.0266, label: 'Gurugram' },
    'aligarh': { lat: 27.8974, lng: 78.0880, label: 'Aligarh' },
    'jalandhar': { lat: 31.3260, lng: 75.5762, label: 'Jalandhar' },
    'bhubaneswar': { lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar' },
    'noida': { lat: 28.5355, lng: 77.3910, label: 'Noida' },
    'moradabad': { lat: 28.8389, lng: 78.7378, label: 'Moradabad' },
    'kochi': { lat: 9.9312, lng: 76.2673, label: 'Kochi' },
    'mangalore': { lat: 12.9141, lng: 74.8560, label: 'Mangaluru' }
  }

  const activeCityData = Object.entries(cityCoordinates)
    .filter(([key]) => activeCities.includes(key))
    .map(([key, coords]) => ({
      ...coords,
      count: installationTrackerData.cityCount[key] || 0,
      key
    }))

  // BRIGHT VIBRANT COLORS
  const getColor = (count) => {
    if (count > 100) return '#C026D3' // Fuchsia
    if (count > 50) return '#0EA5E9'  // Sky Blue
    if (count > 20) return '#22C55E'  // Lime Green
    if (count > 10) return '#F97316'  // Orange
    if (count > 5) return '#6366F1'   // Indigo
    return '#F43F5E'                   // Rose
  }

  // SMALLER RADIUS - Perfect size!
  const getRadius = (count) => {
    if (count > 200) return 18
    if (count > 100) return 16
    if (count > 50) return 14
    if (count > 20) return 11
    if (count > 10) return 9
    if (count > 5) return 7
    return 6
  }

  // CLEAN MINIMAL MARKER - No labels, just bubbles
  const createCustomIcon = (city, count, color) => {
    const radius = getRadius(count)
    const fontSize = radius > 14 ? '13px' : radius > 10 ? '11px' : '9px'
    
    return L.divIcon({
      html: `
        <div style="position: relative; width: ${radius * 2.2}px; height: ${radius * 2.2}px;">
          <!-- Soft glow -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${radius * 2.6}px;
            height: ${radius * 2.6}px;
            background: radial-gradient(circle, ${color}50 0%, transparent 65%);
            border-radius: 50%;
            animation: glow-pulse 3s ease-in-out infinite;
          "></div>
          
          <!-- Main bubble -->
          <div class="bubble-marker" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${radius * 2}px;
            height: ${radius * 2}px;
            background: ${color};
            background: linear-gradient(145deg, ${color} 0%, ${color}dd 100%);
            border: 2.5px solid rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: ${fontSize};
            color: white;
            letter-spacing: -0.5px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.4);
            box-shadow: 
              0 2px 10px ${color}70,
              0 1px 3px rgba(0,0,0,0.25),
              inset 0 -1px 2px rgba(0,0,0,0.15);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: ${1000 + count};
          ">
            ${count}
          </div>
        </div>
        
        <style>
          @keyframes glow-pulse {
            0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.55; transform: translate(-50%, -50%) scale(1.08); }
          }
          .bubble-marker:hover {
            transform: translate(-50%, -50%) scale(1.3) !important;
            box-shadow: 
              0 4px 18px ${color}90,
              0 2px 6px rgba(0,0,0,0.35),
              inset 0 -1px 2px rgba(0,0,0,0.2) !important;
            border-width: 3px !important;
            z-index: 999999 !important;
          }
        </style>
      `,
      className: 'clean-marker',
      iconSize: [radius * 2.6, radius * 2.6],
      iconAnchor: [radius * 1.3, radius * 1.3]
    })
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  // FULLSCREEN
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999]" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)' }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap, CartoDB'
          />
          <FitBounds cities={activeCityData} />
          {activeCityData.map((city) => (
            <Marker
              key={city.key}
              position={[city.lat, city.lng]}
              icon={createCustomIcon(city, city.count, getColor(city.count))}
            >
              <Popup className="modern-popup">
                <div className="text-center px-4 py-3">
                  <div className="text-xl font-bold text-gray-900 mb-1">{city.label}</div>
                  <div className="text-base font-semibold text-gray-600">{city.count} devices</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <button
          onClick={toggleFullscreen}
          className="absolute top-6 right-6 z-[10000] bg-gradient-to-r from-rose-500 via-red-500 to-red-600 hover:from-rose-600 hover:via-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 flex items-center space-x-3 font-bold text-base border border-white border-opacity-20"
        >
          <X size={22} />
          <span>Close Map</span>
        </button>
      </div>
    )
  }

  // NORMAL VIEW
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl shadow-2xl"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap, CartoDB'
        />
        <FitBounds cities={activeCityData} />
        {activeCityData.map((city) => (
          <Marker
            key={city.key}
            position={[city.lat, city.lng]}
            icon={createCustomIcon(city, city.count, getColor(city.count))}
          >
            <Popup className="modern-popup">
              <div className="text-center px-3 py-2">
                <div className="text-lg font-bold text-gray-900 mb-1">{city.label}</div>
                <div className="text-sm font-semibold text-gray-600">{city.count} devices</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-xl transition-all duration-300 flex items-center space-x-2 font-bold text-sm border border-white border-opacity-25 backdrop-blur-sm"
      >
        <Maximize2 size={16} />
        <span>Expand Map</span>
      </button>
    </div>
  )
}
