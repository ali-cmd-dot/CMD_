'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Maximize2, Minimize2, MapPin, Activity, TrendingUp, Zap } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export default function IndiaMapLeaflet({ installationTrackerData }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      <div className="w-full h-full flex items-center justify-center network-map-bg rounded-2xl">
        <div className="text-center space-y-4">
          <div className="loading-spinner"></div>
          <div className="text-white text-lg font-medium">Loading Network Map...</div>
        </div>
      </div>
    )
  }

  if (!installationTrackerData || !installationTrackerData.cityCount) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Activity className="mx-auto mb-4" size={48} />
        <p>Loading device data...</p>
      </div>
    )
  }

  // City coordinates
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

  // Get active cities with data
  const activeCities = Object.keys(installationTrackerData.cityCount || {})
  const cityData = activeCities.map(key => {
    const city = cityCoordinates[key]
    if (!city) return null
    return {
      ...city,
      count: installationTrackerData.cityCount[key] || 0,
      key
    }
  }).filter(Boolean)

  const totalDevices = Object.values(installationTrackerData.cityCount || {}).reduce((a, b) => a + b, 0)

  const getMarkerColor = (count) => {
    if (count > 500) return '#ef4444' // red
    if (count > 200) return '#f97316' // orange
    if (count > 100) return '#f59e0b' // amber
    if (count > 50) return '#eab308' // yellow
    return '#84cc16' // lime
  }

  const getMarkerSize = (count) => {
    if (count > 500) return 25
    if (count > 200) return 20
    if (count > 100) return 15
    if (count > 50) return 12
    return 8
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const MapView = () => (
    <div className="relative w-full h-full">
      {/* Leaflet Map with Dark Theme */}
      <MapContainer
        center={[22.5, 79.5]} // Center of India
        zoom={5}
        style={{ height: '100%', width: '100%', background: '#0a0e27' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* Dark themed map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* City markers with pulsing effect */}
        {cityData.map((city, index) => (
          <CircleMarker
            key={index}
            center={[city.lat, city.lng]}
            radius={getMarkerSize(city.count)}
            pathOptions={{
              fillColor: getMarkerColor(city.count),
              fillOpacity: 0.8,
              color: '#ffffff',
              weight: 2,
              className: 'pulsing-marker'
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-base mb-1">{city.label}</div>
                <div className="text-gray-700">
                  <span className="font-semibold">{city.count}</span> devices
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Stats Overlay - Top Left */}
      <div className={`${isFullscreen ? 'fixed top-8 left-8' : 'absolute top-6 left-6'} z-[10000] flex flex-col gap-3`}>
        <div className="network-card">
          <div className="flex items-center gap-3">
            <div className="network-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div className="network-label">ACTIVE CITIES</div>
              <div className="network-value">{activeCities.length}</div>
            </div>
          </div>
        </div>
        
        <div className="network-card">
          <div className="flex items-center gap-3">
            <div className="network-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Activity size={20} />
            </div>
            <div>
              <div className="network-label">TOTAL DEVICES</div>
              <div className="network-value">{totalDevices.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="network-card">
          <div className="flex items-center gap-3">
            <div className="network-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="network-label">COVERAGE</div>
              <div className="network-value">Pan India</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend - Bottom Right */}
      <div className={`${isFullscreen ? 'fixed bottom-8 right-8' : 'absolute bottom-6 right-6'} z-[10000] network-card network-legend`}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <Zap className="text-cyan-400" size={22} />
          <div className="text-white font-bold text-base">Device Density</div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#ef4444', boxShadow: '0 0 20px #ef4444' }}></div>
            <span className="legend-label">500+ devices</span>
            <span className="legend-tag hot">🔥 HOT</span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#f97316', boxShadow: '0 0 20px #f97316' }}></div>
            <span className="legend-label">200-500</span>
            <span className="legend-tag active">⚡ ACTIVE</span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#f59e0b', boxShadow: '0 0 20px #f59e0b' }}></div>
            <span className="legend-label">100-200</span>
            <span className="legend-tag growing">✨ GROWING</span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#eab308', boxShadow: '0 0 20px #eab308' }}></div>
            <span className="legend-label">50-100</span>
            <span className="legend-tag moderate">📊 MODERATE</span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#84cc16', boxShadow: '0 0 20px #84cc16' }}></div>
            <span className="legend-label">1-50</span>
            <span className="legend-tag low">📍 LOW</span>
          </div>
        </div>
      </div>
    </div>
  )

  // FULLSCREEN VIEW
  if (isFullscreen) {
    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999999,
          margin: 0,
          padding: 0
        }}
        className="network-map-bg"
      >
        <MapView />
        
        <button
          onClick={toggleFullscreen}
          className="fixed top-6 right-6 z-[1000000] network-button-close"
        >
          <Minimize2 size={20} />
          <span>Exit Fullscreen</span>
        </button>
      </div>
    )
  }

  // NORMAL VIEW
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl network-map-bg">
      <MapView />
      
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] network-button"
      >
        <Maximize2 size={18} />
        <span>Expand Map</span>
      </button>
    </div>
  )
}
