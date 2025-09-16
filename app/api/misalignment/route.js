import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET1_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fetch Misalignment_Tracking sheet data
    const misalignmentUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Misalignment_Tracking!A:F?key=${API_KEY}`
    
    const misalignmentResponse = await fetch(misalignmentUrl)
    
    if (!misalignmentResponse.ok) {
      throw new Error(`Failed to fetch misalignment data: ${misalignmentResponse.status}`)
    }
    
    const misalignmentData = await misalignmentResponse.json()
    const rows = misalignmentData.values || []
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    // Find the column indices (assuming header row exists)
    const headers = rows[0]
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'))
    const clientIndex = headers.findIndex(h => h.toLowerCase().includes('client'))
    const countIndex = headers.findIndex(h => h.toLowerCase().includes('count'))

    if (dateIndex === -1 || clientIndex === -1 || countIndex === -1) {
      return NextResponse.json({ error: 'Required columns not found' }, { status: 400 })
    }

    // Process data by month and client
    const monthlyStats = {}
    const clientStats = {}
    let totalCount = 0

    rows.slice(1).forEach(row => {
      const date = row[dateIndex]
      const clientName = row[clientIndex]
      const count = parseInt(row[countIndex]) || 0
      
      if (!date || !clientName || count === 0) return

      totalCount += count

      // Extract month from date
      const dateParts = date.split('-')
      if (dateParts.length === 3) {
        const month = `${getMonthName(parseInt(dateParts[1]))} ${dateParts[2]}`
        
        // Monthly stats
        if (!monthlyStats[month]) {
          monthlyStats[month] = { total: 0, clients: new Set() }
        }
        monthlyStats[month].total += count
        monthlyStats[month].clients.add(clientName)
        
        // Client stats
        if (!clientStats[clientName]) {
          clientStats[clientName] = 0
        }
        clientStats[clientName] += count
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

    const avgPerMonth = monthlyData.length > 0 ? totalCount / monthlyData.length : 0
    const uniqueClientsTotal = new Set(rows.slice(1).filter(row => row[clientIndex] && parseInt(row[countIndex]) > 0).map(row => row[clientIndex])).size

    // All clients breakdown - no "Others" category
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
    console.error('Error fetching misalignment data:', error)
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
