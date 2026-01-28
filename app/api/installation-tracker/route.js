import { NextResponse } from 'next/server'

// CRITICAL: Disable caching for live data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET5_ID
    
    if (!API_KEY || !SHEET_ID) {
      throw new Error('Missing API key or Sheet ID for Installation Tracker')
    }

    // Fetch Installation Tracker sheet data
    const trackerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Installation Tracker!A:Z?key=${API_KEY}`
    
    console.log('Fetching installation tracker from:', trackerUrl)
    
    const trackerResponse = await fetch(trackerUrl, {
      cache: 'no-store'
    })
    
    if (!trackerResponse.ok) {
      throw new Error(`Failed to fetch installation tracker: ${trackerResponse.status}`)
    }
    
    const trackerData = await trackerResponse.json()
    const rows = trackerData.values || []
    
    console.log('Total rows received:', rows.length)
    
    if (rows.length < 2) {
      return NextResponse.json({ 
        error: 'No data found - headers should be in row 2',
        totalRows: rows.length 
      }, { status: 404 })
    }

    // Headers are in row 2 (index 1)
    const headers = rows[1]
    console.log('Headers from row 2:', headers)
    
    let locationIndex = -1

    // Search for Location column
    headers.forEach((header, index) => {
      if (!header) return
      const h = header.toString().trim()
      
      if (h === 'Location' || h.toLowerCase().includes('location')) {
        locationIndex = index
      }
    })

    console.log('Column index found:', { locationIndex })

    if (locationIndex === -1) {
      return NextResponse.json({ 
        error: 'Location column not found',
        headers: headers
      }, { status: 400 })
    }

    // City name normalization map for Indian cities
    const cityNormalizationMap = {
      // Major cities with common misspellings
      'mumbai': ['mumbai', 'bombay', 'mumabi', 'mubmai', 'mumby'],
      'delhi': ['delhi', 'new delhi', 'newdelhi', 'dilli', 'dehli'],
      'bengaluru': ['bengaluru', 'bangalore', 'bangaluru', 'banglore', 'bengalore', 'blr'],
      'kolkata': ['kolkata', 'calcutta', 'kolkatta', 'kolkota', 'kol'],
      'chennai': ['chennai', 'madras', 'chenai', 'chennai'],
      'hyderabad': ['hyderabad', 'hydrabad', 'hyd', 'hyedrabad'],
      'pune': ['pune', 'poona', 'puna', 'poone'],
      'ahmedabad': ['ahmedabad', 'amdavad', 'ahmadabad', 'ahmdabad'],
      'surat': ['surat', 'surrat', 'srat'],
      'jaipur': ['jaipur', 'jaypur', 'jypur'],
      'lucknow': ['lucknow', 'laknow', 'lucknaw'],
      'kanpur': ['kanpur', 'cawnpore', 'kanpore'],
      'nagpur': ['nagpur', 'nagpore', 'nagpur'],
      'indore': ['indore', 'indor', 'indaur'],
      'thane': ['thane', 'than', 'thane'],
      'bhopal': ['bhopal', 'bhopaal', 'bhopal'],
      'visakhapatnam': ['visakhapatnam', 'vizag', 'vishakhapatnam', 'vizag'],
      'pimpri-chinchwad': ['pimpri-chinchwad', 'pimpri chinchwad', 'pimpri'],
      'patna': ['patna', 'patna', 'patana'],
      'vadodara': ['vadodara', 'baroda', 'vadodra'],
      'ghaziabad': ['ghaziabad', 'ghaziabad', 'gaziabad'],
      'ludhiana': ['ludhiana', 'ludhiyana', 'ludiana'],
      'agra': ['agra', 'agrah', 'agra'],
      'nashik': ['nashik', 'nasik', 'nashick'],
      'faridabad': ['faridabad', 'faridabad', 'fridabad'],
      'meerut': ['meerut', 'meerut', 'mirat'],
      'rajkot': ['rajkot', 'rajkot', 'rajkote'],
      'kalyan-dombivli': ['kalyan-dombivli', 'kalyan dombivli', 'kalyan', 'dombivli'],
      'vasai-virar': ['vasai-virar', 'vasai virar', 'vasai'],
      'varanasi': ['varanasi', 'banaras', 'kashi', 'varansi'],
      'srinagar': ['srinagar', 'srinagar', 'shrinagar'],
      'aurangabad': ['aurangabad', 'aurangabad', 'aurangbad'],
      'dhanbad': ['dhanbad', 'dhanbad', 'danbad'],
      'amritsar': ['amritsar', 'amritsur', 'amritsar'],
      'navi mumbai': ['navi mumbai', 'navimumbai', 'navi-mumbai', 'new mumbai'],
      'allahabad': ['allahabad', 'prayagraj', 'allahbad', 'prayagraj'],
      'ranchi': ['ranchi', 'ranchi', 'ranchi'],
      'howrah': ['howrah', 'haora', 'howra'],
      'coimbatore': ['coimbatore', 'kovai', 'coimbatur'],
      'jabalpur': ['jabalpur', 'jubbulpore', 'jabalpur'],
      'gwalior': ['gwalior', 'gwalior', 'gwalior'],
      'vijayawada': ['vijayawada', 'vijayavada', 'vijayawada'],
      'jodhpur': ['jodhpur', 'jodhpur', 'jodhpore'],
      'madurai': ['madurai', 'madurai', 'madura'],
      'raipur': ['raipur', 'raipur', 'raipur'],
      'kota': ['kota', 'kota', 'kotah'],
      'chandigarh': ['chandigarh', 'chandighar', 'chandigarh'],
      'guwahati': ['guwahati', 'gauhati', 'guwahati'],
      'thiruvananthapuram': ['thiruvananthapuram', 'trivandrum', 'tvm'],
      'solapur': ['solapur', 'sholapur', 'solapore'],
      'tiruchirappalli': ['tiruchirappalli', 'trichy', 'trichinopoly', 'tiruchi'],
      'tiruppur': ['tiruppur', 'tirupur', 'tirupur'],
      'bareilly': ['bareilly', 'bareli', 'bareily'],
      'mysore': ['mysore', 'mysuru', 'mysore'],
      'salem': ['salem', 'salem', 'salem'],
      'gurgaon': ['gurgaon', 'gurugram', 'gurgoan'],
      'aligarh': ['aligarh', 'aligarh', 'aligar'],
      'jalandhar': ['jalandhar', 'jullundur', 'jalandhar'],
      'bhubaneswar': ['bhubaneswar', 'bhubaneshwar', 'bbsr'],
      'noida': ['noida', 'noida', 'noida'],
      'moradabad': ['moradabad', 'moradabad', 'muradabad'],
      'kochi': ['kochi', 'cochin', 'kochin'],
      'mangalore': ['mangalore', 'mangaluru', 'mangalore']
    }

    // Function to normalize city name
    const normalizeCityName = (cityName) => {
      if (!cityName) return null
      
      const cleaned = cityName.toString().trim().toLowerCase()
      
      // Check if it matches any normalized city
      for (const [normalizedCity, variants] of Object.entries(cityNormalizationMap)) {
        if (variants.some(variant => cleaned.includes(variant) || variant.includes(cleaned))) {
          return normalizedCity
        }
      }
      
      // If no match found, return cleaned name
      return cleaned
    }

    // Process data starting from row 3 (index 2)
    const cityCount = {}
    const cityDetails = []
    
    rows.slice(2).forEach((row, rowIndex) => {
      const location = row[locationIndex]
      
      // Skip if no location
      if (!location || !location.toString().trim()) return
      
      const normalizedCity = normalizeCityName(location)
      if (!normalizedCity) return
      
      // Count cities
      if (!cityCount[normalizedCity]) {
        cityCount[normalizedCity] = 0
      }
      cityCount[normalizedCity]++
      
      cityDetails.push({
        originalLocation: location.toString().trim(),
        normalizedCity: normalizedCity,
        rowNumber: rowIndex + 3
      })
    })

    console.log('Processing complete:', {
      totalLocations: cityDetails.length,
      uniqueCities: Object.keys(cityCount).length,
      topCities: Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
    })

    // Convert to arrays
    const citiesBreakdown = Object.entries(cityCount)
      .sort(([, a], [, b]) => b - a)
      .map(([city, count]) => ({
        city,
        count,
        percentage: cityDetails.length > 0 ? parseFloat(((count / cityDetails.length) * 100).toFixed(1)) : 0
      }))

    const totalInstallations = cityDetails.length
    const uniqueCities = Object.keys(cityCount).length

    return NextResponse.json({
      totalInstallations,
      uniqueCities,
      citiesBreakdown,
      cityDetails,
      cityCount,
      debug: {
        totalRowsProcessed: rows.length - 2,
        headers: headers,
        locationIndex: locationIndex
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching installation tracker data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
