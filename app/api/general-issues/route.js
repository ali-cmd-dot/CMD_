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

    // Find EXACT column names
    const headers = rows[0]
    console.log('General Issues - Headers found:', headers)
    
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
      
      // Exact match for "Client"
      if (h === 'Client' || h === 'client') {
        clientIndex = index
      }
      
      // Exact match for "Issue"
      if (h === 'Issue' || h === 'issue') {
        issueIndex = index
      }
    })

    console.log('General Issues - Exact column indices:', { 
      timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex 
    })

    if (timestampRaisedIndex === -1 || timestampResolvedIndex === -1 || clientIndex === -1 || issueIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        missingColumns: {
          timestampRaised: timestampRaisedIndex === -1 ? 'Missing "Timestamp Issues Raised"' : 'Found',
          timestampResolved: timestampResolvedIndex === -1 ? 'Missing "Timestamp Issues Resolved"' : 'Found',
          client: clientIndex === -1 ? 'Missing "Client"' : 'Found',
          issue: issueIndex === -1 ? 'Missing "Issue"' : 'Found'
        },
        headers: headers
      }, { status: 400 })
    }

    // Process ALL issues EXCEPT "Historical Video Request" (to avoid duplication)
    const filteredRows = rows.slice(1).filter(row => {
      const issueType = (row[issueIndex] || '').toString().trim()
      // Exclude Historical Video Request as it has separate endpoint
      return issueType !== 'Historical Video Request'
    })

    console.log('General Issues - Filtered rows count (excluding Historical Video):', filteredRows.length)

    // NEW LOGIC: Track issues by raised month and resolved month separately
    const monthlyStats = {}
    const clientStats = {}
    const resolutionTimes = []
    let totalRaised = 0
    let totalResolved = 0

    // First pass: Process all issues with raised timestamps
    const processedIssues = []
    
    filteredRows.forEach((row, rowIndex) => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = row[timestampResolvedIndex]
      const clientName = (row[clientIndex] || 'Unknown').toString().trim()
      
      // STEP 1: Check if this row has RAISED issue (data in "Timestamp Issues Raised")
      const hasRaisedData = timestampRaised && timestampRaised.toString().trim()
      
      if (!hasRaisedData) {
        return // Skip rows without raised timestamp
      }

      // Parse raised timestamp
      const raisedDate = parseTimestamp(timestampRaised)
      if (!raisedDate) {
        console.log(`Row ${rowIndex + 1}: Could not parse raised timestamp: "${timestampRaised}"`)
        return
      }

      const raisedMonth = getMonthYear(raisedDate)
      let resolvedMonth = null
      let resolvedDate = null
      let resolutionTime = null

      // Check if resolved
      const hasResolvedData = timestampResolved && timestampResolved.toString().trim()
      if (hasResolvedData) {
        resolvedDate = parseTimestamp(timestampResolved)
        if (resolvedDate && resolvedDate >= raisedDate) {
          resolvedMonth = getMonthYear(resolvedDate)
          resolutionTime = (resolvedDate - raisedDate) / (1000 * 60 * 60) // hours
          
          if (resolutionTime >= 0 && resolutionTime < 8760) { // Less than 1 year
            resolutionTimes.push(resolutionTime)
            totalResolved += 1
          }
        }
      }

      // Store issue data
      processedIssues.push({
        client: clientName,
        raisedMonth,
        resolvedMonth,
        resolutionTime,
        isResolved: !!resolvedMonth,
        raisedDate,
        resolvedDate
      })

      totalRaised += 1
    })

    // Second pass: Calculate monthly statistics with carry forward logic
    const monthlyBreakdown = {}
    
    processedIssues.forEach(issue => {
      const { raisedMonth, resolvedMonth, resolutionTime, client, isResolved } = issue
      
      // Initialize raised month
      if (!monthlyBreakdown[raisedMonth]) {
        monthlyBreakdown[raisedMonth] = {
          raised: 0,
          resolvedSameMonth: 0,
          resolvedLaterMonths: 0,
          carryForward: 0,
          resolutionTimes: []
        }
      }
      
      monthlyBreakdown[raisedMonth].raised += 1

      if (isResolved) {
        if (raisedMonth === resolvedMonth) {
          // Resolved in same month
          monthlyBreakdown[raisedMonth].resolvedSameMonth += 1
        } else {
          // Resolved in later month
          monthlyBreakdown[raisedMonth].resolvedLaterMonths += 1
        }
        
        if (resolutionTime !== null) {
          monthlyBreakdown[raisedMonth].resolutionTimes.push(resolutionTime)
        }
      } else {
        // Still pending (carry forward)
        monthlyBreakdown[raisedMonth].carryForward += 1
      }

      // Client stats
      if (!clientStats[client]) {
        clientStats[client] = { 
          raised: 0, 
          resolved: 0, 
          resolutionTimes: []
        }
      }
      clientStats[client].raised += 1
      
      if (isResolved && resolutionTime !== null) {
        clientStats[client].resolved += 1
        clientStats[client].resolutionTimes.push(resolutionTime)
      }
    })

    console.log('General Issues Processing complete:', {
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

    // Convert to arrays for frontend with NEW STRUCTURE
    const monthlyData = Object.entries(monthlyBreakdown)
      .sort(([a], [b]) => new Date(a.replace(' ', ' 1, ')) - new Date(b.replace(' ', ' 1, ')))
      .map(([month, data]) => ({
        month,
        raised: data.raised,
        resolved: data.resolvedSameMonth + data.resolvedLaterMonths, // Total resolved from this month's raised issues
        resolvedSameMonth: data.resolvedSameMonth, // NEW: Resolved in same month
        resolvedLaterMonths: data.resolvedLaterMonths, // NEW: Resolved in later months
        carryForward: data.carryForward, // NEW: Still pending/carried forward
        avgTime: data.resolutionTimes.length > 0 
          ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
          : 0,
        resolutionRate: data.raised > 0 ? parseFloat((((data.resolvedSameMonth + data.resolvedLaterMonths) / data.raised) * 100).toFixed(1)) : 0,
        sameMonthResolutionRate: data.raised > 0 ? parseFloat(((data.resolvedSameMonth / data.raised) * 100).toFixed(1)) : 0 // NEW: Same month resolution rate
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
        columnIndices: { timestampRaisedIndex, timestampResolvedIndex, clientIndex, issueIndex },
        logic: 'NEW: Tracks same-month resolution vs carry-forward separately'
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
