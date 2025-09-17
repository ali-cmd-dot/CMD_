import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET1_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fetch Misalignment_Tracking sheet data
    const misalignmentUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Misalignment_Tracking!A:Z?key=${API_KEY}`
    
    const misalignmentResponse = await fetch(misalignmentUrl)
    
    if (!misalignmentResponse.ok) {
      throw new Error(`Failed to fetch misalignment data: ${misalignmentResponse.status}`)
    }
    
    const misalignmentData = await misalignmentResponse.json()
    const rows = misalignmentData.values || []
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    // Find column indices
    const headers = rows[0]
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'))
    const clientIndex = headers.findIndex(h => h.toLowerCase().includes('client'))
    const vehicleIndex = headers.findIndex(h => h.toLowerCase().includes('vehicle'))

    if (dateIndex === -1 || clientIndex === -1 || vehicleIndex === -1) {
      return NextResponse.json({ error: 'Required columns not found' }, { status: 400 })
    }

    // Process raw data - sort by date first
    const dailyData = []
    
    rows.slice(1).forEach((row, index) => {
      const date = row[dateIndex]
      const clientName = row[clientIndex]
      const vehicleNumbers = row[vehicleIndex]
      
      if (!date || !clientName || !vehicleNumbers) return

      // Parse vehicles (comma separated)
      const vehicles = vehicleNumbers.split(',').map(v => v.trim()).filter(v => v)
      
      dailyData.push({
        date: date,
        client: clientName,
        vehicles: vehicles,
        rowIndex: index
      })
    })

    // Sort by date
    dailyData.sort((a, b) => {
      const dateA = parseDate(a.date)
      const dateB = parseDate(b.date)
      return dateA - dateB
    })

    // Group by date to find unique dates
    const dateGroups = {}
    dailyData.forEach(item => {
      if (!dateGroups[item.date]) {
        dateGroups[item.date] = []
      }
      dateGroups[item.date].push(item)
    })

    const uniqueDates = Object.keys(dateGroups).sort((a, b) => parseDate(a) - parseDate(b))

    // Calculate daily raised and rectified
    const monthlyStats = {}
    const clientStats = {}
    let totalRaised = 0
    let totalRectified = 0

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i]
      const currentDayData = dateGroups[currentDate]
      
      // Get all vehicles for current date
      const currentVehicles = new Set()
      const currentClients = new Set()
      
      currentDayData.forEach(item => {
        item.vehicles.forEach(vehicle => {
          currentVehicles.add(`${item.client}:${vehicle}`)
        })
        currentClients.add(item.client)
      })
      
      const raisedCount = currentVehicles.size
      totalRaised += raisedCount
      
      // Calculate rectified by comparing with next day
      let rectifiedCount = 0
      if (i < uniqueDates.length - 1) {
        const nextDate = uniqueDates[i + 1]
        const nextDayData = dateGroups[nextDate]
        
        const nextVehicles = new Set()
        nextDayData.forEach(item => {
          item.vehicles.forEach(vehicle => {
            nextVehicles.add(`${item.client}:${vehicle}`)
          })
        })
        
        // Count vehicles that were present today but not tomorrow (rectified)
        currentVehicles.forEach(vehicle => {
          if (!nextVehicles.has(vehicle)) {
            rectifiedCount++
          }
        })
      }
      
      totalRectified += rectifiedCount
      
      // Monthly aggregation
      const month = getMonthYear(currentDate)
      if (!monthlyStats[month]) {
        monthlyStats[month] = { 
          raised: 0, 
          rectified: 0, 
          clients: new Set(),
          vehicleRepeats: {}
        }
      }
      
      monthlyStats[month].raised += raisedCount
      monthlyStats[month].rectified += rectifiedCount
      monthlyStats[month].clients = new Set([...monthlyStats[month].clients, ...currentClients])

      // Track vehicle repeats per client
      currentDayData.forEach(item => {
        item.vehicles.forEach(vehicle => {
          const key = `${item.client}-${vehicle}`
          if (!monthlyStats[month].vehicleRepeats[key]) {
            monthlyStats[month].vehicleRepeats[key] = 0
          }
          monthlyStats[month].vehicleRepeats[key]++
        })
      })

      // Client stats
      currentDayData.forEach(item => {
        if (!clientStats[item.client]) {
          clientStats[item.client] = { 
            raised: 0, 
            rectified: 0,
            vehicleRepeats: {}
          }
        }
        
        const clientVehicleCount = item.vehicles.length
        clientStats[item.client].raised += clientVehicleCount
        
        // Track client vehicle repeats
        item.vehicles.forEach(vehicle => {
          if (!clientStats[item.client].vehicleRepeats[vehicle]) {
            clientStats[item.client].vehicleRepeats[vehicle] = 0
          }
          clientStats[item.client].vehicleRepeats[vehicle]++
        })
      })
    }

    // Update client rectified counts
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i]
      const nextDate = uniqueDates[i + 1]
      
      const currentDayData = dateGroups[currentDate]
      const nextDayData = dateGroups[nextDate]
      
      const currentClientVehicles = {}
      const nextClientVehicles = {}
      
      // Group by client
      currentDayData.forEach(item => {
        if (!currentClientVehicles[item.client]) {
          currentClientVehicles[item.client] = new Set()
        }
        item.vehicles.forEach(v => currentClientVehicles[item.client].add(v))
      })
      
      nextDayData.forEach(item => {
        if (!nextClientVehicles[item.client]) {
          nextClientVehicles[item.client] = new Set()
        }
        item.vehicles.forEach(v => nextClientVehicles[item.client].add(v))
      })
      
      // Calculate rectified per client
      Object.keys(currentClientVehicles).forEach(client => {
        const currentVehicles = currentClientVehicles[client]
        const nextVehicles = nextClientVehicles[client] || new Set()
        
        let clientRectified = 0
        currentVehicles.forEach(vehicle => {
          if (!nextVehicles.has(vehicle)) {
            clientRectified++
          }
        })
        
        if (clientStats[client]) {
          clientStats[client].rectified += clientRectified
        }
      })
    }

    // Convert to arrays for frontend
    const monthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => new Date(a.replace(' ', ' 1, ')) - new Date(b.replace(' ', ' 1, ')))
      .map(([month, data]) => ({
        month,
        raised: data.raised,
        rectified: data.rectified,
        clients: data.clients.size,
        vehicleRepeats: Object.entries(data.vehicleRepeats).map(([key, count]) => ({
          vehicle: key.split('-')[1],
          client: key.split('-')[0],
          repeats: count
        })).sort((a, b) => b.repeats - a.repeats).slice(0, 10) // Top 10 most repeated
      }))

    const avgRaisedPerMonth = monthlyData.length > 0 ? totalRaised / monthlyData.length : 0
    const avgRectifiedPerMonth = monthlyData.length > 0 ? totalRectified / monthlyData.length : 0
    const uniqueClientsTotal = Object.keys(clientStats).length

    // Client breakdown
    const clientBreakdown = Object.entries(clientStats)
      .sort(([,a], [,b]) => b.raised - a.raised)
      .map(([client, data]) => ({
        client,
        raised: data.raised,
        rectified: data.rectified,
        percentage: totalRaised > 0 ? parseFloat(((data.raised / totalRaised) * 100).toFixed(1)) : 0,
        rectificationRate: data.raised > 0 ? parseFloat(((data.rectified / data.raised) * 100).toFixed(1)) : 0,
        topVehicles: Object.entries(data.vehicleRepeats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([vehicle, count]) => ({ vehicle, repeats: count }))
      }))

    return NextResponse.json({
      monthlyData,
      clientBreakdown,
      totalRaised,
      totalRectified,
      avgRaisedPerMonth: parseFloat(avgRaisedPerMonth.toFixed(1)),
      avgRectifiedPerMonth: parseFloat(avgRectifiedPerMonth.toFixed(1)),
      uniqueClients: uniqueClientsTotal,
      rectificationRate: totalRaised > 0 ? parseFloat(((totalRectified / totalRaised) * 100).toFixed(1)) : 0
    })

  } catch (error) {
    console.error('Error fetching misalignment data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    )
  }
}

function parseDate(dateStr) {
  // Handle DD-MM-YYYY or DD-MM-YY format
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1 // JavaScript months are 0-indexed
    let year = parseInt(parts[2])
    
    // Handle 2-digit years
    if (year < 100) {
      year += 2000
    }
    
    return new Date(year, month, day)
  }
  return new Date(dateStr)
}

function getMonthYear(dateStr) {
  const date = parseDate(dateStr)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}
