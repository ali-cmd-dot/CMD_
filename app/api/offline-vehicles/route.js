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

    // Fetch offline vehicles sheet data
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

    // Find column indices - Column J = Vehicle Number, Column K = Clients
    const headers = rows[0]
    console.log('All headers:', headers)
    
    let vehicleNumberIndex = -1
    let clientIndex = -1

    // Search for exact column positions
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      // Column J - Vehicle Number
      if (h === 'Vehicle Number' || h === 'vehicle number' || h === 'Vehicle' || h.toLowerCase().includes('vehicle')) {
        vehicleNumberIndex = index
      }
      
      // Column K - Clients
      if (h === 'Clients' || h === 'Client' || h === 'clients' || h === 'client') {
        clientIndex = index
      }
    })

    console.log('Column indices found:', {
      vehicleNumberIndex,
      clientIndex,
      vehicleNumberHeader: headers[vehicleNumberIndex],
      clientHeader: headers[clientIndex]
    })

    if (vehicleNumberIndex === -1 || clientIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        missingColumns: {
          vehicleNumber: vehicleNumberIndex === -1 ? 'Missing "Vehicle Number" column' : 'Found',
          client: clientIndex === -1 ? 'Missing "Clients" column' : 'Found'
        },
        headers: headers
      }, { status: 400 })
    }

    // Process offline vehicles data
    const clientVehicleCounts = {}
    let totalOfflineVehicles = 0
    const vehicleDetails = []

    rows.slice(1).forEach((row, rowIndex) => {
      const vehicleNumber = row[vehicleNumberIndex]
      const clientName = row[clientIndex]
      
      // Skip if no vehicle number or no client
      if (!vehicleNumber || !vehicleNumber.toString().trim()) return
      if (!clientName || !clientName.toString().trim()) return
      
      const client = clientName.toString().trim()
      const vehicle = vehicleNumber.toString().trim()
      
      // CRITICAL: Ignore #N/A clients and blank
      if (client === '#N/A' || client.toLowerCase() === '#n/a' || client === 'N/A' || client === '') {
        console.log(`Skipping #N/A or blank client at row ${rowIndex + 2}`)
        return
      }
      
      // Count vehicles per client
      if (!clientVehicleCounts[client]) {
        clientVehicleCounts[client] = 0
      }
      clientVehicleCounts[client] += 1
      totalOfflineVehicles += 1
      
      // Store vehicle details
      vehicleDetails.push({
        client,
        vehicle,
        rowNumber: rowIndex + 2
      })
    })

    console.log('Processing complete:', {
      totalOfflineVehicles,
      uniqueClients: Object.keys(clientVehicleCounts).length
    })

    // Convert to arrays and sort
    const clientBreakdown = Object.entries(clientVehicleCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([client, count]) => ({
        client,
        count,
        percentage: totalOfflineVehicles > 0 ? parseFloat(((count / totalOfflineVehicles) * 100).toFixed(1)) : 0
      }))

    // Top 10 clients
    const top10Clients = clientBreakdown.slice(0, 10)

    // Group vehicle details by client
    const clientVehicleDetails = {}
    vehicleDetails.forEach(detail => {
      if (!clientVehicleDetails[detail.client]) {
        clientVehicleDetails[detail.client] = []
      }
      clientVehicleDetails[detail.client].push(detail.vehicle)
    })

    // Add vehicle lists to breakdown
    const detailedBreakdown = clientBreakdown.map(client => ({
      ...client,
      vehicles: clientVehicleDetails[client.client] || []
    }))

    return NextResponse.json({
      totalOfflineVehicles,
      uniqueClients: Object.keys(clientVehicleCounts).length,
      top10Clients,
      allClients: detailedBreakdown,
      vehicleDetails,
      debug: {
        totalRowsProcessed: rows.length - 1,
        headers: headers,
        columnIndices: { vehicleNumberIndex, clientIndex }
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
      { error: 'Failed to fetch data', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
