import { NextResponse } from 'next/server'

// CRITICAL: Disable caching for live data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET2_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

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
    let timestampRaisedIndex = -1
    let timestampResolvedIndex = -1
    let clientIndex = -1
    let issueIndex = -1
    let resolvedYNIndex = -1
    let issueDetailsIndex = -1
    let vehicleNumberIndex = -1
    let raisedByIndex = -1
    let currentStatusIndex = -1

    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      if (h === 'Timestamp Issues Raised') timestampRaisedIndex = index
      if (h === 'Timestamp Issues Resolved') timestampResolvedIndex = index
      if (h === 'Clients' || h === 'Client' || h === 'clients') clientIndex = index
      if (h === 'Sub-request' || h === 'Issue' || h === 'issue') issueIndex = index
      if (h === 'Resolved Y/N' || h === 'Resolved Y/N ' || h.toLowerCase().includes('resolved y')) resolvedYNIndex = index
      // New columns
      if (h === 'Issue Details' || h.toLowerCase().includes('issue detail')) issueDetailsIndex = index
      if (h === 'Vehicle Number' || h.toLowerCase().includes('vehicle number')) vehicleNumberIndex = index
      if (h === 'Raised by' || h === 'Raised By' || h.toLowerCase().includes('raised by')) raisedByIndex = index
      if (h === 'Date - Current Status' || h.toLowerCase().includes('current status') || h.toLowerCase().includes('date - current')) currentStatusIndex = index
    })

    if (timestampRaisedIndex === -1 || clientIndex === -1 || issueIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        headers: headers
      }, { status: 400 })
    }

    // Filter for EXACT "Customer request for video" in "Sub-request" column
    const filteredRows = rows.slice(1).filter(row => {
      const issueType = (row[issueIndex] || '').toString().trim()
      return issueType === 'Customer request for video'
    })

    if (filteredRows.length === 0) {
      return NextResponse.json({
        error: 'No "Customer request for video" found',
        totalDataRows: rows.length - 1,
        headers: headers
      }, { status: 404 })
    }

    // Process Customer request for video data
    const monthlyStats = {}
    const clientStats = {}
    const resolutionTimes = []
    let totalRequests = 0
    let totalDelivered = 0

    // Store all individual rows for table display
    const allRows = []

    filteredRows.forEach((row, rowIndex) => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = timestampResolvedIndex >= 0 ? row[timestampResolvedIndex] : null
      const clientName = (row[clientIndex] || 'Unknown').toString().trim()
      const resolvedYN = resolvedYNIndex >= 0 ? (row[resolvedYNIndex] || '').toString().trim().toLowerCase() : ''
      const issueDetails = issueDetailsIndex >= 0 ? (row[issueDetailsIndex] || '').toString().trim() : ''
      const vehicleNumber = vehicleNumberIndex >= 0 ? (row[vehicleNumberIndex] || '').toString().trim() : ''
      const raisedBy = raisedByIndex >= 0 ? (row[raisedByIndex] || '').toString().trim() : ''
      const currentStatus = currentStatusIndex >= 0 ? (row[currentStatusIndex] || '').toString().trim() : ''
      
      if (!timestampRaised || !timestampRaised.toString().trim()) return

      totalRequests += 1

      const raisedDate = parseTimestamp(timestampRaised)
      if (!raisedDate) return

      const today = new Date()
      if (raisedDate > today) {
        totalRequests -= 1
        return
      }

      const month = getMonthYear(raisedDate)
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = { requests: 0, delivered: 0, resolutionTimes: [] }
      }
      monthlyStats[month].requests += 1

      if (!clientStats[clientName]) {
        clientStats[clientName] = { requests: 0, delivered: 0, resolutionTimes: [] }
      }
      clientStats[clientName].requests += 1

      const isDeliveredByYN = resolvedYN === 'yes' || resolvedYN === 'y'
      
      let deliveryTime = null
      let resolvedTimestamp = ''
      
      if (timestampResolved && timestampResolved.toString().trim()) {
        resolvedTimestamp = timestampResolved.toString().trim()
        const resolvedDate = parseTimestamp(timestampResolved)
        if (resolvedDate && resolvedDate >= raisedDate) {
          const timeDiff = (resolvedDate - raisedDate) / (1000 * 60 * 60)
          if (timeDiff >= 0 && timeDiff < 8760) {
            deliveryTime = timeDiff
          }
        }
      }
      
      const isDelivered = isDeliveredByYN || deliveryTime !== null

      if (isDelivered) {
        totalDelivered += 1
        monthlyStats[month].delivered += 1
        clientStats[clientName].delivered += 1
        
        if (deliveryTime !== null) {
          monthlyStats[month].resolutionTimes.push(deliveryTime)
          clientStats[clientName].resolutionTimes.push(deliveryTime)
          resolutionTimes.push(deliveryTime)
        }
      }

      // Store row data for table
      allRows.push({
        client: clientName,
        timestampRaised: timestampRaised.toString().trim(),
        issueDetails: issueDetails || '-',
        vehicleNumber: vehicleNumber || '-',
        raisedBy: raisedBy || '-',
        currentStatus: currentStatus || '-',
        isDelivered: isDelivered,
        deliveryTime: deliveryTime,
        month: month,
        raisedDate: raisedDate.toISOString()
      })
    })

    // Sort allRows: delivered first, not delivered last
    allRows.sort((a, b) => {
      if (a.isDelivered && !b.isDelivered) return -1
      if (!a.isDelivered && b.isDelivered) return 1
      // Within same group, sort by date descending
      return new Date(b.raisedDate) - new Date(a.raisedDate)
    })

    const avgDeliveryTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0
    
    const fastestDeliveryTime = resolutionTimes.length > 0 ? Math.min(...resolutionTimes) : 0
    const slowestDeliveryTime = resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : 0
    const medianDeliveryTime = resolutionTimes.length > 0 ? calculateMedian(resolutionTimes) : 0

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
        fastestDeliveryMinutes: data.resolutionTimes.length > 0 ? parseFloat((Math.min(...data.resolutionTimes) * 60).toFixed(1)) : 0,
        slowestDelivery: data.resolutionTimes.length > 0 ? parseFloat(Math.max(...data.resolutionTimes).toFixed(2)) : 0,
        medianDeliveryTime: data.resolutionTimes.length > 0 ? parseFloat(calculateMedian(data.resolutionTimes).toFixed(2)) : 0
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
        slowestDelivery: data.resolutionTimes.length > 0 ? parseFloat(Math.max(...data.resolutionTimes).toFixed(2)) : 0
      }))

    return NextResponse.json({
      monthlyData,
      clientBreakdown,
      allRows,
      totalRequests,
      totalDelivered,
      overallDeliveryRate: totalRequests > 0 ? parseFloat(((totalDelivered / totalRequests) * 100).toFixed(1)) : 0,
      avgDeliveryTime: parseFloat(avgDeliveryTime.toFixed(2)),
      fastestDeliveryTime: parseFloat(fastestDeliveryTime.toFixed(2)),
      fastestDeliveryMinutes: parseFloat((fastestDeliveryTime * 60).toFixed(1)),
      slowestDeliveryTime: parseFloat(slowestDeliveryTime.toFixed(2)),
      medianDeliveryTime: parseFloat(medianDeliveryTime.toFixed(2)),
      debug: {
        totalRowsProcessed: filteredRows.length,
        resolvedYNColumnFound: resolvedYNIndex >= 0,
        resolvedYNIndex,
        newColumnsFound: {
          issueDetails: issueDetailsIndex >= 0 ? `Found at ${issueDetailsIndex}` : 'Not found',
          vehicleNumber: vehicleNumberIndex >= 0 ? `Found at ${vehicleNumberIndex}` : 'Not found',
          raisedBy: raisedByIndex >= 0 ? `Found at ${raisedByIndex}` : 'Not found',
          currentStatus: currentStatusIndex >= 0 ? `Found at ${currentStatusIndex}` : 'Not found',
        },
        headers: headers
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching customer video request data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

function parseTimestamp(timestampStr) {
  if (!timestampStr) return null
  const str = timestampStr.toString().trim()
  if (!str) return null
  
  try {
    if (str.includes('/') && str.includes(' ')) {
      const [datePart, timePart] = str.split(' ')
      const dateParts = datePart.split('/')
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1
        let year = parseInt(dateParts[2])
        if (year < 100) year += 2000
        if (timePart) {
          const timeParts = timePart.split(':')
          const hour = parseInt(timeParts[0]) || 0
          const minute = parseInt(timeParts[1]) || 0
          const second = parseInt(timeParts[2]) || 0
          return new Date(year, month, day, hour, minute, second)
        } else {
          return new Date(year, month, day)
        }
      }
    }
    
    if (str.includes('-') && str.includes(' ')) {
      const [datePart, timePart] = str.split(' ')
      const dateParts = datePart.split('-')
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1
        let year = parseInt(dateParts[2])
        if (year < 100) year += 2000
        const timeParts = timePart.split(':')
        const hour = parseInt(timeParts[0]) || 0
        const minute = parseInt(timeParts[1]) || 0
        const second = parseInt(timeParts[2]) || 0
        return new Date(year, month, day, hour, minute, second)
      }
    }
    
    if (!str.includes(' ')) {
      const sep = str.includes('/') ? '/' : '-'
      const dateParts = str.split(sep)
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1
        let year = parseInt(dateParts[2])
        if (year < 100) year += 2000
        return new Date(year, month, day)
      }
    }
    
    const parsed = new Date(str)
    if (!isNaN(parsed.getTime())) return parsed
    
    return null
  } catch (e) {
    return null
  }
}

function getMonthYear(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function calculateMedian(arr) {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
