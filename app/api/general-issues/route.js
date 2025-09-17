import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET2_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fixed: Tab name with space "Issues- Realtime"
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

    // Find column indices with better search
    const headers = rows[0]
    console.log('General Issues - Headers found:', headers)
    
    let timestampRaisedIndex = -1
    let timestampResolvedIndex = -1
    let clientIndex = -1
    let issueIndex = -1
    let statusIndex = -1

    // More flexible column detection
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toLowerCase().trim()
      
      // Timestamp Raised
      if ((h.includes('timestamp') && h.includes('raised')) ||
          (h.includes('time') && h.includes('raised')) ||
          h.includes('raised timestamp') ||
          h.includes('issue raised') ||
          h.includes('created')) {
        timestampRaisedIndex = index
      }
      
      // Timestamp Resolved
      if ((h.includes('timestamp') && h.includes('resolved')) ||
          (h.includes('time') && h.includes('resolved')) ||
          h.includes('resolved timestamp') ||
          h.includes('issue resolved') ||
          h.includes('completed')) {
        timestampResolvedIndex = index
      }
      
      // Client
      if (h.includes('client') || h.includes('customer') || h.includes('company')) {
        clientIndex = index
      }
      
      // Issue/Sub-request
      if (h.includes('issue') || h.includes('sub-request') || h.includes('sub request') || 
          h.includes('type') || h.includes('request') || h.includes('description')) {
        issueIndex = index
      }
      
      // Status
      if (h.includes('status') || h.includes('state') || h.includes('condition')) {
        statusIndex = index
      }
    })

    console.log('General Issues - Column indices:', { 
      timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex, statusIndex 
    })

    if (timestampRaisedIndex === -1 || clientIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        headers: headers,
        indices: { timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex, statusIndex }
      }, { status: 400 })
    }

    // Process ALL issues EXCEPT Historical Video Requests (to avoid duplication)
    const filteredRows = rows.slice(1).filter(row => {
      const issueType = (row[issueIndex] || '').toString().toLowerCase()
      // Exclude Historical Video Requests as they have separate endpoint
      return !(issueType.includes('historical') && issueType.includes('video'))
    })

    console.log('General Issues - Filtered rows count:', filteredRows.length)

    // ROW-BY-ROW processing for perfect matching
    const monthlyStats = {}
    const clientStats = {}
    const resolutionTimes = []
    let totalRaised = 0
    let totalResolved = 0

    filteredRows.forEach((row, rowIndex) => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = row[timestampResolvedIndex]
      const clientName = (row[clientIndex] || 'Unknown').toString()
      const issueType = (row[issueIndex] || 'Unknown Issue').toString()
      const status = row[statusIndex] ? row[statusIndex].toString() : ''
      
      // STEP 1: Check if this row has a RAISED issue
      if (!timestampRaised || !timestampRaised.toString().trim()) {
        return // Skip rows without raised timestamp
      }

      // Count as RAISED
      totalRaised += 1

      // Parse raised timestamp
      const raisedDate = parseTimestamp(timestampRaised)
      if (!raisedDate) {
        console.log(`Row ${rowIndex + 1}: Could not parse raised timestamp: "${timestampRaised}"`)
        return
      }

      const month = getMonthYear(raisedDate)
      
      // Initialize monthly stats
      if (!monthlyStats[month]) {
        monthlyStats[month] = { 
          raised: 0, 
          resolved: 0, 
          resolutionTimes: []
        }
      }
      monthlyStats[month].raised += 1

      // Initialize client stats
      if (!clientStats[clientName]) {
        clientStats[clientName] = { 
          raised: 0, 
          resolved: 0, 
          resolutionTimes: []
        }
      }
      clientStats[clientName].raised += 1

      // STEP 2: Check if THIS SAME ROW has a RESOLVED issue
      let isResolvedInThisRow = false
      let resolvedDate = null

      // Method 1: Check if resolved timestamp exists and is valid in THIS ROW
      if (timestampResolved && timestampResolved.toString().trim()) {
        const resolvedStr = timestampResolved.toString().toLowerCase().trim()
        
        // Skip common "not resolved" indicators
        if (!['pending', 'open', 'in progress', 'not resolved', 'ongoing', '-', '', 'n/a', 'na'].includes(resolvedStr)) {
          resolvedDate = parseTimestamp(timestampResolved)
          if (resolvedDate && resolvedDate >= raisedDate) {
            isResolvedInThisRow = true
          }
        }
      }

      // Method 2: Check status column in THIS ROW if resolved timestamp not conclusive
      if (!isResolvedInThisRow && status) {
        const statusLower = status.toLowerCase().trim()
        if (statusLower.includes('resolved') || 
            statusLower.includes('closed') || 
            statusLower.includes('completed') || 
            statusLower.includes('done') ||
            statusLower === 'complete' ||
            statusLower === 'finished') {
          isResolvedInThisRow = true
          
          // If no resolved date but marked as resolved, use raised date + some time
          if (!resolvedDate) {
            resolvedDate = new Date(raisedDate.getTime() + (24 * 60 * 60 * 1000)) // +1 day
          }
        }
      }

      // STEP 3: If resolved in this row, count it and calculate time
      if (isResolvedInThisRow) {
        totalResolved += 1
        monthlyStats[month].resolved += 1
        clientStats[clientName].resolved += 1

        // Calculate resolution time if we have both dates
        if (resolvedDate && raisedDate) {
          const resolutionTime = (resolvedDate - raisedDate) / (1000 * 60 * 60) // hours
          
          if (resolutionTime >= 0 && resolutionTime < 8760) { // Less than 1 year (filter outliers)
            monthlyStats[month].resolutionTimes.push(resolutionTime)
            clientStats[clientName].resolutionTimes.push(resolutionTime)
            resolutionTimes.push(resolutionTime)
          }
        }
      }
    })

    console.log('Processing complete:', {
      totalRaised,
      totalResolved,
      resolutionRate: totalRaised > 0 ? ((totalResolved / totalRaised) * 100).toFixed(1) : 0
    })

    // Calculate resolution statistics
    const avgResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0
    
    const minResolutionTime = resolutionTimes.length > 0 ? Math.min(...resolutionTimes) : 0
    const maxResolutionTime = resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : 0
    const medianResolutionTime = resolutionTimes.length > 0 
      ? calculateMedian(resolutionTimes) 
      : 0

    // Convert to arrays for frontend  
    const monthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => new Date(a.replace(' ', ' 1, ')) - new Date(b.replace(' ', ' 1, ')))
      .map(([month, data]) => ({
        month,
        raised: data.raised,
        resolved: data.resolved,
        avgTime: data.resolutionTimes.length > 0 
          ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
          : 0,
        resolutionRate: data.raised > 0 ? parseFloat(((data.resolved / data.raised) * 100).toFixed(1)) : 0
      }))

    const clientBreakdown = Object.entries(clientStats)
      .filter(([, data]) => data.raised > 0)
      .sort((a, b) => b[1].raised - a[1].raised)
      .map(([client, data]) => ({
        client,
        raised: data.raised,
        resolved: data.resolved,
        resolutionRate: data.raised > 0 ? parseFloat(((data.resolved / data.raised) * 100).toFixed(1)) : 0,
        avgTime: data.resolutionTimes.length > 0 
          ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
          : 0,
        minTime: data.resolutionTimes.length > 0 ? parseFloat(Math.min(...data.resolutionTimes).toFixed(2)) : 0,
        maxTime: data.resolutionTimes.length > 0 ? parseFloat(Math.max(...data.resolutionTimes).toFixed(2)) : 0,
        medianTime: data.resolutionTimes.length > 0 ? parseFloat(calculateMedian(data.resolutionTimes).toFixed(2)) : 0
      }))

    return NextResponse.json({
      monthlyData,
      clientBreakdown,
      totalRaised,
      totalResolved,
      resolutionRate: totalRaised > 0 ? parseFloat(((totalResolved / totalRaised) * 100).toFixed(1)) : 0,
      avgResolutionTime: parseFloat(avgResolutionTime.toFixed(2)),
      minResolutionTime: parseFloat(minResolutionTime.toFixed(2)),
      maxResolutionTime: parseFloat(maxResolutionTime.toFixed(2)),
      medianResolutionTime: parseFloat(medianResolutionTime.toFixed(2)),
      debug: {
        totalRowsProcessed: filteredRows.length,
        resolutionTimesCount: resolutionTimes.length,
        headers: headers,
        columnIndices: { timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex, statusIndex }
      }
    })

  } catch (error) {
    console.error('Error fetching general issues data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
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
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
