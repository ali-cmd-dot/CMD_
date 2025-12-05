'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts'
import { 
  Activity, AlertTriangle, TrendingUp, Calendar, Users, Clock, Target,
  BarChart3, Video, Settings, CheckCircle2, XCircle, TrendingDown
} from 'lucide-react'

export default function Dashboard() {
  const [alertData, setAlertData] = useState(null)
  const [misalignmentData, setMisalignmentData] = useState(null)
  const [historicalVideoData, setHistoricalVideoData] = useState(null)
  const [generalIssuesData, setGeneralIssuesData] = useState(null)
  const [offlineVehiclesData, setOfflineVehiclesData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const addDebugInfo = (message, data = null) => {
    console.log(message, data)
    setDebugInfo(prev => [...prev, { message, data, time: new Date().toLocaleTimeString() }])
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo([])
    
    addDebugInfo('🚀 Starting to fetch all data...')
    
    try {
      const results = await Promise.allSettled([
        fetchAlertData(),
        fetchMisalignmentData(),
        fetchHistoricalVideoData(),
        fetchGeneralIssuesData(),
        fetchOfflineVehiclesData()
      ])

      const failed = results.filter(result => result.status === 'rejected')
      if (failed.length > 0) {
        addDebugInfo('⚠️ Some API calls failed', failed)
        console.warn('Some API calls failed:', failed)
      }
      
      addDebugInfo('✅ All fetch attempts completed')
    } catch (error) {
      addDebugInfo('❌ Error in fetchAllData', error)
      console.error('Error fetching data:', error)
      setError('Failed to load some data. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAlertData = async () => {
    try {
      addDebugInfo('📡 Fetching Alert Data from /api/alerts')
      const response = await fetch('/api/alerts')
      addDebugInfo(`📥 Alert Response Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugInfo('✅ Alert Data Received', { totalCount: data.totalCount, uniqueClients: data.uniqueClients })
        setAlertData(data)
      } else {
        const errorText = await response.text()
        addDebugInfo(`❌ Alert API failed: ${response.status}`, errorText)
        throw new Error(`Alert API failed: ${response.status}`)
      }
    } catch (error) {
      addDebugInfo('❌ Error fetching alert data', error.message)
      console.error('Error fetching alert data:', error)
      setAlertData({ 
        totalCount: 0, avgPerMonth: 0, uniqueClients: 0, 
        monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchMisalignmentData = async () => {
    try {
      addDebugInfo('📡 Fetching Misalignment Data from /api/misalignment')
      const response = await fetch('/api/misalignment')
      addDebugInfo(`📥 Misalignment Response Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugInfo('✅ Misalignment Data Received', { totalRaised: data.totalRaised, totalRectified: data.totalRectified })
        setMisalignmentData(data)
      } else {
        const errorText = await response.text()
        addDebugInfo(`❌ Misalignment API failed: ${response.status}`, errorText)
        throw new Error(`Misalignment API failed: ${response.status}`)
      }
    } catch (error) {
      addDebugInfo('❌ Error fetching misalignment data', error.message)
      console.error('Error fetching misalignment data:', error)
      setMisalignmentData({ 
        totalRaised: 0, totalRectified: 0, rectificationRate: 0, 
        monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchHistoricalVideoData = async () => {
    try {
      addDebugInfo('📡 Fetching Historical Video Data from /api/issues')
      const response = await fetch('/api/issues')
      addDebugInfo(`📥 Historical Video Response Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugInfo('✅ Historical Video Data Received', { totalRequests: data.totalRequests, totalDelivered: data.totalDelivered })
        setHistoricalVideoData(data)
      } else {
        const errorText = await response.text()
        addDebugInfo(`❌ Historical Video API failed: ${response.status}`, errorText)
        console.error('Historical Video API Error:', errorText)
        throw new Error(`Historical Video API failed: ${response.status}`)
      }
    } catch (error) {
      addDebugInfo('❌ Error fetching historical video data', error.message)
      console.error('Error fetching historical video data:', error)
      setHistoricalVideoData({ 
        totalRequests: 0, totalDelivered: 0, overallDeliveryRate: 0,
        avgDeliveryTime: 0, monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchGeneralIssuesData = async () => {
    try {
      addDebugInfo('📡 Fetching General Issues Data from /api/general-issues')
      const response = await fetch('/api/general-issues')
      addDebugInfo(`📥 General Issues Response Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugInfo('✅ General Issues Data Received', { totalRaised: data.totalRaised, totalResolved: data.totalResolved })
        setGeneralIssuesData(data)
      } else {
        const errorText = await response.text()
        addDebugInfo(`❌ General Issues API failed: ${response.status}`, errorText)
        console.error('General Issues API Error:', errorText)
        throw new Error(`General Issues API failed: ${response.status}`)
      }
    } catch (error) {
      addDebugInfo('❌ Error fetching general issues data', error.message)
      console.error('Error fetching general issues data:', error)
      setGeneralIssuesData({ 
        totalRaised: 0, totalResolved: 0, resolutionRate: 0,
        avgResolutionTime: 0, monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchOfflineVehiclesData = async () => {
    try {
      addDebugInfo('📡 Fetching Offline Vehicles Data from /api/offline-vehicles')
      const response = await fetch('/api/offline-vehicles')
      addDebugInfo(`📥 Offline Vehicles Response Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugInfo('✅ Offline Vehicles Data Received', { totalOfflineVehicles: data.totalOfflineVehicles, uniqueClients: data.uniqueClients })
        setOfflineVehiclesData(data)
      } else {
        const errorText = await response.text()
        addDebugInfo(`❌ Offline Vehicles API failed: ${response.status}`, errorText)
        console.error('Offline Vehicles API Error:', errorText)
        throw new Error(`Offline Vehicles API failed: ${response.status}`)
      }
    } catch (error) {
      addDebugInfo('❌ Error fetching offline vehicles data', error.message)
      console.error('Error fetching offline vehicles data:', error)
      setOfflineVehiclesData({ 
        totalOfflineVehicles: 0, uniqueClients: 0,
        top10Clients: [], allClientsBreakdown: [], vehiclesByClient: []
      })
    }
  }

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#14B8A6', '#F97316', '#84CC16', '#6366F1', '#8B5A2B', '#059669'
  ]

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'bg-blue-500', trend = null }) => (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{subtitle}</div>
          {trend && (
            <div className={`text-xs mt-1 flex items-center justify-end ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="ml-1">{trend.value}</span>
            </div>
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-3xl w-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Professional Dashboard...</div>
          <div className="text-gray-500 mt-2">Fetching live data from Google Sheets...</div>
          
          {/* Debug Info Display */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow text-left max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">🔍 Debug Log:</h3>
            <div className="space-y-1">
              {debugInfo.map((info, idx) => (
                <div key={idx} className="text-xs font-mono border-b pb-1">
                  <span className="text-gray-500">[{info.time}]</span> {info.message}
                  {info.data && (
                    <pre className="text-xs bg-gray-100 p-1 mt-1 rounded overflow-x-auto">
                      {typeof info.data === 'string' ? info.data : JSON.stringify(info.data, null, 2).substring(0, 300)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!alertData || !misalignmentData || !historicalVideoData || !generalIssuesData || !offlineVehiclesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl w-full">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Data Loading Error</div>
          <div className="text-gray-500 mt-2">Please check your API configuration and Sheet permissions</div>
          
          {/* Debug Info Display */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow text-left max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">🔍 Debug Log:</h3>
            {debugInfo.map((info, idx) => (
              <div key={idx} className="text-xs mb-2 font-mono border-b pb-2">
                <span className="text-gray-500">[{info.time}]</span> {info.message}
                {info.data && (
                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                    {typeof info.data === 'string' ? info.data : JSON.stringify(info.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
          
          <button 
            onClick={fetchAllData}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry Loading Data
          </button>
          
          <div className="mt-4">
            <a 
              href="/api/test-sheet" 
              target="_blank"
              className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              🔍 Test Sheet Connection
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Combine monthly data for overview with proper date sorting
  const combineMonthlyData = () => {
    const months = new Set([
      ...alertData.monthlyData.map(d => d.month),
      ...misalignmentData.monthlyData.map(d => d.month),
      ...historicalVideoData.monthlyData.map(d => d.month),
      ...generalIssuesData.monthlyData.map(d => d.month)
    ])

    return Array.from(months)
      .sort((a, b) => {
        const dateA = new Date(a.replace(' ', ' 1, '))
        const dateB = new Date(b.replace(' ', ' 1, '))
        return dateA - dateB
      })
      .map(month => {
        const alertMonth = alertData.monthlyData.find(d => d.month === month)
        const misalignMonth = misalignmentData.monthlyData.find(d => d.month === month)
        const videoMonth = historicalVideoData.monthlyData.find(d => d.month === month)
        const issueMonth = generalIssuesData.monthlyData.find(d => d.month === month)

        return {
          month,
          alerts: alertMonth?.total || 0,
          misalignments: misalignMonth?.raised || 0,
          videos: videoMonth?.requests || 0,
          issues: issueMonth?.raised || 0
        }
      })
  }

  const combinedMonthlyData = combineMonthlyData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="dashboard-gradient text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Professional Monitoring Dashboard</h1>
              <p className="text-blue-100">Real-time analytics from live Google Sheets data - Your complete monthly analysis</p>
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
            >
              {showDebug ? '🔍 Hide Debug' : '🔍 Show Debug'}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-yellow-200 text-sm">{error}</div>
          )}
        </div>
      </header>

      {/* Debug Panel */}
      {showDebug && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">🔍 Debug Information:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <strong>Alert Data:</strong> {alertData ? '✅ Loaded' : '❌ Missing'}
                {alertData && <span className="text-gray-600 ml-2">({alertData.totalCount} alerts)</span>}
              </div>
              <div>
                <strong>Misalignment Data:</strong> {misalignmentData ? '✅ Loaded' : '❌ Missing'}
                {misalignmentData && <span className="text-gray-600 ml-2">({misalignmentData.totalRaised} raised)</span>}
              </div>
              <div>
                <strong>Video Request Data:</strong> {historicalVideoData ? '✅ Loaded' : '❌ Missing'}
                {historicalVideoData && <span className="text-gray-600 ml-2">({historicalVideoData.totalRequests} requests)</span>}
              </div>
              <div>
                <strong>General Issues Data:</strong> {generalIssuesData ? '✅ Loaded' : '❌ Missing'}
                {generalIssuesData && <span className="text-gray-600 ml-2">({generalIssuesData.totalRaised} issues)</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Full Data State:', {
                    alertData,
                    misalignmentData,
                    historicalVideoData,
                    generalIssuesData
                  })
                  alert('Check browser console (F12) for detailed data')
                }}
                className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                📊 Log All Data to Console
              </button>
              <a 
                href="/api/test-sheet" 
                target="_blank"
                className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                🧪 Test Sheet API
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Monthly Overview', icon: BarChart3 },
            { id: 'alerts', label: 'Alert Tracking', icon: AlertTriangle },
            { id: 'misalignment', label: 'Misalignment Analysis', icon: Activity },
            { id: 'videos', label: 'Historical Videos', icon: Video },
            { id: 'issues', label: 'General Issues', icon: Settings },
            { id: 'offline', label: 'Offline Vehicles', icon: XCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-6">
        {/* Monthly Overview Section */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Executive Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Alerts"
                value={alertData.totalCount?.toLocaleString() || '0'}
                subtitle={`${alertData.uniqueClients || 0} clients affected`}
                icon={AlertTriangle}
                color="bg-red-500"
              />
              <MetricCard
                title="Misalignments"
                value={`${misalignmentData.totalRaised?.toLocaleString() || '0'} Raised`}
                subtitle={`${misalignmentData.totalRectified?.toLocaleString() || '0'} Rectified`}
                icon={Activity}
                color="bg-orange-500"
              />
              <MetricCard
                title="Video Requests"
                value={`${historicalVideoData.totalRequests?.toLocaleString() || '0'} Requests`}
                subtitle={`${historicalVideoData.totalDelivered?.toLocaleString() || '0'} Delivered`}
                icon={Video}
                color="bg-purple-500"
              />
              <MetricCard
                title="General Issues"
                value={`${generalIssuesData.totalRaised?.toLocaleString() || '0'} Raised`}
                subtitle={`${generalIssuesData.totalResolved?.toLocaleString() || '0'} Resolved`}
                icon={Settings}
                color="bg-green-500"
              />
            </div>

            {/* Combined Monthly Trends Chart */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 text-blue-600" />
                Monthly Performance Overview - All Categories
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={combinedMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="alerts" fill="#EF4444" name="Alerts" />
                  <Bar yAxisId="left" dataKey="misalignments" fill="#F59E0B" name="Misalignments" />
                  <Line yAxisId="right" type="monotone" dataKey="videos" stroke="#8B5CF6" strokeWidth={3} name="Video Requests" />
                  <Line yAxisId="right" type="monotone" dataKey="issues" stroke="#10B981" strokeWidth={3} name="General Issues" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resolution Performance */}
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Resolution Performance Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Video Delivery Performance</div>
                      <div className="text-sm text-gray-600">Average: {historicalVideoData.avgDeliveryTime}h</div>
                      <div className="text-xs text-gray-500">Range: {historicalVideoData.fastestDeliveryTime}h - {historicalVideoData.slowestDeliveryTime}h</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{historicalVideoData.overallDeliveryRate}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">General Issue Resolution</div>
                      <div className="text-sm text-gray-600">Average: {generalIssuesData.avgResolutionTime}</div>
                      <div className="text-xs text-gray-500">Median: {generalIssuesData.medianResolutionTime}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{generalIssuesData.resolutionRate}%</div>
                      <div className="text-sm text-gray-600">Resolution Rate</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium">Misalignment Rectification</div>
                      <div className="text-sm text-gray-600">Monthly avg raised: {misalignmentData.avgRaisedPerMonth}</div>
                      <div className="text-xs text-gray-500">Monthly avg fixed: {misalignmentData.avgRectifiedPerMonth}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{misalignmentData.rectificationRate}%</div>
                      <div className="text-sm text-gray-600">Fix Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Clients by Total Activity */}
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Top Clients by Total Activity</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[
                    ...alertData.clientBreakdown.map(c => ({ ...c, type: 'alerts', value: c.count })),
                    ...misalignmentData.clientBreakdown.map(c => ({ ...c, type: 'misalignments', value: c.raised }))
                  ]
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 12)
                    .map((client, index) => (
                    <div key={`${client.client}-${client.type}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{client.client}</div>
                        <div className="text-sm text-gray-600">
                          {client.value} {client.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{client.percentage}%</div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          client.type === 'alerts' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {client.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Tracking Section */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Alerts"
                value={alertData.totalCount?.toLocaleString() || '0'}
                subtitle="Excluding 'No L2 alerts'"
                icon={AlertTriangle}
                color="bg-red-500"
              />
              <MetricCard
                title="Monthly Average"
                value={alertData.avgPerMonth?.toFixed(1) || '0'}
                subtitle="Alerts per month"
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <MetricCard
                title="Active Clients"
                value={alertData.uniqueClients || '0'}
                subtitle="Unique clients with alerts"
                icon={Users}
                color="bg-green-500"
              />
              <MetricCard
                title="Latest Month"
                value={alertData.monthlyData?.[alertData.monthlyData?.length - 1]?.total || '0'}
                subtitle={alertData.monthlyData?.[alertData.monthlyData?.length - 1]?.month || 'N/A'}
                icon={Calendar}
                color="bg-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Alert Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alertData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#EF4444" name="Total Alerts" />
                    <Bar dataKey="clients" fill="#10B981" name="Active Clients" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">All Clients Alert Distribution</h3>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Client Name</th>
                        <th className="px-3 py-2 text-center">Count</th>
                        <th className="px-3 py-2 text-center">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alertData.clientBreakdown?.map((client, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">{client.client}</td>
                          <td className="px-3 py-2 text-center">{client.count}</td>
                          <td className="px-3 py-2 text-center">{client.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Misalignment Analysis Section */}
        {activeTab === 'misalignment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Total Raised"
                value={misalignmentData.totalRaised?.toLocaleString() || '0'}
                subtitle="Misalignments raised"
                icon={AlertTriangle}
                color="bg-red-500"
              />
              <MetricCard
                title="Total Rectified"
                value={misalignmentData.totalRectified?.toLocaleString() || '0'}
                subtitle="Misalignments fixed"
                icon={CheckCircle2}
                color="bg-green-500"
              />
              <MetricCard
                title="Rectification Rate"
                value={`${misalignmentData.rectificationRate || 0}%`}
                subtitle="Overall success rate"
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <MetricCard
                title="Monthly Raised Avg"
                value={misalignmentData.avgRaisedPerMonth?.toFixed(1) || '0'}
                subtitle="Average per month"
                icon={Calendar}
                color="bg-orange-500"
              />
              <MetricCard
                title="Affected Clients"
                value={misalignmentData.uniqueClients || '0'}
                subtitle="Unique clients"
                icon={Users}
                color="bg-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Misalignment Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={misalignmentData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="raised" fill="#EF4444" name="Raised" />
                    <Bar yAxisId="left" dataKey="rectified" fill="#10B981" name="Rectified" />
                    <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#8B5CF6" strokeWidth={2} name="Active Clients" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Client Misalignment Performance</h3>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left">Client</th>
                        <th className="px-2 py-2 text-center">Raised</th>
                        <th className="px-2 py-2 text-center">Fixed</th>
                        <th className="px-2 py-2 text-center">Rate%</th>
                        <th className="px-2 py-2 text-center">Share%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misalignmentData.clientBreakdown?.map((client, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2 font-medium text-xs">{client.client}</td>
                          <td className="px-2 py-2 text-center">{client.raised}</td>
                          <td className="px-2 py-2 text-center">{client.rectified}</td>
                          <td className="px-2 py-2 text-center">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              client.rectificationRate > 70 
                                ? 'bg-green-100 text-green-800' 
                                : client.rectificationRate > 40 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {client.rectificationRate}%
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center">{client.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Vehicle Repeat Analysis */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Most Repeated Misaligned Vehicles by Month</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {misalignmentData.monthlyData?.map((month, index) => (
                  <div key={index}>
                    <h4 className="font-medium mb-3">{month.month} - Top Vehicle Repeats</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {month.vehicleRepeats?.slice(0, 8).map((vehicle, vIndex) => (
                        <div key={vIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{vehicle.vehicle}</div>
                            <div className="text-xs text-gray-600">{vehicle.client}</div>
                          </div>
                          <div className="text-right">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                              {vehicle.repeats} times
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historical Videos Section */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Total Requests"
                value={historicalVideoData.totalRequests?.toLocaleString() || '0'}
                subtitle="Video requests"
                icon={Video}
                color="bg-purple-500"
              />
              <MetricCard
                title="Videos Delivered"
                value={historicalVideoData.totalDelivered?.toLocaleString() || '0'}
                subtitle={`${historicalVideoData.overallDeliveryRate}% success`}
                icon={CheckCircle2}
                color="bg-green-500"
              />
              <MetricCard
                title="Average Time"
                value={`${historicalVideoData.avgDeliveryTime}h`}
                subtitle="Delivery time"
                icon={Clock}
                color="bg-blue-500"
              />
              <MetricCard
                title="Fastest Delivery"
                value={`${historicalVideoData.fastestDeliveryMinutes || 0}min`}
                subtitle="Best performance"
                icon={TrendingUp}
                color="bg-green-600"
              />
              <MetricCard
                title="Slowest Delivery"
                value={`${historicalVideoData.slowestDeliveryTime}h`}
                subtitle="Worst performance"
                icon={XCircle}
                color="bg-red-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Video Request Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={historicalVideoData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="requests" fill="#8B5CF6" name="Requests" />
                    <Bar yAxisId="left" dataKey="delivered" fill="#10B981" name="Delivered" />
                    <Line yAxisId="right" type="monotone" dataKey="avgDeliveryTime" stroke="#F59E0B" strokeWidth={3} name="Avg Time (h)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Client Video Performance</h3>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left">Client</th>
                        <th className="px-2 py-2 text-center">Req</th>
                        <th className="px-2 py-2 text-center">Del</th>
                        <th className="px-2 py-2 text-center">Rate%</th>
                        <th className="px-2 py-2 text-center">Avg(h)</th>
                        <th className="px-2 py-2 text-center">Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalVideoData.clientBreakdown?.map((client, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2 font-medium text-xs">{client.client}</td>
                          <td className="px-2 py-2 text-center">{client.requests}</td>
                          <td className="px-2 py-2 text-center">{client.delivered}</td>
                          <td className="px-2 py-2 text-center">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              client.deliveryRate > 80 
                                ? 'bg-green-100 text-green-800' 
                                : client.deliveryRate > 60 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {client.deliveryRate}%
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center">{client.avgDeliveryTime}</td>
                          <td className="px-2 py-2 text-center text-xs">
                            {client.fastestDelivery}h-{client.slowestDelivery}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Issues Section */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Total Raised"
                value={generalIssuesData.totalRaised?.toLocaleString() || '0'}
                subtitle="Issues raised"
                icon={AlertTriangle}
                color="bg-red-500"
              />
              <MetricCard
                title="Total Resolved"
                value={generalIssuesData.totalResolved?.toLocaleString() || '0'}
                subtitle="Issues resolved"
                icon={CheckCircle2}
                color="bg-green-500"
              />
              <MetricCard
                title="Resolution Rate"
                value={`${generalIssuesData.resolutionRate}%`}
                subtitle="Success rate"
                icon={Target}
                color="bg-blue-500"
              />
              <MetricCard
                title="Avg Resolution"
                value={generalIssuesData.avgResolutionTime || '0h'}
                subtitle="Time to resolve"
                icon={Clock}
                color="bg-purple-500"
              />
              <MetricCard
                title="Median Time"
                value={generalIssuesData.medianResolutionTime || '0h'}
                subtitle="Typical resolution"
                icon={TrendingUp}
                color="bg-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Issues Overview</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={generalIssuesData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="raised" fill="#EF4444" name="Raised" />
                    <Bar yAxisId="left" dataKey="resolved" fill="#10B981" name="Resolved" />
                    <Line yAxisId="right" type="monotone" dataKey="avgTimeHours" stroke="#8B5CF6" strokeWidth={3} name="Avg Time (h)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Client Issue Performance</h3>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left">Client</th>
                        <th className="px-2 py-2 text-center">Raised</th>
                        <th className="px-2 py-2 text-center">Resolved</th>
                        <th className="px-2 py-2 text-center">Rate%</th>
                        <th className="px-2 py-2 text-center">Avg Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generalIssuesData.clientBreakdown?.map((client, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2 font-medium text-xs">{client.client}</td>
                          <td className="px-2 py-2 text-center">{client.raised}</td>
                          <td className="px-2 py-2 text-center">{client.resolved}</td>
                          <td className="px-2 py-2 text-center">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              client.resolutionRate > 80 
                                ? 'bg-green-100 text-green-800' 
                                : client.resolutionRate > 60 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {client.resolutionRate}%
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center text-xs">{client.avgTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Complete Monthly Breakdown */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">📊 Complete Monthly Issues Analysis</h3>
                <div className="text-sm bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-blue-800">Total Issues: {generalIssuesData.totalRaised?.toLocaleString()}</span>
                  <span className="text-blue-600 ml-2">| Resolved: {generalIssuesData.totalResolved?.toLocaleString()} ({generalIssuesData.resolutionRate}%)</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold">Month</th>
                      <th className="px-3 py-3 text-center font-semibold text-red-600">📈 Raised</th>
                      <th className="px-3 py-3 text-center font-semibold text-green-600">✅ Same Month</th>
                      <th className="px-3 py-3 text-center font-semibold text-purple-600">🔄 Later</th>
                      <th className="px-3 py-3 text-center font-semibold text-blue-600">⬅️ Previous</th>
                      <th className="px-3 py-3 text-center font-semibold text-orange-600">⏳ Pending</th>
                      <th className="px-3 py-3 text-center font-semibold text-gray-600">🎯 Rate%</th>
                      <th className="px-3 py-3 text-center font-semibold text-indigo-600">⏱️ Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalIssuesData.monthlyData?.map((month, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-3 font-medium flex items-center">
                          {month.month}
                          {month.isCurrentMonth && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CURRENT</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                            {month.raised}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            {month.resolvedSameMonth}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.resolvedLaterMonths > 0 ? (
                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                              {month.resolvedLaterMonths}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.carryForwardIn > 0 ? (
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                              {month.carryForwardIn}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.stillPending > 0 ? (
                            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                              {month.stillPending}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.resolutionRate !== null ? (
                            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                              month.resolutionRate >= 80 
                                ? 'bg-green-100 text-green-800' 
                                : month.resolutionRate >= 60 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {month.resolutionRate}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">TBD</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.avgTime !== '0h' ? (
                            <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                              {month.avgTime}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Offline Vehicles Section */}
        {activeTab === 'offline' && (
          <div className="space-y-6">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-xl shadow-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <XCircle size={48} className="mb-4 opacity-80" />
                    <h2 className="text-5xl font-bold mb-2">{offlineVehiclesData.totalOfflineVehicles?.toLocaleString() || '0'}</h2>
                    <p className="text-xl opacity-90">Total Offline Vehicles</p>
                    <p className="text-sm opacity-75 mt-2">Real-time count from live data</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                      <Users size={32} className="mb-2" />
                      <div className="text-2xl font-bold">{offlineVehiclesData.uniqueClients || '0'}</div>
                      <div className="text-sm opacity-90">Clients</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Client Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-xl shadow-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <TrendingUp size={48} className="mb-4 opacity-80" />
                    <h2 className="text-3xl font-bold mb-2">
                      {offlineVehiclesData.top10Clients?.[0]?.client || 'N/A'}
                    </h2>
                    <p className="text-xl opacity-90">Top Client</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="text-3xl font-bold">{offlineVehiclesData.top10Clients?.[0]?.count || '0'}</div>
                        <div className="text-xs opacity-90">Vehicles</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="text-3xl font-bold">{offlineVehiclesData.top10Clients?.[0]?.percentage || '0'}%</div>
                        <div className="text-xs opacity-90">Share</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 10 Clients Bar Chart */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <BarChart3 className="mr-3 text-red-600" size={28} />
                Top 10 Clients with Offline Vehicles
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={offlineVehiclesData.top10Clients || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="client" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#EF4444" name="Offline Vehicles" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 10 Table */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Target className="mr-2 text-orange-600" />
                Top 10 Clients - Detailed View
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-red-50 to-orange-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Client Name</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Offline Vehicles</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Percentage</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offlineVehiclesData.top10Clients?.map((client, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{client.client}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">
                            {client.count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-orange-600">{client.percentage}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            client.percentage > 20 ? 'bg-red-100 text-red-800' : 
                            client.percentage > 10 ? 'bg-orange-100 text-orange-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.percentage > 20 ? '🔴 Critical' : 
                             client.percentage > 10 ? '🟠 High' : '🟡 Medium'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed View - All Clients */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <Activity className="mr-2 text-blue-600" />
                  Complete Client Breakdown - All Clients
                </h3>
                <div className="text-sm bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="font-semibold text-blue-800">
                    Total: {offlineVehiclesData.allClientsBreakdown?.length || 0} Clients
                  </span>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">#</th>
                      <th className="px-3 py-2 text-left font-semibold">Client Name</th>
                      <th className="px-3 py-2 text-center font-semibold">Count</th>
                      <th className="px-3 py-2 text-center font-semibold">Share %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offlineVehiclesData.allClientsBreakdown?.map((client, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                        <td className="px-3 py-2 font-medium">{client.client}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="bg-red-50 text-red-700 px-2 py-1 rounded font-medium">
                            {client.count}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center text-orange-600 font-medium">
                          {client.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vehicle Details by Client */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Video className="mr-2 text-purple-600" />
                Vehicle Numbers by Client - Complete Details
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {offlineVehiclesData.vehiclesByClient?.map((clientData, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{clientData.client}</h4>
                        <p className="text-sm text-gray-600">Offline Vehicles</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-600">{clientData.count}</div>
                        <div className="text-xs text-gray-500">vehicles</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clientData.vehicles?.map((vehicle, vIndex) => (
                        <span 
                          key={vIndex}
                          className="bg-gradient-to-r from-red-50 to-orange-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200"
                        >
                          {vehicle}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
