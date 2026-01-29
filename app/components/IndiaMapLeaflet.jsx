// Install first: npm install leaflet react-leaflet

'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Maximize2, Minimize2, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Component to fit bounds
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

  // Indian cities with coordinates
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

  // Filter only active cities
  const activeCityData = Object.entries(cityCoordinates)
    .filter(([key]) => activeCities.includes(key))
    .map(([key, coords]) => ({
      ...coords,
      count: installationTrackerData.cityCount[key] || 0,
      key
    }))

  // IMPROVED COLORS - More vibrant and distinct
  const getColor = (count) => {
    if (count > 100) return '#8B5CF6' // Purple for very high
    if (count > 50) return '#06B6D4' // Cyan for high
    if (count > 20) return '#10B981' // Green for medium-high
    if (count > 10) return '#F59E0B' // Amber for medium
    if (count > 5) return '#3B82F6' // Blue for low-medium
    return '#EC4899' // Pink for low
  }

  // BIGGER RADIUS for better visibility
  const getRadius = (count) => {
    if (count > 200) return 35
    if (count > 100) return 30
    if (count > 50) return 26
    if (count > 20) return 22
    if (count > 10) return 18
    if (count > 5) return 14
    return 12
  }

  // Create custom DivIcon with count - IMPROVED DESIGN
  const createCustomIcon = (count, color) => {
    const radius = getRadius(count)
    const fontSize = radius > 20 ? '16px' : radius > 15 ? '13px' : '11px'
    const fontWeight = count > 50 ? '900' : '700'
    
    return L.divIcon({
      html: `
        <div style="
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          background: ${color};
          border: 4px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: ${fontWeight};
          font-size: ${fontSize};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 8px ${color}33;
          position: relative;
          z-index: ${1000 + count};
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          ${count}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [radius * 2, radius * 2],
      iconAnchor: [radius, radius]
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // FULLSCREEN OVERLAY
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-900">
        <div className="w-full h-full relative">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', background: '#0a0e27' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap'
            />
            <FitBounds cities={activeCityData} />
            {activeCityData.map((city) => (
              <Marker
                key={city.key}
                position={[city.lat, city.lng]}
                icon={createCustomIcon(city.count, getColor(city.count))}
              >
                <Popup>
                  <div className="text-center p-2">
                    <div className="font-bold text-lg mb-1">{city.label}</div>
                    <div className="text-sm text-gray-600">{city.count} devices</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Close fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 z-[10000] bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl transition-all flex items-center space-x-2 font-semibold"
          >
            <X size={24} />
            <span>Close</span>
          </button>
        </div>
      </div>
    )
  }

  // NORMAL VIEW
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%', background: '#0a0e27' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <FitBounds cities={activeCityData} />
        
        {activeCityData.map((city) => (
          <Marker
            key={city.key}
            position={[city.lat, city.lng]}
            icon={createCustomIcon(city.count, getColor(city.count))}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="font-bold text-lg mb-1">{city.label}</div>
                <div className="text-sm text-gray-600">{city.count} devices</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-lg shadow-lg transition-all flex items-center space-x-2 font-semibold"
        title="View Fullscreen"
      >
        <Maximize2 size={20} />
        <span className="text-sm">Expand</span>
      </button>
    </div>
  )
}
