'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { Maximize2, Minimize2, MapPin, Activity, TrendingUp, Zap } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Canvas Overlay Component
function CanvasOverlay({ cityData }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const map = useMap()

  useEffect(() => {
    if (!canvasRef.current || !cityData.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const container = map.getContainer()

    // Set canvas size to match map
    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }
    updateSize()

    // Convert lat/lng to canvas pixel coordinates
    const latLngToPixel = (lat, lng) => {
      const point = map.latLngToContainerPoint([lat, lng])
      return { x: point.x, y: point.y }
    }

    // Get city positions in pixels
    let cityPositions = []
    const updateCityPositions = () => {
      cityPositions = cityData.map(city => ({
        ...city,
        ...latLngToPixel(city.lat, city.lng)
      }))
    }
    updateCityPositions()

    // Create connection lines between nearby cities
    const connections = []
    const createConnections = () => {
      connections.length = 0
      for (let i = 0; i < cityPositions.length; i++) {
        for (let j = i + 1; j < cityPositions.length; j++) {
          const dx = cityPositions[i].x - cityPositions[j].x
          const dy = cityPositions[i].y - cityPositions[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 200) {
            connections.push({ 
              from: cityPositions[i], 
              to: cityPositions[j], 
              distance 
            })
          }
        }
      }
    }
    createConnections()

    // Animation variables
    let frame = 0

    // Animation loop
    const animate = () => {
      const width = canvas.width
      const height = canvas.height
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw animated stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      for (let i = 0; i < 200; i++) {
        const twinkle = Math.sin(frame * 0.02 + i) * 0.3 + 0.7
        const x = (i * 127) % width
        const y = (i * 83) % height
        ctx.globalAlpha = twinkle * 0.4
        ctx.fillRect(x, y, 1.5, 1.5)
      }
      ctx.globalAlpha = 1

      // Draw connection lines with animation
      connections.forEach((conn, i) => {
        const flowProgress = (frame * 0.01 + i * 0.3) % 1
        const alpha = 0.2 + Math.sin(frame * 0.03 + conn.distance) * 0.1
        
        // Line
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(conn.from.x, conn.from.y)
        ctx.lineTo(conn.to.x, conn.to.y)
        ctx.stroke()

        // Animated dot along the line
        const dotX = conn.from.x + (conn.to.x - conn.from.x) * flowProgress
        const dotY = conn.from.y + (conn.to.y - conn.from.y) * flowProgress
        ctx.beginPath()
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'
        ctx.fill()
      })

      // Draw glowing pings for each city
      cityPositions.forEach((city, index) => {
        const pulsePhase = frame * 0.04 + index * 0.4
        const pulse = Math.sin(pulsePhase) * 0.3 + 0.7
        
        // Determine color and size based on device count
        let color, size
        if (city.count > 500) {
          color = { r: 239, g: 68, b: 68 }
          size = 13
        } else if (city.count > 200) {
          color = { r: 249, g: 115, b: 22 }
          size = 11
        } else if (city.count > 100) {
          color = { r: 245, g: 158, b: 11 }
          size = 8
        } else if (city.count > 50) {
          color = { r: 234, g: 179, b: 8 }
          size = 6
        } else {
          color = { r: 132, g: 204, b: 22 }
          size = 4
        }

        // Outer glow
        const outerGlow = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, size * 6 * pulse)
        outerGlow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`)
        outerGlow.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`)
        outerGlow.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`)
        outerGlow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
        ctx.fillStyle = outerGlow
        ctx.fillRect(city.x - size * 6 * pulse, city.y - size * 6 * pulse, size * 12 * pulse, size * 12 * pulse)

        // Middle ring
        ctx.beginPath()
        ctx.arc(city.x, city.y, size * 2.5 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`
        ctx.fill()

        // Inner glow
        ctx.beginPath()
        ctx.arc(city.x, city.y, size * 1.5 * pulse, 0, Math.PI * 2)
        const innerGradient = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, size * 1.5 * pulse)
        innerGradient.addColorStop(0, `rgba(255, 255, 255, 1)`)
        innerGradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`)
        innerGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`)
        ctx.fillStyle = innerGradient
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(city.x, city.y, size * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.shadowBlur = 20
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
        ctx.fill()
        ctx.shadowBlur = 0

        // Ring animation
        if (pulse > 0.9) {
          const ringSize = size * 4 * (pulse - 0.9) * 10
          ctx.beginPath()
          ctx.arc(city.x, city.y, ringSize, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.6 * (1 - (pulse - 0.9) * 10)})`
          ctx.lineWidth = 3
          ctx.stroke()
        }
      })

      frame++
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Update on map move/zoom
    const handleMapUpdate = () => {
      updateSize()
      updateCityPositions()
      createConnections()
    }

    map.on('move', handleMapUpdate)
    map.on('zoom', handleMapUpdate)
    map.on('resize', handleMapUpdate)
    window.addEventListener('resize', handleMapUpdate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      map.off('move', handleMapUpdate)
      map.off('zoom', handleMapUpdate)
      map.off('resize', handleMapUpdate)
      window.removeEventListener('resize', handleMapUpdate)
    }
  }, [cityData, map])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 400
      }}
    />
  )
}

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

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const MapView = () => (
    <div className="relative w-full h-full">
      {/* Leaflet Map with Dark Theme */}
      <MapContainer
        center={[22.5, 79.5]}
        zoom={5}
        style={{ height: '100%', width: '100%', background: '#0a0e27' }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Dark themed map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Canvas overlay with animations */}
        <CanvasOverlay cityData={cityData} />

        {/* Invisible markers for click interaction */}
        {cityData.map((city, index) => (
          <CircleMarker
            key={index}
            center={[city.lat, city.lng]}
            radius={15}
            pathOptions={{
              fillColor: 'transparent',
              fillOpacity: 0,
              color: 'transparent',
              weight: 0
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
            <span className="legend-tag hot"></span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#f97316', boxShadow: '0 0 20px #f97316' }}></div>
            <span className="legend-label">200-500</span>
            <span className="legend-tag active"></span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#f59e0b', boxShadow: '0 0 20px #f59e0b' }}></div>
            <span className="legend-label">100-200</span>
            <span className="legend-tag growing"></span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#eab308', boxShadow: '0 0 20px #eab308' }}></div>
            <span className="legend-label">50-100</span>
            <span className="legend-tag moderate"></span>
          </div>
          <div className="legend-row">
            <div className="legend-ping" style={{ background: '#84cc16', boxShadow: '0 0 20px #84cc16' }}></div>
            <span className="legend-label">1-50</span>
            <span className="legend-tag low"></span>
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
