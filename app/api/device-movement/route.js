import { NextResponse } from 'next/server'

// Disable caching for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET4_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID for Device Movement')
    }

    // Fetch Device Movement sheet data
    const deviceUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Device Movement!A:Z?key=${API_KEY}`
    
    console.log('Fetching device movement from:', deviceUrl)
    
    const deviceResponse = await fetch(deviceUrl, {
      cache: 'no-store'
    })
    
    if (!deviceResponse.ok) {
      throw new Error(`Failed to fetch device movement: ${deviceResponse.status}`)
    }
    
    const deviceData = await deviceResponse.json()
    const rows = deviceData.values || []
    
    console.log('Total rows received:', rows.length)
    
    if (rows.length < 3) {
      return NextResponse.json({ 
        error: 'No data found - headers should be in row 2',
        totalRows: rows.length 
      }, { status: 404 })
    }

    // Headers are in row 2 (index 1)
    const headers = rows[1]
    console.log('Headers from row 2:', headers)
    
    let deviceRegNumberIndex = -1
    let returnCommentsIndex = -1
    let installationDateIndex = -1
    let vehicleNumberIndex = -1
    let statusIndex = -1

    // Search for column indices - UPDATED COLUMNS
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      // Column D - Device Registration Number
      if (h === 'Device Registration Number' || h.toLowerCase().includes('device registration')) {
        deviceRegNumberIndex = index
      }
      // Column P - Return Comments
      if (h === 'Return Comments' || h.toLowerCase().includes('return comment')) {
        returnCommentsIndex = index
      }
      // Column L - Installation Date
      if (h === 'Installation Date' || h.toLowerCase().includes('installation date')) {
        installationDateIndex = index
      }
      // Column K - Vehicle Number
      if (h === 'Vehicle Number' || h.toLowerCase().includes('vehicle number')) {
        vehicleNumberIndex = index
      }
      // Column O - Status
      if (h === 'Status' || h === 'status') {
        statusIndex = index
      }
    })

    console.log('Column indices found:', {
      deviceRegNumberIndex,
      returnCommentsIndex,
      installationDateIndex,
      vehicleNumberIndex,
      statusIndex
    })

    if (deviceRegNumberIndex === -1 || statusIndex === -1) {
      return NextResponse.json({ 
        error: 'Required columns not found',
        missingColumns: {
          deviceRegNumber: deviceRegNumberIndex === -1 ? 'Missing "Device Registration Number"' : 'Found',
          status: statusIndex === -1 ? 'Missing "Status"' : 'Found'
        },
        headers: headers
      }, { status: 400 })
    }

    // Process data starting from row 3 (index 2)
    let totalDevices = 0
    let deployedCount = 0
    let availableCount = 0
    let underRepairCount = 0
    let damagedCount = 0
    
    const monthlyDeployments = {}
    const deviceDetails = []

    rows.slice(2).forEach((row, rowIndex) => {
      const deviceRegNumber = row[deviceRegNumberIndex]
      const status = row[statusIndex]
      const returnComment = returnCommentsIndex >= 0 ? row[returnCommentsIndex] : ''
      const installationDate = installationDateIndex >= 0 ? row[installationDateIndex] : ''
      const vehicleNumber = vehicleNumberIndex >= 0 ? row[vehicleNumberIndex] : ''
      
      // Skip if no device registration number
      if (!deviceRegNumber || !deviceRegNumber.toString().trim()) return
      
      totalDevices++
      
      const deviceStatus = status ? status.toString().trim() : ''
      const device = deviceRegNumber.toString().trim()
      
      // Count by Status column (Column O)
      if (deviceStatus === 'Deployed') {
        deployedCount++
        
        // Track monthly deployments
        if (installationDate && installationDateIndex >= 0) {
          const month = parseInstallationMonth(installationDate)
          if (month) {
            if (!monthlyDeployments[month]) {
              monthlyDeployments[month] = 0
            }
            monthlyDeployments[month]++
          }
        }
      } else if (deviceStatus === 'Under Repair') {
        underRepairCount++
      } else if (deviceStatus === 'Device Damaged') {
        damagedCount++
      } else {
        // Any other status counts as available
        availableCount++
      }
      
      // Store device details
      deviceDetails.push({
        device,
        status: deviceStatus || 'Unknown',
        returnComment: returnComment ? returnComment.toString().trim() : 'N/A',
        installationDate: installationDate ? installationDate.toString().trim() : 'N/A',
        vehicleNumber: vehicleNumber ? vehicleNumber.toString().trim() : 'N/A',
        rowNumber: rowIndex + 3
      })
    })

    console.log('Processing complete:', {
      totalDevices,
      deployedCount,
      availableCount,
      underRepairCount,
      damagedCount
    })

    // Convert monthly deployments to array and sort
    const monthlyData = Object.entries(monthlyDeployments)
      .sort(([a], [b]) => {
        const dateA = new Date(a.replace(' ', ' 1, '))
        const dateB = new Date(b.replace(' ', ' 1, '))
        return dateA - dateB
      })
      .map(([month, count]) => ({
        month,
        deployed: count
      }))

    // Calculate percentages
    const deployedPercentage = totalDevices > 0 ? parseFloat(((deployedCount / totalDevices) * 100).toFixed(1)) : 0
    const availablePercentage = totalDevices > 0 ? parseFloat(((availableCount / totalDevices) * 100).toFixed(1)) : 0
    const underRepairPercentage = totalDevices > 0 ? parseFloat(((underRepairCount / totalDevices) * 100).toFixed(1)) : 0
    const damagedPercentage = totalDevices > 0 ? parseFloat(((damagedCount / totalDevices) * 100).toFixed(1)) : 0

    return NextResponse.json({
      totalDevices,
      deployedCount,
      deployedPercentage,
      availableCount,
      availablePercentage,
      underRepairCount,
      underRepairPercentage,
      damagedCount,
      damagedPercentage,
      monthlyData,
      deviceDetails,
      debug: {
        totalRowsProcessed: rows.length - 2,
        headers: headers,
        columnIndices: { 
          deviceRegNumberIndex, 
          returnCommentsIndex, 
          installationDateIndex, 
          vehicleNumberIndex,
          statusIndex 
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching device movement data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

function parseInstallationMonth(dateStr) {
  if (!dateStr) return null
  
  const str = dateStr.toString().trim()
  if (!str || str === 'N/A' || str === '-') return null
  
  try {
    // Handle DD/MM/YYYY format
    if (str.includes('/')) {
      const parts = str.split('/')
      if (parts.length >= 2) {
        const month = parseInt(parts[1]) - 1
        const year = parseInt(parts[2]) || new Date().getFullYear()
        
        const date = new Date(year, month, 1)
        return getMonthYear(date)
      }
    }
    
    // Handle DD-MM-YYYY format
    if (str.includes('-')) {
      const parts = str.split('-')
      if (parts.length >= 2) {
        const month = parseInt(parts[1]) - 1
        const year = parseInt(parts[2]) || new Date().getFullYear()
        
        const date = new Date(year, month, 1)
        return getMonthYear(date)
      }
    }
    
    return null
  } catch (e) {
    console.error('Error parsing installation date:', str, e)
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
