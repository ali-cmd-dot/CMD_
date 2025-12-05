import { NextResponse } from 'next/server'

// CRITICAL: Disable caching for live data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET3_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fetch data from Sheet1 (adjust sheet name if needed)
    const offlineUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:Z?key=${API_KEY}`
    
    console.log('Fetching offline vehicles from:', offlineUrl)
    
    const offlineResponse = await fetch(offlineUrl, {
      cache: 'no-store'
    })
    
    if (!offlineResponse.ok) {
      throw new Error(`Failed to fetch offline vehicles: ${offlineResponse.status}`)
    }
    
    const offlineData = await offlineResponse.json()
    const rows = offlineData.values || []
    
    console.log('Total rows received:', rows.length)
    
    if (rows.length < 2) {
      return NextResponse.json({ 
        error: 'No data found',
        totalRows: rows.length
      }, { status: 404 })
    }

    // Find column indices - Column J = Clients, Column K = Vehicle Number
    const headers = rows[0]
    console.log('Headers:', headers)
    
    let clientIndex = -1
    let vehicleIndex = -1

    // Search for exact column names
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      // Match "Clients" or "Client"
      if (h === 'Clients' || h === 'Client' || h === 'clients' || h === 'client') {
        clientIndex = index
      }
      
      // Match "Vehicle Number"
      if (h === 'Vehicle Number' || h === 'vehicle number' || h === 'Vehicle' || h === 'VehicleNumber') {
        vehicleIndex = index
      }
    })

    console.log('Column indices found:', {
      clientIndex,
      vehicleIndex,
      clientColumn: headers[clientIndex],
      vehicleColumn: headers[vehicleIndex]
    })

    if (clientIndex === -1 || vehicleIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        missingColumns: {
          client: clientIndex === -1 ? 'Missing "Clients" column' : 'Found',
          vehicle: vehicleIndex === -1 ? 'Missing "Vehicle Number" column' : 'Found'
        },
        headers: headers,
        indices: { clientIndex, vehicleIndex }
      }, { status: 400 })
    }

    // Process offline vehicles data
    const clientStats = {}
    let totalOfflineVehicles = 0
    const allVehicles = []

    rows.slice(1).forEach((row, rowIndex) => {
      const clientName = (row[clientIndex] || '').toString().trim()
      const vehicleNumber = (row[vehicleIndex] || '').toString().trim()
      
      // Must have both client and vehicle
      if (!clientName || !vehicleNumber) {
        return
      }

      totalOfflineVehicles += 1

      // Store vehicle details
      allVehicles.push({
        client: clientName,
        vehicle: vehicleNumber,
        rowNumber: rowIndex + 2
      })

      // Client stats
      if (!clientStats[clientName]) {
        clientStats[clientName] = {
          count: 0,
          vehicles: []
        }
      }
      
      clientStats[clientName].count += 1
      clientStats[clientName].vehicles.push(vehicleNumber)
    })

    console.log('Offline Vehicles Processing complete:', {
      totalOfflineVehicles,
      uniqueClients: Object.keys(clientStats).length
    })

    // Top 10 clients by offline vehicle count
    const top10Clients = Object.entries(clientStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([client, data]) => ({
        client,
        count: data.count,
        percentage: totalOfflineVehicles > 0 ? parseFloat(((data.count / totalOfflineVehicles) * 100).toFixed(1)) : 0
      }))

    // All clients breakdown (for detailed view)
    const allClientsBreakdown = Object.entries(clientStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .map(([client, data]) => ({
        client,
        count: data.count,
        percentage: totalOfflineVehicles > 0 ? parseFloat(((data.count / totalOfflineVehicles) * 100).toFixed(1)) : 0,
        vehicles: data.vehicles
      }))

    // Group vehicles by client for detailed view
    const vehiclesByClient = Object.entries(clientStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .map(([client, data]) => ({
        client,
        count: data.count,
        vehicles: data.vehicles.sort()
      }))

    return NextResponse.json({
      totalOfflineVehicles,
      uniqueClients: Object.keys(clientStats).length,
      top10Clients,
      allClientsBreakdown,
      vehiclesByClient,
      debug: {
        totalRowsProcessed: rows.length - 1,
        headers: headers,
        columnIndices: { clientIndex, vehicleIndex }
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching offline vehicles data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    )
  }
}
