import { NextResponse } from 'next/server'

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

    // Find column indices - FIXED: "Clients" and "Sub-request"
    const headers = rows[0]
    let timestampRaisedIndex = -1
    let timestampResolvedIndex = -1
    let clientIndex = -1
    let issueIndex = -1

    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      if (h === 'Timestamp Issues Raised') {
        timestampRaisedIndex = index
      }
      if (h === 'Timestamp Issues Resolved') {
        timestampResolvedIndex = index
      }
      // FIXED: Match "Clients" (with 's')
      if (h === 'Clients' || h === 'Client' || h === 'clients') {
        clientIndex = index
      }
      // FIXED: Match "Sub-request" column
      if (h === 'Sub-request' || h === 'Issue' || h === 'issue') {
        issueIndex = index
      }
    })

    if (timestampRaisedIndex === -1 || timestampResolvedIndex === -1 || clientIndex === -1 || issueIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        headers: headers
      }, { status: 400 })
    }

    // Filter out Customer request for video
    const filteredRows = rows.slice(1).filter(row => {
      const issueType = (row[issueIndex] || '').toString().trim()
      return issueType !== 'Customer request for video'
    })

    // Process all issues
    const allIssues = []
    let totalRaised = 0
    let totalResolved = 0
    const resolutionTimes = []

    filteredRows.forEach((row, rowIndex) => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = row[timestampResolvedIndex]
      const clientName = (row[clientIndex] || 'Unknown').toString().trim()
      
      const hasRaisedData = timestampRaised && timestampRaised.toString().trim()
      if (!hasRaisedData) return

      const raisedDate = parseTimestamp(timestampRaised)
      if (!raisedDate) return

      const raisedMonth = getMonthYear(raisedDate)
      let resolvedMonth = null
      let resolvedDate = null
      let resolutionTime = null

      const hasResolvedData = timestampResolved && timestampResolved.toString().trim()
      if (hasResolvedData) {
        resolvedDate = parseTimestamp(timestampResolved)
        if (resolvedDate && resolvedDate >= raisedDate) {
          resolvedMonth = getMonthYear(resolvedDate)
          resolutionTime = (resolvedDate - raisedDate) / (1000 * 60 * 60)
          
          if (resolutionTime >= 0 && resolutionTime < 8760) {
            resolutionTimes.push(resolutionTime)
            totalResolved += 1
          }
        }
      }

      allIssues.push({
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

    // Get current month for logic
    const currentMonth = getMonthYear(new Date())
    
    // Calculate monthly statistics with CORRECTED logic
    const monthlyBreakdown = {}
    const clientStats = {}

    // Initialize all months
    allIssues.forEach(issue => {
      if (!monthlyBreakdown[issue.raisedMonth]) {
        monthlyBreakdown[issue.raisedMonth] = {
          raised: 0,
          resolvedSameMonth: 0,
          resolvedLaterMonths: 0,
          carryForwardIn: 0,
          stillPending: 0,
          resolutionTimes: []
        }
      }
    })

    // Process each issue for raised month statistics
    allIssues.forEach(issue => {
      const { raisedMonth, resolvedMonth, resolutionTime, client, isResolved } = issue
      
      monthlyBreakdown[raisedMonth].raised += 1

      if (isResolved) {
        if (raisedMonth === resolvedMonth) {
          monthlyBreakdown[raisedMonth].resolvedSameMonth += 1
        } else {
          monthlyBreakdown[raisedMonth].resolvedLaterMonths += 1
        }
        
        if (resolutionTime !== null) {
          monthlyBreakdown[raisedMonth].resolutionTimes.push(resolutionTime)
        }
      } else {
        monthlyBreakdown[raisedMonth].stillPending += 1
      }

      // Client stats
      if (!clientStats[client]) {
        clientStats[client] = { raised: 0, resolved: 0, resolutionTimes: [] }
      }
      clientStats[client].raised += 1
      
      if (isResolved && resolutionTime !== null) {
        clientStats[client].resolved += 1
        clientStats[client].resolutionTimes.push(resolutionTime)
      }
    })

    // Calculate carry forward IN for each month
    allIssues.forEach(issue => {
      const { raisedMonth, resolvedMonth, isResolved } = issue
      
      if (isResolved && raisedMonth !== resolvedMonth) {
        if (!monthlyBreakdown[resolvedMonth]) {
          monthlyBreakdown[resolvedMonth] = {
            raised: 0, resolvedSameMonth: 0, resolvedLaterMonths: 0,
            carryForwardIn: 0, stillPending: 0, resolutionTimes: []
          }
        }
        monthlyBreakdown[resolvedMonth].carryForwardIn += 1
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

    // Convert to frontend format
    const monthlyData = Object.entries(monthlyBreakdown)
      .sort(([a], [b]) => new Date(a.replace(' ', ' 1, ')) - new Date(b.replace(' ', ' 1, ')))
      .map(([month, data]) => {
        const isCurrentMonth = month === currentMonth
        
        const totalResolved = data.resolvedSameMonth + data.resolvedLaterMonths
        const actualResolutionRate = data.raised > 0 ? parseFloat(((totalResolved / data.raised) * 100).toFixed(1)) : 0
        
        return {
          month,
          raised: data.raised,
          resolved: totalResolved,
          resolvedSameMonth: data.resolvedSameMonth,
          resolvedLaterMonths: data.resolvedLaterMonths,
          carryForwardIn: data.carryForwardIn,
          stillPending: data.stillPending,
          avgTime: data.resolutionTimes.length > 0 
            ? convertHoursToDaysHours(data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length)
            : '0h',
          avgTimeHours: data.resolutionTimes.length > 0 
            ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
            : 0,
          resolutionRate: isCurrentMonth ? null : actualResolutionRate,
          sameMonthResolutionRate: data.raised > 0 ? parseFloat(((data.resolvedSameMonth / data.raised) * 100).toFixed(1)) : 0,
          isCurrentMonth
        }
      })

    const clientBreakdown = Object.entries(clientStats)
      .filter(([, data]) => data.raised > 0)
      .sort((a, b) => b[1].raised - a[1].raised)
      .map(([client, data]) => ({
        client,
        raised: data.raised,
        resolved: data.resolved,
        resolutionRate: data.raised > 0 ? parseFloat(((data.resolved / data.raised) * 100).toFixed(1)) : 0,
        avgTime: data.resolutionTimes.length > 0 
          ? convertHoursToDaysHours(data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length)
          : '0h',
        avgTimeHours: data.resolutionTimes.length > 0 
          ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
          : 0,
        minTime: data.resolutionTimes.length > 0 ? convertHoursToDaysHours(Math.min(...data.resolutionTimes)) : '0h',
        maxTime: data.resolutionTimes.length > 0 ? convertHoursToDaysHours(Math.max(...data.resolutionTimes)) : '0h',
        medianTime: data.resolutionTimes.length > 0 ? convertHoursToDaysHours(calculateMedian(data.resolutionTimes)) : '0h'
      }))

    return NextResponse.json({
      monthlyData,
      clientBreakdown,
      totalRaised,
      totalResolved,
      resolutionRate: totalRaised > 0 ? parseFloat(((totalResolved / totalRaised) * 100).toFixed(1)) : 0,
      avgResolutionTime: convertHoursToDaysHours(avgResolutionTime),
      avgResolutionTimeHours: parseFloat(avgResolutionTime.toFixed(2)),
      minResolutionTime: convertHoursToDaysHours(minResolutionTime),
      maxResolutionTime: convertHoursToDaysHours(maxResolutionTime),
      medianResolutionTime: convertHoursToDaysHours(medianResolutionTime),
      currentMonth,
      debug: {
        totalRowsProcessed: filteredRows.length,
        resolutionTimesCount: resolutionTimes.length,
        logic: 'FIXED: Column names updated to Clients and Sub-request'
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

function convertHoursToDaysHours(hours) {
  if (!hours || hours === 0) return '0h'
  
  const totalHours = Math.round(hours * 10) / 10
  
  if (totalHours < 24) {
    return `${totalHours}h`
  }
  
  const days = Math.floor(totalHours / 24)
  const remainingHours = Math.round((totalHours % 24) * 10) / 10
  
  if (remainingHours === 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }
  
  return `${days} day${days > 1 ? 's' : ''} ${remainingHours}h`
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
