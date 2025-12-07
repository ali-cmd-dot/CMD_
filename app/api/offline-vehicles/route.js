import { NextResponse } from 'next/server'

// CRITICAL: Disable caching for live data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = '180CqEujgBjJPjP9eU8C--xMj-VTBSrRUrM_98-S0gjo'
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    // Fetch Sheet1 data
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

    // Find column indices
    const headers = rows[0]
    console.log('All headers:', headers)
    
    let vehicleNumberIndex = -1
    let clientIndex = -1
    let offlineSinceIndex = -1
    let rnIndex = -1

    // Search for exact column positions
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      if (h === 'Vehicle Number' || h === 'vehicle number' || h.toLowerCase().includes('vehicle')) {
        vehicleNumberIndex = index
      }
      if (h === 'client' || h === 'Client' || h === 'CLIENT') {
        clientIndex = index
      }
      if (h === 'Offline Since (hrs)' || h.toLowerCase().includes('offline since')) {
        offlineSinceIndex = index
      }
      if (h === 'R/N' || h === 'r/n') {
        rnIndex = index
      }
    })

    console.log('Column indices found:', {
      vehicleNumberIndex,
      clientIndex,
      offlineSinceIndex,
      rnIndex
    })

    if (vehicleNumberIndex === -1 || clientIndex === -1 || offlineSinceIndex === -1 || rnIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        missingColumns: {
          vehicleNumber: vehicleNumberIndex === -1 ? 'Missing' : 'Found',
          client: clientIndex === -1 ? 'Missing' : 'Found',
          offlineSince: offlineSinceIndex === -1 ? 'Missing' : 'Found',
          rn: rnIndex === -1 ? 'Missing' : 'Found'
        },
        headers: headers
      }, { status: 400 })
    }

    // Process data - ONLY vehicles offline for 48+ hours
    let totalDevices = 0
    let totalOffline = 0
    let notRunningCount = 0
    let cameraIssueCount = 0
    
    const clientVehicleCounts = {}
    const clientNotRunningCounts = {}
    const clientCameraIssueCounts = {}
    const vehicleDetails = []
    const notRunningVehicles = []
    const cameraIssueVehicles = []

    rows.slice(1).forEach((row, rowIndex) => {
      const vehicleNumber = row[vehicleNumberIndex]
      const clientName = row[clientIndex]
      const offlineSinceHrs = row[offlineSinceIndex]
      const rnStatus = row[rnIndex]
      
      // Skip if no vehicle number
      if (!vehicleNumber || !vehicleNumber.toString().trim()) return
      
      // Count total devices (all vehicles with device)
      totalDevices++
      
      // Skip if no offline since data
      if (!offlineSinceHrs || !offlineSinceHrs.toString().trim()) return
      
      // Parse offline hours
      const offlineHours = parseFloat(offlineSinceHrs.toString().trim())
      if (isNaN(offlineHours)) return
      
      // CRITICAL: Only process if offline for 48+ hours (2+ days)
      if (offlineHours < 48) return
      
      const client = clientName && clientName.toString().trim() ? clientName.toString().trim() : 'Unknown'
      const vehicle = vehicleNumber.toString().trim()
      const rn = rnStatus ? rnStatus.toString().trim() : ''
      
      // Ignore #N/A clients
      if (client === '#N/A' || client.toLowerCase() === '#n/a') return
      
      // Count total offline (48+ hours)
      totalOffline++
      
      // Check if Not Running
      const isNotRunning = rn.toLowerCase() === 'not running'
      
      if (isNotRunning) {
        notRunningCount++
        
        // Count per client - Not Running
        if (!clientNotRunningCounts[client]) {
          clientNotRunningCounts[client] = 0
        }
        clientNotRunningCounts[client]++
        
        notRunningVehicles.push({
          client,
          vehicle,
          offlineHours,
          status: 'Not Running'
        })
      } else {
        // Camera Issue (offline but not "Not Running")
        cameraIssueCount++
        
        // Count per client - Camera Issue
        if (!clientCameraIssueCounts[client]) {
          clientCameraIssueCounts[client] = 0
        }
        clientCameraIssueCounts[client]++
        
        cameraIssueVehicles.push({
          client,
          vehicle,
          offlineHours,
          status: 'Camera Issue'
        })
      }
      
      // Count all offline vehicles per client
      if (!clientVehicleCounts[client]) {
        clientVehicleCounts[client] = 0
      }
      clientVehicleCounts[client]++
      
      vehicleDetails.push({
        client,
        vehicle,
        offlineHours,
        status: isNotRunning ? 'Not Running' : 'Camera Issue',
        rowNumber: rowIndex + 2
      })
    })

    console.log('Processing complete:', {
      totalDevices,
      totalOffline,
      notRunningCount,
      cameraIssueCount
    })

    // Convert to arrays and sort
    const clientBreakdown = Object.entries(clientVehicleCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([client, count]) => ({
        client,
        count,
        percentage: totalOffline > 0 ? parseFloat(((count / totalOffline) * 100).toFixed(1)) : 0,
        notRunning: clientNotRunningCounts[client] || 0,
        cameraIssue: clientCameraIssueCounts[client] || 0
      }))

    // Top 10 clients
    const top10Clients = clientBreakdown.slice(0, 10)

    // Not Running breakdown by client
    const notRunningBreakdown = Object.entries(clientNotRunningCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([client, count]) => ({
        client,
        count,
        percentage: notRunningCount > 0 ? parseFloat(((count / notRunningCount) * 100).toFixed(1)) : 0
      }))

    // Camera Issue breakdown by client
    const cameraIssueBreakdown = Object.entries(clientCameraIssueCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([client, count]) => ({
        client,
        count,
        percentage: cameraIssueCount > 0 ? parseFloat(((count / cameraIssueCount) * 100).toFixed(1)) : 0
      }))

    // Group vehicle details by client
    const clientVehicleDetails = {}
    vehicleDetails.forEach(detail => {
      if (!clientVehicleDetails[detail.client]) {
        clientVehicleDetails[detail.client] = []
      }
      clientVehicleDetails[detail.client].push({
        vehicle: detail.vehicle,
        offlineHours: detail.offlineHours,
        status: detail.status
      })
    })

    // Add vehicle lists to breakdown
    const detailedBreakdown = clientBreakdown.map(client => ({
      ...client,
      vehicles: clientVehicleDetails[client.client] || []
    }))

    return NextResponse.json({
      totalDevices,
      totalOffline,
      notRunningCount,
      cameraIssueCount,
      offlinePercentage: totalDevices > 0 ? parseFloat(((totalOffline / totalDevices) * 100).toFixed(1)) : 0,
      uniqueClients: Object.keys(clientVehicleCounts).length,
      top10Clients,
      allClients: detailedBreakdown,
      notRunningBreakdown,
      cameraIssueBreakdown,
      vehicleDetails,
      notRunningVehicles,
      cameraIssueVehicles,
      debug: {
        totalRowsProcessed: rows.length - 1,
        headers: headers,
        columnIndices: { vehicleNumberIndex, clientIndex, offlineSinceIndex, rnIndex },
        filterApplied: 'Only offline 48+ hours counted'
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
