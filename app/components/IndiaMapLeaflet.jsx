'use client'

import { useEffect, useState, useRef } from 'react'
import { Maximize2, Minimize2, MapPin, Activity, TrendingUp, Zap } from 'lucide-react'

export default function IndiaMapLeaflet({ installationTrackerData }) {
  const canvasRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const animationRef = useRef(null)

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

  useEffect(() => {
    if (!isMounted || !canvasRef.current || !installationTrackerData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

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

    // India border outline (detailed coordinates for better shape)
    const indiaBorder = [
      [68.2, 23.7], [68.5, 24.3], [69.0, 24.8], [69.5, 25.2], [70.0, 25.8],
      [70.5, 26.5], [71.0, 27.5], [71.5, 28.2], [72.0, 28.8], [72.5, 29.5],
      [73.0, 30.5], [73.5, 31.5], [74.0, 32.5], [74.5, 33.2], [75.0, 33.8],
      [75.5, 34.3], [76.0, 34.7], [76.5, 35.0], [77.0, 35.3], [77.5, 35.4],
      [78.0, 35.3], [78.5, 34.8], [79.0, 34.2], [79.5, 33.5], [80.0, 32.8],
      [80.5, 31.8], [81.0, 30.8], [81.5, 30.0], [82.0, 29.0], [82.5, 28.2],
      [83.0, 27.7], [83.5, 27.4], [84.0, 27.2], [84.5, 27.0], [85.0, 26.8],
      [85.5, 26.7], [86.0, 26.6], [86.5, 26.5], [87.0, 26.4], [87.5, 26.6],
      [88.0, 26.9], [88.2, 27.3], [88.3, 27.7], [88.2, 28.0], [88.1, 27.6],
      [88.0, 27.2], [88.0, 26.8], [88.1, 26.4], [88.3, 26.1], [88.7, 26.0],
      [89.2, 26.1], [89.7, 26.4], [90.2, 26.7], [90.6, 26.9], [91.0, 27.0],
      [91.4, 27.0], [91.8, 26.9], [92.2, 26.8], [92.6, 26.6], [93.0, 26.3],
      [93.4, 25.8], [93.7, 25.2], [94.0, 24.6], [94.2, 24.0], [94.4, 23.4],
      [94.6, 22.8], [94.9, 22.2], [95.2, 21.8], [95.6, 21.5], [96.0, 21.3],
      [96.4, 21.2], [96.8, 21.0], [97.2, 20.7], [97.4, 20.3], [97.5, 19.8],
      [97.5, 19.2], [97.4, 18.6], [97.5, 18.0], [97.7, 17.5], [98.0, 17.0],
      [98.3, 16.5], [98.6, 16.0], [98.9, 15.3], [99.0, 14.6], [99.0, 13.8],
      [98.8, 13.0], [98.5, 12.3], [98.2, 11.7], [97.8, 11.0], [97.4, 10.4],
      [96.9, 9.8], [96.4, 9.2], [95.8, 8.7], [95.2, 8.3], [94.6, 7.9],
      [94.0, 7.5], [93.5, 7.2], [93.0, 7.1], [92.5, 7.3], [92.0, 7.7],
      [91.5, 8.3], [91.0, 8.9], [90.5, 9.5], [90.0, 10.0], [89.5, 10.7],
      [89.0, 11.3], [88.5, 11.9], [88.0, 12.5], [87.5, 13.0], [87.0, 13.5],
      [86.5, 13.9], [86.0, 14.3], [85.5, 14.7], [85.0, 15.0], [84.5, 15.4],
      [84.0, 15.8], [83.5, 16.2], [83.0, 16.7], [82.5, 17.2], [82.0, 17.6],
      [81.5, 18.0], [81.0, 18.3], [80.5, 18.5], [80.0, 18.7], [79.5, 18.9],
      [79.0, 19.0], [78.5, 19.1], [78.0, 19.2], [77.5, 19.3], [77.0, 19.3],
      [76.5, 19.3], [76.0, 19.3], [75.5, 19.2], [75.0, 19.1], [74.5, 19.0],
      [74.0, 18.9], [73.5, 18.9], [73.0, 19.0], [72.5, 19.2], [72.0, 19.5],
      [71.6, 19.9], [71.2, 20.3], [70.9, 20.7], [70.6, 21.2], [70.4, 21.7],
      [70.2, 22.2], [70.0, 22.7], [69.8, 23.1], [69.5, 23.5], [69.2, 23.7],
      [68.8, 23.8], [68.5, 23.8], [68.2, 23.7]
    ]

    // Convert lat/lng to canvas coordinates
    const latRange = [6, 36]
    const lngRange = [68, 99]
    
    const project = (lat, lng) => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio
      const x = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * width * 0.75 + width * 0.125
      const y = height - ((lat - latRange[0]) / (latRange[1] - latRange[0])) * height * 0.8 - height * 0.1
      return { x, y }
    }

    // Get active cities
    const activeCities = Object.keys(installationTrackerData.cityCount || {})
    const cityData = activeCities.map(key => {
      const city = cityCoordinates[key]
      if (!city) return null
      const { x, y } = project(city.lat, city.lng)
      return {
        ...city,
        x, y,
        count: installationTrackerData.cityCount[key] || 0,
        key
      }
    }).filter(Boolean)

    // Animation variables
    let frame = 0

    // Create connection lines between nearby cities
    const connections = []
    for (let i = 0; i < cityData.length; i++) {
      for (let j = i + 1; j < cityData.length; j++) {
        const dx = cityData[i].x - cityData[j].x
        const dy = cityData[i].y - cityData[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 120) {
          connections.push({ from: cityData[i], to: cityData[j], distance })
        }
      }
    }

    // Animation loop
    const animate = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio
      
      // Clear canvas with dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#0a0e27')
      gradient.addColorStop(0.3, '#151935')
      gradient.addColorStop(0.6, '#1a1e3e')
      gradient.addColorStop(1, '#0f1120')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Add animated stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      for (let i = 0; i < 150; i++) {
        const twinkle = Math.sin(frame * 0.02 + i) * 0.3 + 0.7
        const x = (i * 127) % width
        const y = (i * 83) % height
        ctx.globalAlpha = twinkle * 0.5
        ctx.fillRect(x, y, 1.5, 1.5)
      }
      ctx.globalAlpha = 1

      // Draw India border with multiple layers for better visibility
      
      // Layer 1: Outer glow (strongest)
      ctx.shadowBlur = 30
      ctx.shadowColor = 'rgba(59, 130, 246, 1)'
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
      ctx.lineWidth = 6
      ctx.beginPath()
      indiaBorder.forEach((point, i) => {
        const { x, y } = project(point[0], point[1])
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.stroke()
      
      // Layer 2: Medium glow
      ctx.shadowBlur = 20
      ctx.shadowColor = 'rgba(59, 130, 246, 0.9)'
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.lineWidth = 4
      ctx.beginPath()
      indiaBorder.forEach((point, i) => {
        const { x, y } = project(point[0], point[1])
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.stroke()
      
      // Layer 3: Main line (brightest)
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(59, 130, 246, 1)'
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      indiaBorder.forEach((point, i) => {
        const { x, y } = project(point[0], point[1])
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.stroke()
      
      // Layer 4: Inner fill (very subtle)
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
      ctx.beginPath()
      indiaBorder.forEach((point, i) => {
        const { x, y } = project(point[0], point[1])
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fill()
      
      ctx.shadowBlur = 0

      // Draw state boundaries (subtle lines for better geography visualization)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)'
      ctx.lineWidth = 1
      
      // Major state boundaries (simplified)
      const stateBoundaries = [
        // Rajasthan-Gujarat border
        [[70.5, 21.5], [71.0, 23.0], [71.5, 24.5], [72.0, 25.5]],
        // Gujarat-Maharashtra border
        [[72.5, 20.0], [73.5, 21.0], [74.0, 21.5]],
        // Maharashtra-Karnataka border
        [[73.5, 15.5], [74.5, 16.0], [76.0, 16.5], [77.5, 17.5]],
        // Karnataka-Tamil Nadu border
        [[76.5, 12.0], [77.5, 11.5], [78.0, 11.0], [78.5, 10.5]],
        // Odisha-West Bengal border
        [[85.5, 21.0], [86.0, 21.5], [87.0, 22.5], [87.5, 23.5]],
        // Uttar Pradesh-Madhya Pradesh border
        [[78.0, 24.5], [79.5, 24.0], [81.0, 24.5], [82.5, 24.5]],
        // Bihar-Jharkhand border
        [[84.0, 24.0], [85.5, 23.5], [87.0, 24.0]],
      ]
      
      stateBoundaries.forEach(boundary => {
        ctx.beginPath()
        boundary.forEach((point, i) => {
          const { x, y } = project(point[0], point[1])
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })

      // Draw connection lines with animation
      connections.forEach((conn, i) => {
        const flowProgress = (frame * 0.01 + i * 0.3) % 1
        const alpha = 0.15 + Math.sin(frame * 0.03 + conn.distance) * 0.1
        
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
        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'
        ctx.fill()
      })

      // Draw glowing pings for each city
      cityData.forEach((city, index) => {
        const pulsePhase = frame * 0.04 + index * 0.4
        const pulse = Math.sin(pulsePhase) * 0.3 + 0.7
        
        // Determine color and size based on device count
        let color, size
        if (city.count > 500) {
          color = { r: 239, g: 68, b: 68, name: 'red' }
          size = 14
        } else if (city.count > 200) {
          color = { r: 249, g: 115, b: 22, name: 'orange' }
          size = 11
        } else if (city.count > 100) {
          color = { r: 245, g: 158, b: 11, name: 'amber' }
          size = 9
        } else if (city.count > 50) {
          color = { r: 234, g: 179, b: 8, name: 'yellow' }
          size = 7
        } else {
          color = { r: 132, g: 204, b: 22, name: 'green' }
          size = 5
        }

        // Outer glow (large)
        const outerGlow = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, size * 5 * pulse)
        outerGlow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`)
        outerGlow.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`)
        outerGlow.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`)
        outerGlow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
        ctx.fillStyle = outerGlow
        ctx.fillRect(city.x - size * 5 * pulse, city.y - size * 5 * pulse, size * 10 * pulse, size * 10 * pulse)

        // Middle ring (animated)
        ctx.beginPath()
        ctx.arc(city.x, city.y, size * 2.5 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`
        ctx.fill()

        // Inner glow
        ctx.beginPath()
        ctx.arc(city.x, city.y, size * 1.5 * pulse, 0, Math.PI * 2)
        const innerGradient = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, size * 1.5 * pulse)
        innerGradient.addColorStop(0, `rgba(255, 255, 255, 0.9)`)
        innerGradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`)
        innerGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`)
        ctx.fillStyle = innerGradient
        ctx.fill()

        // Core dot (bright white center)
        ctx.beginPath()
        ctx.arc(city.x, city.y, size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.shadowBlur = 15
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
        ctx.fill()
        ctx.shadowBlur = 0

        // Ring animation (expanding circle)
        if (pulse > 0.9) {
          const ringSize = size * 3 * (pulse - 0.9) * 10
          ctx.beginPath()
          ctx.arc(city.x, city.y, ringSize, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.5 * (1 - (pulse - 0.9) * 10)})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })

      frame++
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isMounted, installationTrackerData])

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

  const activeCities = Object.keys(installationTrackerData.cityCount)
  const totalDevices = Object.values(installationTrackerData.cityCount).reduce((a, b) => a + b, 0)

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const MapView = () => (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

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
