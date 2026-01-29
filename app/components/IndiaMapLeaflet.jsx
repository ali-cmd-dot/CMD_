'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Maximize2, Minimize2, MapPin, Activity, Zap, TrendingUp } from 'lucide-react'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Animated Ping Marker Component
function AnimatedPingMarker({ position, count, label }) {
  const [L, setL] = useState(null)

  useEffect(() => {
    import('leaflet').then((leaflet) => setL(leaflet.default))
  }, [])

  if (!L) return null

  // Determine size and color based on count
  const getMarkerSize = (count) => {
    if (count > 500) return 28
    if (count > 200) return 24
    if (count > 100) return 20
    if (count > 50) return 16
    return 12
  }

  const getMarkerColor = (count) => {
    if (count > 500) return '#ef4444' // red
    if (count > 200) return '#f97316' // orange
    if (count > 100) return '#f59e0b' // amber
    if (count > 50) return '#eab308' // yellow
    return '#84cc16' // lime
  }

  const size = getMarkerSize(count)
  const color = getMarkerColor(count)

  const icon = L.divIcon({
    className: 'custom-ping-marker',
    html: `
      <div class="ping-wrapper">
        <div class="ping-pulse" style="background: ${color}"></div>
        <div class="ping-pulse ping-pulse-2" style="background: ${color}"></div>
        <div class="ping-core" style="background: ${color}; width: ${size}px; height: ${size}px; box-shadow: 0 0 ${size * 2}px ${color}"></div>
      </div>
    `,
    iconSize: [size * 3, size * 3],
    iconAnchor: [size * 1.5, size * 1.5]
  })

  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-popup">
        <div className="popup-content">
          <div className="popup-header">
            <MapPin className="popup-icon" />
            <h3 className="popup-title">{label}</h3>
          </div>
          <div className="popup-stats">
            <div className="stat-item">
              <Activity size={16} />
              <span>{count} devices</span>
            </div>
            <div className="stat-badge">
              {count > 500 ? '🔥 High Density' : count > 200 ? '⚡ Active' : count > 100 ? '✨ Growing' : '📍 Active'}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

// Heatmap Canvas Overlay
function HeatmapCanvas({ data }) {
  const [L, setL] = useState(null)
  const [map, setMapInstance] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    import('leaflet').then((leaflet) => setL(leaflet.default))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mapInstance = window.mapInstance
      if (mapInstance) {
        setMapInstance(mapInstance)
      }
    }
  }, [])

  useEffect(() => {
    if (!map || !L || !data || data.length === 0) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { alpha: true })
    
    const updateHeatmap = () => {
      const size = map.getSize()
      canvas.width = size.x
      canvas.height = size.y
      canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 400;
        mix-blend-mode: screen;
      `

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw heatmap with better gradients
      data.forEach(point => {
        const latLng = L.latLng(point.lat, point.lng)
        if (!map.getBounds().contains(latLng)) return
        
        const pixelPoint = map.latLngToContainerPoint(latLng)
        const intensity = point.count
        const baseRadius = Math.sqrt(intensity) * 10
        const zoom = map.getZoom()
        const radius = baseRadius * Math.pow(1.2, zoom - 5)
        
        // Multiple layers for better glow
        for (let i = 3; i >= 1; i--) {
          const layerRadius = radius * i * 0.5
          const gradient = ctx.createRadialGradient(
            pixelPoint.x, pixelPoint.y, 0,
            pixelPoint.x, pixelPoint.y, layerRadius
          )
          
          const alpha = 0.6 / i
          
          if (intensity > 500) {
            gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
            gradient.addColorStop(0.4, `rgba(249, 115, 22, ${alpha * 0.7})`)
            gradient.addColorStop(0.7, `rgba(251, 146, 60, ${alpha * 0.4})`)
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
          } else if (intensity > 200) {
            gradient.addColorStop(0, `rgba(249, 115, 22, ${alpha})`)
            gradient.addColorStop(0.4, `rgba(251, 146, 60, ${alpha * 0.7})`)
            gradient.addColorStop(0.7, `rgba(252, 211, 77, ${alpha * 0.4})`)
            gradient.addColorStop(1, 'rgba(249, 115, 22, 0)')
          } else if (intensity > 100) {
            gradient.addColorStop(0, `rgba(245, 158, 11, ${alpha})`)
            gradient.addColorStop(0.4, `rgba(252, 211, 77, ${alpha * 0.7})`)
            gradient.addColorStop(0.7, `rgba(253, 224, 71, ${alpha * 0.4})`)
            gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
          } else if (intensity > 50) {
            gradient.addColorStop(0, `rgba(234, 179, 8, ${alpha})`)
            gradient.addColorStop(0.4, `rgba(253, 224, 71, ${alpha * 0.7})`)
            gradient.addColorStop(0.7, `rgba(190, 242, 100, ${alpha * 0.4})`)
            gradient.addColorStop(1, 'rgba(234, 179, 8, 0)')
          } else {
            gradient.addColorStop(0, `rgba(132, 204, 22, ${alpha})`)
            gradient.addColorStop(0.4, `rgba(190, 242, 100, ${alpha * 0.7})`)
            gradient.addColorStop(0.7, `rgba(217, 249, 157, ${alpha * 0.4})`)
            gradient.addColorStop(1, 'rgba(132, 204, 22, 0)')
          }
          
          ctx.fillStyle = gradient
          ctx.fillRect(
            pixelPoint.x - layerRadius,
            pixelPoint.y - layerRadius,
            layerRadius * 2,
            layerRadius * 2
          )
        }
      })
    }

    updateHeatmap()

    const mapPane = map.getPane('overlayPane')
    if (mapPane && !canvasRef.current) {
      mapPane.appendChild(canvas)
      canvasRef.current = canvas
    }

    map.on('move zoom', updateHeatmap)

    return () => {
      map.off('move zoom', updateHeatmap)
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current)
        canvasRef.current = null
      }
    }
  }, [map, L, data])

  return null
}

// Map Controller
function MapController({ data }) {
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMap = setInterval(() => {
        const mapEl = document.querySelector('.leaflet-container')
        if (mapEl && mapEl._leaflet_map) {
          setMap(mapEl._leaflet_map)
          window.mapInstance = mapEl._leaflet_map
          
          if (data && data.length > 0) {
            const bounds = data.map(d => [d.lat, d.lng])
            mapEl._leaflet_map.fitBounds(bounds, { padding: [80, 80] })
          }
          
          clearInterval(checkMap)
        }
      }, 100)

      return () => clearInterval(checkMap)
    }
  }, [data])

  return <HeatmapCanvas data={data} />
}

export default function IndiaMapLeaflet({ installationTrackerData }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredCity, setHoveredCity] = useState(null)

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
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl">
        <div className="text-center space-y-4">
          <div className="loading-spinner"></div>
          <div className="text-white text-lg font-medium">Loading Installation Map...</div>
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

  const heatmapData = Object.entries(cityCoordinates)
    .filter(([key]) => activeCities.includes(key))
    .map(([key, coords]) => ({
      ...coords,
      count: installationTrackerData.cityCount[key] || 0,
      key
    }))

  const totalDevices = Object.values(installationTrackerData.cityCount).reduce((a, b) => a + b, 0)
  const activeCitiesCount = activeCities.length

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const MapView = () => (
    <>
      <MapContainer
        center={[22.5, 79]}
        zoom={5}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
        }}
        zoomControl={true}
        preferCanvas={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
          opacity={0.6}
        />
        
        <MapController data={heatmapData} />
        
        {heatmapData.map((point) => (
          <AnimatedPingMarker
            key={point.key}
            position={[point.lat, point.lng]}
            count={point.count}
            label={point.label}
          />
        ))}
      </MapContainer>

      {/* Stats Overlay - Top Left */}
      <div className={`${isFullscreen ? 'fixed top-8 left-8' : 'absolute top-6 left-6'} z-[10000] flex flex-col gap-3`}>
        <div className="glass-card">
          <div className="flex items-center gap-3">
            <div className="stat-icon bg-gradient-to-br from-red-500 to-orange-500">
              <MapPin size={20} />
            </div>
            <div>
              <div className="stat-label">Active Cities</div>
              <div className="stat-value">{activeCitiesCount}</div>
            </div>
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center gap-3">
            <div className="stat-icon bg-gradient-to-br from-blue-500 to-cyan-500">
              <Activity size={20} />
            </div>
            <div>
              <div className="stat-label">Total Devices</div>
              <div className="stat-value">{totalDevices.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center gap-3">
            <div className="stat-icon bg-gradient-to-br from-purple-500 to-pink-500">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="stat-label">Coverage</div>
              <div className="stat-value">Pan India</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend - Bottom Right */}
      <div className={`${isFullscreen ? 'fixed bottom-8 right-8' : 'absolute bottom-6 right-6'} z-[10000] glass-card legend-card`}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <Zap className="text-yellow-400" size={22} />
          <div className="text-white font-bold text-base">Device Density</div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}></div>
            <span className="legend-text">500+ devices</span>
            <span className="legend-badge hot">🔥 Hot</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}></div>
            <span className="legend-text">200-500</span>
            <span className="legend-badge active">⚡ Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'linear-gradient(135deg, #f59e0b, #fcd34d)' }}></div>
            <span className="legend-text">100-200</span>
            <span className="legend-badge growing">✨ Growing</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'linear-gradient(135deg, #eab308, #fde047)' }}></div>
            <span className="legend-text">50-100</span>
            <span className="legend-badge moderate">📊 Moderate</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'linear-gradient(135deg, #84cc16, #bef264)' }}></div>
            <span className="legend-text">1-50</span>
            <span className="legend-badge low">📍 Low</span>
          </div>
        </div>
      </div>
    </>
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
          padding: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
        }}
      >
        <MapView />
        
        <button
          onClick={toggleFullscreen}
          className="fixed top-6 right-6 z-[1000000] glass-button-close"
        >
          <Minimize2 size={20} />
          <span>Exit Fullscreen</span>
        </button>
      </div>
    )
  }

  // NORMAL VIEW
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
      <MapView />
      
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] glass-button"
      >
        <Maximize2 size={18} />
        <span>Expand Map</span>
      </button>
    </div>
  )
}
