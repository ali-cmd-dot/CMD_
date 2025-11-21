import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET2_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    const issuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Issues-%20Realtime!A:Z?key=${API_KEY}`
    
    console.log('Fetching from URL:', issuesUrl)
    
    const issuesResponse = await fetch(issuesUrl)
    
    if (!issuesResponse.ok) {
      throw new Error(`Failed to fetch issues data: ${issuesResponse.status}`)
    }
    
    const issuesData = await issuesResponse.json()
    const rows = issuesData.values || []
    
    console.log('Total rows received:', rows.length)
    
    if (rows.length < 2) {
      return NextResponse.json({ 
        error: 'No data found',
        totalRows: rows.length,
        sampleData: rows.slice(0, 3)
      }, { status: 404 })
    }

    // Find EXACT column names - FIXED: "Clients" and "Sub-request"
    const headers = rows[0]
    console.log('All headers:', headers)
    
    let timestampRaisedIndex = -1
    let timestampResolvedIndex = -1
    let clientIndex = -1
    let issueIndex = -1

    // Search for EXACT column names
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      // Exact match for "Timestamp Issues Raised"
      if (h === 'Timestamp Issues Raised') {
        timestampRaisedIndex = index
      }
      
      // Exact match for "Timestamp Issues Resolved"  
      if (h === 'Timestamp Issues Resolved') {
        timestampResolvedIndex = index
      }
      
      // FIXED: Match "Clients" (with 's')
      if (h === 'Clients' || h === 'Client' || h === 'clients') {
        clientIndex = index
      }
      
      // FIXED: Match "Sub-request" column for issue type
      if (h === 'Sub-request' || h === 'Issue' || h === 'issue') {
        issueIndex = index
      }
    })

    console.log('Exact column indices found:', {
      timestampRaisedIndex,
      timestampResolvedIndex, 
      clientIndex,
      issueIndex,
      headers: headers
    })

    if (timestampRaisedIndex === -1 || clientIndex === -1 || issueIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        missingColumns: {
          timestampRaised: timestampRaisedIndex === -1 ? 'Missing "Timestamp Issues Raised"' : 'Found',
          client: clientIndex === -1 ? 'Missing "Clients"' : 'Found',
          issue: issueIndex === -1 ? 'Missing "Sub-request"' : 'Found'
        },
        headers: headers,
        indices: { timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex }
      }, { status: 400 })
    }

    // Filter for EXACT "Customer request for video" in "Sub-request" column
    const filteredRows = rows.slice(1).filter(row => {
      const issueType = (row[issueIndex] || '').toString().trim()
      
      // Exact match for "Customer request for video"
      return issueType === 'Customer request for video'
    })

    console.log('Customer request for video rows found:', filteredRows.length)
    console.log('Sample filtered rows:', filteredRows.slice(0, 3).map((row, idx) => ({
      row: idx + 1,
      timestampRaised: row[timestampRaisedIndex],
      timestampResolved: row[timestampResolvedIndex],
      client: row[clientIndex],
      issue: row[issueIndex]
    })))

    // If no Customer request for video found, show all Issue types for debugging
    if (filteredRows.length === 0) {
      const allIssueTypes = rows.slice(1, 20)
        .map(row => row[issueIndex])
        .filter(Boolean)
        .map(issue => issue.toString().trim())
      
      const uniqueIssueTypes = [...new Set(allIssueTypes)]
      
      return NextResponse.json({
        error: 'No "Customer request for video" found in Sub-request column',
        totalDataRows: rows.length - 1,
        issueColumnIndex: issueIndex,
        issueColumnName: headers[issueIndex],
        sampleIssueTypes: uniqueIssueTypes.slice(0, 10),
        exactSearchTerm: 'Customer request for video',
        headers: headers
      }, { status: 404 })
    }

    // Process Customer request for video data
    const monthlyStats = {}
    const clientStats = {}
    const resolutionTimes = []
    let totalRequests = 0
    let totalDelivered = 0

    filteredRows.forEach((row, rowIndex) => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = row[timestampResolvedIndex]
      const clientName = (row[clientIndex] || 'Unknown').toString().trim()
      
      // Must have raised timestamp
      if (!timestampRaised || !timestampRaised.toString().trim()) {
        console.log(`Row ${rowIndex + 1}: No raised timestamp`)
        return
      }

      totalRequests += 1

      // Parse raised timestamp
      const raisedDate = parseTimestamp(timestampRaised)
      if (!raisedDate) {
        console.log(`Row ${rowIndex + 1}: Could not parse timestamp: "${timestampRaised}"`)
        return
      }

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

      // Check if delivered - ONLY if "Timestamp Issues Resolved" has data
      if (timestampResolved && timestampResolved.toString().trim()) {
        const resolvedDate = parseTimestamp(timestampResolved)
        if (resolvedDate && resolvedDate >= raisedDate) {
          const deliveryTime = (resolvedDate - raisedDate) / (1000 * 60 * 60) // hours
          
          if (deliveryTime >= 0 && deliveryTime < 8760) { // Less than 1 year
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

    console.log('Customer request for video Processing complete:', {
      totalRequests,
      totalDelivered,
      deliveryRate: totalRequests > 0 ? ((totalDelivered / totalRequests) * 100).toFixed(1) : 0
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
        fastestDeliveryMinutes: data.resolutionTimes.length > 0 ? parseFloat((Math.min(...data.resolutionTimes) * 60).toFixed(1)) : 0,
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
        fastestDeliveryMinutes: data.resolutionTimes.length > 0 ? parseFloat((Math.min(...data.resolutionTimes) * 60).toFixed(1)) : 0,
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
      fastestDeliveryMinutes: parseFloat((fastestDeliveryTime * 60).toFixed(1)),
      slowestDeliveryTime: parseFloat(slowestDeliveryTime.toFixed(2)),
      medianDeliveryTime: parseFloat(medianDeliveryTime.toFixed(2)),
      debug: {
        totalRowsProcessed: filteredRows.length,
        headers: headers,
        columnIndices: { timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex }
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
    // Handle multiple timestamp formats
    
    // Format: DD/MM/YYYY HH:mm:ss
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
    
    // Format: DD-MM-YYYY HH:mm:ss
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
    
    // Format: Just date DD/MM/YYYY or DD-MM-YYYY
    if (!str.includes(' ')) {
      const dateParts = str.includes('/') ? str.split('/') : str.split('-')
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1
        let year = parseInt(dateParts[2])
        
        if (year < 100) year += 2000
        
        return new Date(year, month, day)
      }
    }
    
    return new Date(str)
  } catch (e) {
    console.error('Error parsing timestamp:', str, e)
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
