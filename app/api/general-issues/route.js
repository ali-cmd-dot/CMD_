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
    
    const timestampRaisedIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('timestamp') && h.toLowerCase().includes('raised')
    )
    const timestampResolvedIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('timestamp') && h.toLowerCase().includes('resolved')
    )
    const clientIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('client')
    )
    const issueIndex = headers.findIndex(h => 
      h && (h.toLowerCase().includes('issue') || h.toLowerCase().includes('sub-request') || h.toLowerCase().includes('sub request'))
    )
    const statusIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('status')
    )

    console.log('General Issues - Column indices:', { 
      timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex, statusIndex 
    })

    if (timestampRaisedIndex === -1 || clientIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        headers: headers 
      }, { status: 400 })
    }

    // Process ALL issues (exclude Historical Video Requests to avoid duplication)
    const filteredRows = rows.slice(1).filter(row => {
      const issueType = row[issueIndex] || ''
      // Exclude Historical Video Requests as they have separate endpoint
      return !issueType.toLowerCase().includes('historical video request')
    })

    console.log('General Issues - Filtered rows count:', filteredRows.length)

    const monthlyStats = {}
    const clientStats = {}
    const resolutionTimes = []
    let totalRaised = 0
    let totalResolved = 0

    filteredRows.forEach(row => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = row[timestampResolvedIndex]
      const clientName = row[clientIndex] || 'Unknown'
      const issueType = row[issueIndex] || 'Unknown Issue'
      const status = row[statusIndex] || ''
      
      if (!timestampRaised || !timestampRaised.trim()) return

      totalRaised += 1

      // Parse raised timestamp
      const raisedDate = parseTimestamp(timestampRaised)
      if (!raisedDate) return

      const month = getMonthYear(raisedDate)
      
      // Monthly stats
      if (!monthlyStats[month]) {
        monthlyStats[month] = { 
          raised: 0, 
          resolved: 0, 
          resolutionTimes: [],
          issueTypes: {}
        }
      }
      monthlyStats[month].raised += 1

      // Track issue types per month
      if (!monthlyStats[month].issueTypes[issueType]) {
        monthlyStats[month].issueTypes[issueType] = 0
      }
      monthlyStats[month].issueTypes[issueType] += 1

      // Client stats
      if (!clientStats[clientName]) {
        clientStats[clientName] = { 
          raised: 0, 
          resolved: 0, 
          resolutionTimes: [],
          issueTypes: {}
        }
      }
      clientStats[clientName].raised += 1

      // Track issue types per client
      if (!clientStats[clientName].issueTypes[issueType]) {
        clientStats[clientName].issueTypes[issueType] = 0
      }
      clientStats[clientName].issueTypes[issueType] += 1

      // Better resolution detection logic
      let isResolved = false
      let resolvedDate = null

      // Method 1: Check if resolved timestamp exists and is valid
      if (timestampResolved && timestampResolved.trim() && 
          timestampResolved.toLowerCase() !== 'pending' && 
          timestampResolved.toLowerCase() !== 'open' &&
          timestampResolved.toLowerCase() !== 'in progress' &&
          timestampResolved !== '-' &&
          timestampResolved !== '') {
        
        resolvedDate = parseTimestamp(timestampResolved)
        if (resolvedDate && resolvedDate > raisedDate) {
          isResolved = true
        }
      }

      // Method 2: Check status column if available
      if (!isResolved && status) {
        const statusLower = status.toLowerCase()
        if (statusLower.includes('resolved') || 
            statusLower.includes('closed') || 
            statusLower.includes('completed') || 
            statusLower.includes('done')) {
          isResolved = true
        }
      }

      // Method 3: If resolved timestamp exists but no time diff, still consider resolved
      if (!isResolved && timestampResolved && timestampResolved.trim() &&
          timestampResolved.toLowerCase() !== 'pending' &&
          timestampResolved !== '-') {
        resolvedDate = parseTimestamp(timestampResolved)
        if (resolvedDate) {
          isResolved = true
        }
      }

      // Calculate resolution time if resolved
      if (isResolved) {
        totalResolved += 1
        monthlyStats[month].resolved += 1
        clientStats[clientName].resolved += 1

        // Only add to resolution times if we have both valid timestamps
        if (resolvedDate && resolvedDate > raisedDate) {
          const resolutionTime = (resolvedDate - raisedDate) / (1000 * 60 * 60) // hours
          
          if (resolutionTime >= 0 && resolutionTime < 8760) { // Less than 1 year (filter outliers)
            monthlyStats[month].resolutionTimes.push(resolutionTime)
            clientStats[clientName].resolutionTimes.push(resolutionTime)
            resolutionTimes.push(resolutionTime)
          }
        }
      }
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
        resolutionRate: data.raised > 0 ? parseFloat(((data.resolved / data.raised) * 100).toFixed(1)) : 0,
        topIssueTypes: Object.entries(data.issueTypes)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([type, count]) => ({ type, count }))
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
        medianTime: data.resolutionTimes.length > 0 ? parseFloat(calculateMedian(data.resolutionTimes).toFixed(2)) : 0,
        topIssueTypes: Object.entries(data.issueTypes)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([type, count]) => ({ type, count }))
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
        headers: headers
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
  if (!timestampStr || !timestampStr.trim()) return null
  
  try {
    // Handle multiple timestamp formats
    
    // Format: DD/MM/YYYY HH:mm:ss
    const parts = timestampStr.split(' ')
    if (parts.length >= 2) {
      const datePart = parts[0]
      const timePart = parts[1]
      
      const dateParts = datePart.split('/')
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
    
    // Format: DD-MM-YYYY HH:mm:ss
    if (timestampStr.includes('-') && timestampStr.includes(' ')) {
      const [datePart, timePart] = timestampStr.split(' ')
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
    if (!timestampStr.includes(' ')) {
      const dateParts = timestampStr.includes('/') ? timestampStr.split('/') : timestampStr.split('-')
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1
        let year = parseInt(dateParts[2])
        
        if (year < 100) year += 2000
        
        return new Date(year, month, day)
      }
    }
    
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
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
