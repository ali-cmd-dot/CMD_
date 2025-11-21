import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET2_ID
    
    console.log('🔍 Testing Sheet Connection...')
    console.log('API_KEY exists:', !!API_KEY)
    console.log('SHEET_ID:', SHEET_ID)
    
    if (!API_KEY || !SHEET_ID) {
      return NextResponse.json({ 
        error: 'Missing credentials',
        hasApiKey: !!API_KEY,
        hasSheetId: !!SHEET_ID,
        sheetId: SHEET_ID,
        message: '❌ Environment variables not found. Check .env.local file'
      }, { status: 400 })
    }

    // Test URL
    const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Issues-%20Realtime!A1:Z10?key=${API_KEY}`
    
    console.log('📡 Fetching from URL:', testUrl)
    
    const response = await fetch(testUrl)
    
    console.log('📥 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { rawError: errorText }
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch from Google Sheets',
        status: response.status,
        statusText: response.statusText,
        details: errorData,
        url: testUrl.replace(API_KEY, 'API_KEY_HIDDEN'),
        troubleshooting: {
          possibleIssues: [
            '1. Sheet might not be publicly accessible - Share with "Anyone with link can view"',
            '2. Tab name "Issues- Realtime" might be incorrect (check exact spelling and space)',
            '3. API key might be invalid or restricted',
            '4. Sheet ID might be wrong: ' + SHEET_ID
          ],
          nextSteps: [
            '1. Open Google Sheet and click Share → Anyone with link → Viewer',
            '2. Check exact tab name in bottom of Google Sheets (including spaces)',
            '3. Verify API key in Google Cloud Console',
            '4. Confirm Sheet ID from URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit'
          ]
        }
      }, { status: response.status })
    }
    
    const data = await response.json()
    const rows = data.values || []
    
    console.log('✅ Successfully fetched data')
    console.log('Total rows:', rows.length)
    
    // Get headers
    const headers = rows[0] || []
    
    // Get sample data (first 5 rows)
    const sampleData = rows.slice(0, 5)
    
    // Find all column indices
    let timestampRaisedIndex = -1
    let timestampResolvedIndex = -1
    let clientIndex = -1
    let issueIndex = -1
    
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      if (h === 'Timestamp Issues Raised') timestampRaisedIndex = index
      if (h === 'Timestamp Issues Resolved') timestampResolvedIndex = index
      if (h === 'Client' || h === 'client') clientIndex = index
      if (h === 'Issue' || h === 'issue') issueIndex = index
    })
    
    // Find all unique values in "Issue" column
    const allIssueTypes = []
    if (issueIndex >= 0) {
      rows.slice(1, 50).forEach(row => {
        if (row[issueIndex]) {
          allIssueTypes.push(row[issueIndex].toString().trim())
        }
      })
    }
    
    const uniqueIssueTypes = [...new Set(allIssueTypes)]
    const hasCustomerVideoRequest = uniqueIssueTypes.includes('Customer request for video')
    
    // Count occurrences
    const issueTypeCounts = {}
    allIssueTypes.forEach(type => {
      issueTypeCounts[type] = (issueTypeCounts[type] || 0) + 1
    })
    
    return NextResponse.json({
      success: true,
      message: '✅ Successfully connected to Google Sheet!',
      connection: {
        sheetId: SHEET_ID,
        tabName: 'Issues- Realtime',
        totalRows: rows.length,
        totalDataRows: rows.length - 1
      },
      columns: {
        headers: headers,
        totalColumns: headers.length,
        requiredColumns: {
          'Timestamp Issues Raised': timestampRaisedIndex >= 0 ? `✅ Found at index ${timestampRaisedIndex}` : '❌ Not found',
          'Timestamp Issues Resolved': timestampResolvedIndex >= 0 ? `✅ Found at index ${timestampResolvedIndex}` : '❌ Not found',
          'Client': clientIndex >= 0 ? `✅ Found at index ${clientIndex}` : '❌ Not found',
          'Issue': issueIndex >= 0 ? `✅ Found at index ${issueIndex}` : '❌ Not found'
        }
      },
      issueTypes: {
        found: issueIndex >= 0,
        columnIndex: issueIndex,
        uniqueTypes: uniqueIssueTypes,
        totalUniqueTypes: uniqueIssueTypes.length,
        counts: issueTypeCounts,
        hasCustomerVideoRequest: hasCustomerVideoRequest,
        customerVideoRequestCount: issueTypeCounts['Customer request for video'] || 0
      },
      sampleData: {
        headers: headers,
        firstFiveRows: sampleData.map((row, idx) => ({
          rowNumber: idx + 1,
          data: row,
          issueType: issueIndex >= 0 ? row[issueIndex] : 'N/A',
          client: clientIndex >= 0 ? row[clientIndex] : 'N/A'
        }))
      },
      analysis: {
        dataAvailable: rows.length > 1,
        columnsCorrect: timestampRaisedIndex >= 0 && clientIndex >= 0 && issueIndex >= 0,
        suggestion: hasCustomerVideoRequest 
          ? `✅ Found "${issueTypeCounts['Customer request for video']}" rows with "Customer request for video"` 
          : `⚠️ "Customer request for video" not found. Available types: ${uniqueIssueTypes.slice(0, 10).join(', ')}`
      },
      recommendations: hasCustomerVideoRequest ? [
        '✅ Everything looks good!',
        '✅ Sheet is accessible',
        '✅ All required columns found',
        '✅ "Customer request for video" data exists',
        '🚀 Your dashboard should work now!'
      ] : [
        '⚠️ Check if "Customer request for video" is the exact text in Issue column',
        '⚠️ Look at available issue types above',
        '⚠️ Make sure spelling and capitalization match exactly',
        '💡 You might need to update the filter in /api/issues/route.js'
      ]
    })

  } catch (error) {
    console.error('❌ Test API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test sheet connection',
        message: error.message,
        details: error.stack,
        troubleshooting: [
          '1. Check if your .env.local file exists',
          '2. Verify GOOGLE_SHEETS_API_KEY is set',
          '3. Verify NEXT_PUBLIC_SHEET2_ID is set',
          '4. Restart your development server after changing .env.local'
        ]
      },
      { status: 500 }
    )
  }
}
