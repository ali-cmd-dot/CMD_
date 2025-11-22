import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET2_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID')
    }

    const issuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Issues-%20Realtime!A:Z?key=${API_KEY}`
    
    const issuesResponse = await fetch(issuesUrl, { cache: 'no-store' })
    
    if (!issuesResponse.ok) {
      throw new Error(`Failed to fetch issues data: ${issuesResponse.status}`)
    }
    
    const issuesData = await issuesResponse.json()
    const rows = issuesData.values || []
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const headers = rows[0]
    let timestampRaisedIndex = -1
    let timestampResolvedIndex = -1
    
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      if (h === 'Timestamp Issues Raised') {
        timestampRaisedIndex = index
      }
      if (h === 'Timestamp Issues Resolved') {
        timestampResolvedIndex = index
      }
    })

    const today = new Date()
    const futureDates = []
    const validDates = []
    const invalidDates = []
    
    rows.slice(1, 100).forEach((row, idx) => {
      const raisedStr = row[timestampRaisedIndex]
      const resolvedStr = row[timestampResolvedIndex]
      
      if (raisedStr) {
        const parsed = parseTimestamp(raisedStr)
        
        if (!parsed) {
          invalidDates.push({
            rowNumber: idx + 2,
            type: 'raised',
            original: raisedStr,
            reason: 'Could not parse'
          })
        } else if (parsed > today) {
          futureDates.push({
            rowNumber: idx + 2,
            type: 'raised',
            original: raisedStr,
            parsed: parsed.toISOString(),
            daysInFuture: Math.ceil((parsed - today) / (1000 * 60 * 60 * 24))
          })
        } else {
          validDates.push({
            rowNumber: idx + 2,
            type: 'raised',
            original: raisedStr,
            parsed: parsed.toISOString()
          })
        }
      }
      
      if (resolvedStr) {
        const parsed = parseTimestamp(resolvedStr)
        
        if (!parsed) {
          invalidDates.push({
            rowNumber: idx + 2,
            type: 'resolved',
            original: resolvedStr,
            reason: 'Could not parse'
          })
        } else if (parsed > today) {
          futureDates.push({
            rowNumber: idx + 2,
            type: 'resolved',
            original: resolvedStr,
            parsed: parsed.toISOString(),
            daysInFuture: Math.ceil((parsed - today) / (1000 * 60 * 60 * 24))
          })
        }
      }
    })

    return NextResponse.json({
      today: today.toISOString(),
      summary: {
        totalRowsChecked: Math.min(rows.length - 1, 100),
        futureDatesFound: futureDates.length,
        invalidDatesFound: invalidDates.length,
        validDatesFound: validDates.length
      },
      futureDates: futureDates.sort((a, b) => b.daysInFuture - a.daysInFuture),
      invalidDates: invalidDates,
      validDatesSample: validDates.slice(0, 10),
      recommendation: futureDates.length > 0 
        ? `⚠️ Found ${futureDates.length} future dates! Check your Google Sheet for incorrect date entries.`
        : '✅ No future dates found. All dates are valid!',
      instructions: [
        '1. Open your Google Sheet',
        '2. Find the rows mentioned in futureDates array',
        '3. Correct the dates to current or past dates',
        '4. Refresh your dashboard'
      ]
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error in debug-dates:', error)
    return NextResponse.json(
      { error: 'Failed to debug dates', details: error.message },
      { status: 500 }
    )
  }
}

function parseTimestamp(timestampStr) {
  if (!timestampStr) return null
  
  const str = timestampStr.toString().trim()
  if (!str) return null
  
  try {
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
