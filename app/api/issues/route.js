import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET2_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fetch Issues-Realtime sheet data
    const issuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Issues-%20Realtime!A:Z?key=${API_KEY}`
    
    const issuesResponse = await fetch(issuesUrl)
    
    if (!issuesResponse.ok) {
      throw new Error(`Failed to fetch issues data: ${issuesResponse.status}`)
    }
    
    const issuesData = await issuesResponse.json()
    const rows = issuesData.values || []
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    // Find column indices
    const headers = rows[0]
    const subRequestIndex = headers.findIndex(h => 
      h.toLowerCase().includes('sub-request') || h.toLowerCase().includes('sub request') || h.toLowerCase().includes('issue')
    )
    const timestampRaisedIndex = headers.findIndex(h => 
      h.toLowerCase().includes('timestamp') && h.toLowerCase().includes('raised')
    )
    const timestampResolvedIndex = headers.findIndex(h => 
      h.toLowerCase().includes('timestamp') && h.toLowerCase().includes('resolved')
    )
    const clientIndex = headers.findIndex(h => h.toLowerCase().includes('client'))

    if (timestampRaisedIndex === -1 || clientIndex === -1) {
      return NextResponse.json({ error: 'Required columns not found' }, { status: 400 })
    }

    // Filter for "Historical Video Request" only
    const filteredRows = rows.slice(1).filter(row => {
      const issueType = row[subRequestIndex] || ''
      return issueType.toLowerCase().includes('historical video request')
    })

    // Process data
    const monthlyStats = {}
    const clientStats = {}
    const resolutionTimes = []
    let totalRequests = 0
    let totalDelivered = 0

    filteredRows.forEach(row => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = row[timestampResolvedIndex]
      const clientName = row[clientIndex] || 'Unknown'
      
      if (!timestampRaised) return

      totalRequests += 1

      // Parse raised timestamp
      const raisedDate = parseTimestamp(timestampRaised)
      if (!raisedDate) return

      const month = getMonthYear(raisedDate)
      
      // Monthly stats
      if (!monthlyStats[month]) {
        monthlyStats[month] = { 
          requests: 0, 
          delivered: 0, 
          resolutionTimes: []
        }
      }
      monthlyStats[month].requests += 1

      // Client stats
      if (!clientStats[clientName]) {
        clientStats[clientName] = { 
          requests: 0, 
          delivered: 0, 
          resolutionTimes: []
        }
      }
      clientStats[clientName].requests += 1

      // Calculate delivery time if video was delivered
      if (timestampResolved && timestampResolved.trim()) {
        const resolvedDate = parseTimestamp(timestampResolved)
        if (resolvedDate && resolvedDate > raisedDate) {
          const deliveryTime = (resolvedDate - raisedDate) / (1000 * 60 * 60) // hours
          
          if (deliveryTime >= 0) {
            totalDelivered += 1
            monthlyStats[month].delivered += 1
            monthlyStats[month].resolutionTimes.push(deliveryTime)
            clientStats[clientName].delivered += 1
            clientStats[clientName].resolutionTimes.push(deliveryTime)
            resolutionTimes.push(deliveryTime)
          }
        }
      }
    })

    // Calculate delivery time statistics
    const avgDeliveryTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0
    
    const fastestDeliveryTime = resolutionTimes.length > 0 ? Math.min(...resolutionTimes) : 0
    const slowestDeliveryTime = resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : 0
    const medianDeliveryTime = resolutionTimes.length > 0 
      ? calculateMedian(resolutionTimes) 
      : 0

    // Convert to arrays for frontend  
    const monthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => new Date(a.replace(' ', ' 1, ')) - new Date(b.replace(' ', ' 1, ')))
      .map(([month, data]) => ({
        month,
        requests: data.requests,
        delivered: data.delivered,
        deliveryRate: data.requests > 0 ? parseFloat(((data.delivered / data.requests) * 100).toFixed(1)) : 0,
        avgDeliveryTime: data.resolutionTimes.length > 0 
          ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
          : 0,
        fastestDelivery: data.resolutionTimes.length > 0 ? parseFloat(Math.min(...data.resolutionTimes).toFixed(2)) : 0,
        slowestDelivery: data.resolutionTimes.length > 0 ? parseFloat(Math.max(...data.resolutionTimes).toFixed(2)) : 0
      }))

    const clientBreakdown = Object.entries(clientStats)
      .filter(([, data]) => data.requests > 0)
      .sort((a, b) => b[1].requests - a[1].requests)
      .map(([client, data]) => ({
        client,
        requests: data.requests,
        delivered: data.delivered,
        deliveryRate: data.requests > 0 ? parseFloat(((data.delivered / data.requests) * 100).toFixed(1)) : 0,
        avgDeliveryTime: data.resolutionTimes.length > 0 
          ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
          : 0,
        fastestDelivery: data.resolutionTimes.length > 0 ? parseFloat(Math.min(...data.resolutionTimes).toFixed(2)) : 0,
        slowestDelivery: data.resolutionTimes.length > 0 ? parseFloat(Math.max(...data.resolutionTimes).toFixed(2)) : 0,
        medianDeliveryTime: data.resolutionTimes.length > 0 ? parseFloat(calculateMedian(data.resolutionTimes).toFixed(2)) : 0
      }))

    return NextResponse.json({
      monthlyData,
      clientBreakdown,
      totalRequests,
      totalDelivered,
      overallDeliveryRate: totalRequests > 0 ? parseFloat(((totalDelivered / totalRequests) * 100).toFixed(1)) : 0,
      avgDeliveryTime: parseFloat(avgDeliveryTime.toFixed(2)),
      fastestDeliveryTime: parseFloat(fastestDeliveryTime.toFixed(2)),
      slowestDeliveryTime: parseFloat(slowestDeliveryTime.toFixed(2)),
      medianDeliveryTime: parseFloat(medianDeliveryTime.toFixed(2))
    })

  } catch (error) {
    console.error('Error fetching historical video data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    )
  }
}

function parseTimestamp(timestampStr) {
  if (!timestampStr || !timestampStr.trim()) return null
  
  try {
    // Handle DD/MM/YYYY HH:mm:ss format
    const parts = timestampStr.split(' ')
    if (parts.length >= 2) {
      const datePart = parts[0]
      const timePart = parts[1]
      
      const dateParts = datePart.split('/')
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1 // JavaScript months are 0-indexed
        let year = parseInt(dateParts[2])
        
        // Handle 2-digit years
        if (year < 100) {
          year += 2000
        }
        
        const timeParts = timePart.split(':')
        const hour = parseInt(timeParts[0]) || 0
        const minute = parseInt(timeParts[1]) || 0
        const second = parseInt(timeParts[2]) || 0
        
        return new Date(year, month, day, hour, minute, second)
      }
    }
    
    // Fallback to standard Date parsing
    return new Date(timestampStr)
  } catch (e) {
    console.error('Error parsing timestamp:', timestampStr, e)
    return null
  }
}

function getMonthYear(date) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function calculateMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  return sorted.length % 2 !== 0 
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}
