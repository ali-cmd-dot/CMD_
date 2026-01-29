'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
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

  useEffect(() => {
    if (isFullscreen) {
      // Lock body scroll when fullscreen
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      // Restore scroll
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isFullscreen])

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

  // ENHANCED RED PIN WITH GLOW
  const createRedPin = (city, count) => {
    return L.divIcon({
      html: `
        <div class="location-pin-container" style="position: relative; width: 40px; height: 50px;">
          <!-- Glow effect -->
          <div style="
            position: absolute;
            width: 60px;
            height: 60px;
            top: 5px;
            left: -10px;
            background: radial-gradient(circle, rgba(234, 67, 53, 0.5) 0%, transparent 70%);
            border-radius: 50%;
            animation: pin-glow 2s ease-in-out infinite;
          "></div>
          
          <!-- Red Location Pin -->
          <svg width="40" height="50" viewBox="0 0 40 50" style="
            filter: drop-shadow(0 4px 12px rgba(234, 67, 53, 0.7)) 
                    drop-shadow(0 0 20px rgba(234, 67, 53, 0.4));
          ">
            <defs>
              <linearGradient id="pinGradient${count}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#EA4335;stop-opacity:1" />
              </linearGradient>
            </defs>
            
            <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z" 
                  fill="url(#pinGradient${count})" 
                  stroke="#FFFFFF" 
                  stroke-width="2"
                  opacity="1"/>
            
            <circle cx="20" cy="15" r="11" fill="white" opacity="1"/>
            
            <text x="20" y="20" 
                  text-anchor="middle" 
                  font-size="${count > 999 ? '9' : count > 99 ? '10' : '12'}px" 
                  font-weight="900" 
                  fill="#EA4335"
                  font-family="Arial, sans-serif">${count}</text>
          </svg>
          
          <style>
            @keyframes pin-glow {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.1); }
            }
            .location-pin-container {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
            }
            .location-pin-container:hover {
              transform: scale(1.25);
              z-index: 999999 !important;
            }
            .location-pin-container:hover svg {
              filter: drop-shadow(0 6px 20px rgba(234, 67, 53, 1)) 
                      drop-shadow(0 0 30px rgba(234, 67, 53, 0.7))
                      drop-shadow(0 0 40px rgba(255, 107, 107, 0.5));
            }
          </style>
        </div>
      `,
      className: 'red-pin-marker',
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50]
    })
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  // FULLSCREEN VIEW - PROPERLY FIXED
  if (isFullscreen) {
    return (
      <div 
        className="fullscreen-map-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          background: '#0a0e27'
        }}
      >
        <MapContainer
          center={[22.5, 79]}
          zoom={5}
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          zoomControl={true}
          preferCanvas={true}
        >
          {/* BEST DARK MAP - NO GRID LINES */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            maxZoom={19}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            attribution=''
            maxZoom={19}
          />
          
          <FitBounds cities={activeCityData} />
          {activeCityData.map((city) => (
            <Marker
              key={city.key}
              position={[city.lat, city.lng]}
              icon={createRedPin(city, city.count)}
            >
              <Popup className="pin-popup">
                <div className="text-center px-4 py-3">
                  <div className="text-xl font-bold text-white mb-1">{city.label}</div>
                  <div className="text-lg font-semibold text-red-400">{city.count} devices</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100000,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <X size={20} />
          Close Map
        </button>
      </div>
    )
  }

  // NORMAL VIEW
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[22.5, 79]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl shadow-2xl"
        zoomControl={true}
        preferCanvas={true}
      >
        {/* BEST DARK MAP - NO GRID LINES + LABELS OVERLAY */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          maxZoom={19}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          attribution=''
          maxZoom={19}
        />
        
        <FitBounds cities={activeCityData} />
        {activeCityData.map((city) => (
          <Marker
            key={city.key}
            position={[city.lat, city.lng]}
            icon={createRedPin(city, city.count)}
          >
            <Popup className="pin-popup">
              <div className="text-center px-3 py-2">
                <div className="text-lg font-bold text-white mb-1">{city.label}</div>
                <div className="text-base font-semibold text-red-400">{city.count} devices</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-xl transition-all duration-300 flex items-center space-x-2 font-bold text-sm"
      >
        <Maximize2 size={16} />
        <span>Expand Map</span>
      </button>
    </div>
  )
}
