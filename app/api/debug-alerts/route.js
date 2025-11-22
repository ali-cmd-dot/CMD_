import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET1_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    const alertUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Alert_Tracking!A:F?key=${API_KEY}`
    
    const alertResponse = await fetch(alertUrl, { cache: 'no-store' })
    
    if (!alertResponse.ok) {
      throw new Error(`Failed to fetch alerts: ${alertResponse.status}`)
    }
    
    const alertData = await alertResponse.json()
    const rows = alertData.values || []
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    // Headers
    const headers = rows[0]
    
    // Raw data analysis
    const allRows = rows.slice(1)
    const filteredRows = allRows.filter(row => 
      row[2] && row[2] !== 'No L2 alerts found' && row[0] && row[1]
    )

    // Count by client
    const clientCounts = {}
    const skippedRows = []
    const futureRows = []
    
    const today = new Date()
    
    filteredRows.forEach((row, idx) => {
      const date = row[0]
      const clientName = row[1]
      const alertType = row[2]
      
      if (!date || !clientName || !alertType) {
        skippedRows.push({
          rowNumber: idx + 2,
          reason: 'Missing date, client or alert type',
          data: row
        })
        return
      }

      // Parse date
      const dateParts = date.split('-')
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0])
        const monthNum = parseInt(dateParts[1])
        let year = parseInt(dateParts[2])
        
        if (year < 100) year += 2000
        
        const parsedDate = new Date(year, monthNum - 1, day)
        
        if (parsedDate > today) {
          futureRows.push({
            rowNumber: idx + 2,
            date: date,
            client: clientName,
            parsedDate: parsedDate.toISOString(),
            daysInFuture: Math.ceil((parsedDate - today) / (1000 * 60 * 60 * 24))
          })
          return
        }
        
        // Count valid alerts
        if (!clientCounts[clientName]) {
          clientCounts[clientName] = 0
        }
        clientCounts[clientName] += 1
      }
    })

    const totalValidAlerts = Object.values(clientCounts).reduce((sum, count) => sum + count, 0)
    
    const clientBreakdown = Object.entries(clientCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([client, count]) => ({
        client,
        count,
        percentage: totalValidAlerts > 0 ? parseFloat(((count / totalValidAlerts) * 100).toFixed(1)) : 0
      }))

    return NextResponse.json({
      summary: {
        totalRawRows: allRows.length,
        totalFilteredRows: filteredRows.length,
        totalValidAlerts: totalValidAlerts,
        skippedRowsCount: skippedRows.length,
        futureRowsCount: futureRows.length,
        uniqueClients: Object.keys(clientCounts).length
      },
      headers: headers,
      clientBreakdown: clientBreakdown,
      percentageCheck: {
        totalPercentage: clientBreakdown.reduce((sum, c) => sum + c.percentage, 0),
        shouldBe100: totalValidAlerts > 0
      },
      skippedRows: skippedRows.slice(0, 10),
      futureRows: futureRows,
      sampleValidRows: filteredRows.slice(0, 5).map((row, idx) => ({
        rowNumber: idx + 2,
        date: row[0],
        client: row[1],
        alertType: row[2]
      }))
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error in debug-alerts:', error)
    return NextResponse.json(
      { error: 'Failed to debug alerts', details: error.message },
      { status: 500 }
    )
  }
}
