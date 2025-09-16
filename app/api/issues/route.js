import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET2_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fetch Issues-Realtime sheet data
    const issuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Issues-Realtime!A:Z?key=${API_KEY}`
    
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
    const subRequestIndex = headers.findIndex(h => h.toLowerCase().includes('sub-request') || h.toLowerCase().includes('sub request'))
    const timestampRaisedIndex = headers.findIndex(h => h.toLowerCase().includes('timestamp') && h.toLowerCase().includes('raised'))
    const timestampResolvedIndex = headers.findIndex(h => h.toLowerCase().includes('timestamp') && h.toLowerCase().includes('resolved'))
    const clientsIndex = headers.findIndex(h => h.toLowerCase().includes('client'))

    if (subRequestIndex === -1 || timestampRaisedIndex === -1) {
      return NextResponse.json({ error: 'Required columns not found' }, { status: 400 })
    }

    // Filter for "Historical Video Request" only
    const filteredRows = rows.slice(1).filter(row => 
      row[subRequestIndex] && row[subRequestIndex].toLowerCase().includes('historical video request')
    )

    // Process data
    const monthlyStats = {}
    const clientStats = {}
    const resolutionTimes = []
    let totalRaised = 0
    let totalResolved = 0

    filteredRows.forEach(row => {
      const timestampRaised = row[timestampRaisedIndex]
      const timestampResolved = row[timestampResolvedIndex]
      const clientName = row[clientsIndex] || 'Unknown'
      
      if (!timestampRaised) return

      totalRaised += 1

      // Extract month from raised timestamp
      const raisedDate = new Date(timestampRaised)
      if (!isNaN(raisedDate.getTime())) {
        const month = `${getMonthName(raisedDate.getMonth() + 1)} ${raisedDate.getFullYear()}`
        
        // Monthly stats
        if (!monthlyStats[month]) {
          monthlyStats[month] = { raised: 0, resolved: 0, resolutionTimes: [] }
        }
        monthlyStats[month].raised += 1

        // Client stats
        if (!clientStats[clientName]) {
          clientStats[clientName] = { raised: 0, resolved: 0, resolutionTimes: [] }
        }
        clientStats[clientName].raised += 1

        // Calculate resolution time if resolved
        if (timestampResolved) {
          const resolvedDate = new Date(timestampResolved)
          if (!isNaN(resolvedDate.getTime())) {
            const resolutionTime = (resolvedDate - raisedDate) / (1000 * 60 * 60) // hours
            
            if (resolutionTime >= 0) {
              totalResolved += 1
              monthlyStats[month].resolved += 1
              monthlyStats[month].resolutionTimes.push(resolutionTime)
              clientStats[clientName].resolved += 1
              clientStats[clientName].resolutionTimes.push(resolutionTime)
              resolutionTimes.push(resolutionTime)
            }
          }
        }
      }
    })

    // Calculate statistics
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
      .sort(([a], [b]) => new Date(a.split(' ')[0] + ' 1, ' + a.split(' ')[1]) - new Date(b.split(' ')[0] + ' 1, ' + b.split(' ')[1]))
      .map(([month, data]) => ({
        month,
        raised: data.raised,
        resolved: data.resolved,
        avgTime: data.resolutionTimes.length > 0 
          ? parseFloat((data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length).toFixed(2))
          : 0
      }))

    const clientBreakdown = Object.entries(clientStats)
      .filter(([, data]) => data.raised > 0)
      .sort((a, b) => b[1].raised - a[1].raised)
      .map(([client, data]) => ({
        client,
        raised: data.raised,
        resolved: data.resolved,
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
      avgResolutionTime: parseFloat(avgResolutionTime.toFixed(2)),
      minResolutionTime: parseFloat(minResolutionTime.toFixed(2)),
      maxResolutionTime: parseFloat(maxResolutionTime.toFixed(2)),
      medianResolutionTime: parseFloat(medianResolutionTime.toFixed(2))
    })

  } catch (error) {
    console.error('Error fetching issues data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    )
  }
}

function getMonthName(monthNum) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  return months[monthNum - 1] || 'Unknown'
}

function calculateMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  return sorted.length % 2 !== 0 
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}
