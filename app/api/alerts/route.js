import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET1_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fetch Alert_Tracking sheet data
    const alertUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Alert_Tracking!A:F?key=${API_KEY}`
    
    const alertResponse = await fetch(alertUrl)
    
    if (!alertResponse.ok) {
      throw new Error(`Failed to fetch alerts: ${alertResponse.status}`)
    }
    
    const alertData = await alertResponse.json()
    const rows = alertData.values || []
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    // Skip header row and filter out "No L2 alerts found"
    const filteredRows = rows.slice(1).filter(row => 
      row[2] && row[2] !== 'No L2 alerts found' && row[0] && row[1]
    )

    // Process data by month and client
    const monthlyStats = {}
    const clientStats = {}

    filteredRows.forEach(row => {
      const [date, clientName, alertType] = row
      
      if (!date || !clientName || !alertType) return

      // Extract month from date (assuming DD-MM-YYYY format)
      const dateParts = date.split('-')
      if (dateParts.length === 3) {
        const month = `${getMonthName(parseInt(dateParts[1]))} ${dateParts[2]}`
        
        // Monthly stats
        if (!monthlyStats[month]) {
          monthlyStats[month] = { total: 0, clients: new Set() }
        }
        monthlyStats[month].total += 1
        monthlyStats[month].clients.add(clientName)
        
        // Client stats
        if (!clientStats[clientName]) {
          clientStats[clientName] = 0
        }
        clientStats[clientName] += 1
      }
    })

    // Convert to arrays for frontend
    const monthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => new Date(a.split(' ')[0] + ' 1, ' + a.split(' ')[1]) - new Date(b.split(' ')[0] + ' 1, ' + b.split(' ')[1]))
      .map(([month, data]) => ({
        month,
        total: data.total,
        clients: data.clients.size
      }))

    const totalCount = filteredRows.length
    const avgPerMonth = monthlyData.length > 0 ? totalCount / monthlyData.length : 0
    const uniqueClientsTotal = new Set(filteredRows.map(row => row[1])).size

    // Top clients breakdown - Remove "Others" and show all clients
    const sortedClients = Object.entries(clientStats)
      .sort(([,a], [,b]) => b - a)

    const clientBreakdown = sortedClients.map(([client, count]) => ({
      client,
      count,
      percentage: parseFloat(((count / totalCount) * 100).toFixed(1))
    }))

    return NextResponse.json({
      monthlyData,
      clientBreakdown,
      totalCount,
      avgPerMonth: parseFloat(avgPerMonth.toFixed(1)),
      uniqueClients: uniqueClientsTotal
    })

  } catch (error) {
    console.error('Error fetching alert data:', error)
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
