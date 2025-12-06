'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts'
import { 
  Activity, AlertTriangle, TrendingUp, Calendar, Users, Clock, Target,
  BarChart3, Video, Settings, CheckCircle2, XCircle, TrendingDown, WifiOff, Truck, Wifi
} from 'lucide-react'

export default function Dashboard() {
  const [alertData, setAlertData] = useState(null)
  const [misalignmentData, setMisalignmentData] = useState(null)
  const [historicalVideoData, setHistoricalVideoData] = useState(null)
  const [generalIssuesData, setGeneralIssuesData] = useState(null)
  const [offlineVehiclesData, setOfflineVehiclesData] = useState(null)
  const [deviceMovementData, setDeviceMovementData] = useState(null)
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
        fetchOfflineVehiclesData(),
        fetchDeviceMovementData()
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
        addDebugInfo('✅ Offline Vehicles Data Received', { totalOffline: data.totalOfflineVehicles })
        setOfflineVehiclesData(data)
      } else {
        const errorText = await response.text()
        addDebugInfo(`❌ Offline Vehicles API failed: ${response.status}`, errorText)
        throw new Error(`Offline Vehicles API failed: ${response.status}`)
      }
    } catch (error) {
      addDebugInfo('❌ Error fetching offline vehicles data', error.message)
      console.error('Error fetching offline vehicles data:', error)
      setOfflineVehiclesData({ 
        totalOfflineVehicles: 0, uniqueClients: 0, top10Clients: [], allClients: [] 
      })
    }
  }

  const fetchDeviceMovementData = async () => {
    try {
      addDebugInfo('📡 Fetching Device Movement Data from /api/device-movement')
      const response = await fetch('/api/device-movement')
      addDebugInfo(`📥 Device Movement Response Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugInfo('✅ Device Movement Data Received', { totalDevices: data.totalDevices })
        setDeviceMovementData(data)
      } else {
        const errorText = await response.text()
        addDebugInfo(`❌ Device Movement API failed: ${response.status}`, errorText)
        throw new Error(`Device Movement API failed: ${response.status}`)
      }
    } catch (error) {
      addDebugInfo('❌ Error fetching device movement data', error.message)
      console.error('Error fetching device movement data:', error)
      setDeviceMovementData({ 
        totalDevices: 0, deployedCount: 0, availableCount: 0, underRepairCount: 0, 
        damagedCount: 0, deployedPercentage: 0, availablePercentage: 0, 
        underRepairPercentage: 0, damagedPercentage: 0, monthlyData: [], deviceDetails: [] 
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

  if (!alertData || !misalignmentData || !historicalVideoData || !generalIssuesData || !offlineVehiclesData || !deviceMovementData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl w-full">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Data Loading Error</div>
          <div className="text-gray-500 mt-2">Please check your API configuration and Sheet permissions</div>
          
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
      <header className="dashboard-gradient text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">CAUTIO COMMAND CENTER MONITORING DASHBOARD</h1>
              <p className="text-blue-100">Real-time analytics from live Google Sheets data</p>
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
            >
              {showDebug ? '🔍 Hide Debug' : '🔍 Show Debug'}
            </button>
          </div>
        </div>
      </header>

      {showDebug && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">🔍 Debug Information:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><strong>Alert Data:</strong> {alertData ? '✅' : '❌'}</div>
              <div><strong>Misalignment:</strong> {misalignmentData ? '✅' : '❌'}</div>
              <div><strong>Videos:</strong> {historicalVideoData ? '✅' : '❌'}</div>
              <div><strong>Issues:</strong> {generalIssuesData ? '✅' : '❌'}</div>
              <div><strong>Offline:</strong> {offlineVehiclesData ? '✅' : '❌'}</div>
              <div><strong>Devices:</strong> {deviceMovementData ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'misalignment', label: 'Misalignment', icon: Activity },
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'issues', label: 'Issues', icon: Settings },
            { id: 'offline', label: 'Offline Vehicles', icon: WifiOff },
            { id: 'devices', label: 'Device Movement', icon: Truck }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                activeTab === tab.id ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Total Alerts" value={alertData.totalCount?.toLocaleString() || '0'} subtitle={`${alertData.uniqueClients || 0} clients`} icon={AlertTriangle} color="bg-red-500" />
              <MetricCard title="Misalignments" value={`${misalignmentData.totalRaised?.toLocaleString() || '0'}`} subtitle={`${misalignmentData.totalRectified || 0} Fixed`} icon={Activity} color="bg-orange-500" />
              <MetricCard title="Video Requests" value={`${historicalVideoData.totalRequests?.toLocaleString() || '0'}`} subtitle={`${historicalVideoData.totalDelivered || 0} Delivered`} icon={Video} color="bg-purple-500" />
              <MetricCard title="General Issues" value={`${generalIssuesData.totalRaised?.toLocaleString() || '0'}`} subtitle={`${generalIssuesData.totalResolved || 0} Resolved`} icon={Settings} color="bg-green-500" />
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Monthly Overview</h3>
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
                  <Line yAxisId="right" type="monotone" dataKey="videos" stroke="#8B5CF6" strokeWidth={3} name="Videos" />
                  <Line yAxisId="right" type="monotone" dataKey="issues" stroke="#10B981" strokeWidth={3} name="Issues" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard title="Total" value={alertData.totalCount?.toLocaleString()} subtitle="Alerts" icon={AlertTriangle} color="bg-red-500" />
              <MetricCard title="Monthly Avg" value={alertData.avgPerMonth?.toFixed(1)} subtitle="Per month" icon={TrendingUp} color="bg-blue-500" />
              <MetricCard title="Clients" value={alertData.uniqueClients} subtitle="Affected" icon={Users} color="bg-green-500" />
              <MetricCard title="Latest" value={alertData.monthlyData?.[alertData.monthlyData?.length-1]?.total} subtitle={alertData.monthlyData?.[alertData.monthlyData?.length-1]?.month} icon={Calendar} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alertData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#EF4444" name="Alerts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Client Distribution</h3>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Client</th>
                        <th className="px-3 py-2 text-center">Count</th>
                        <th className="px-3 py-2 text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alertData.clientBreakdown?.map((c, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2">{c.client}</td>
                          <td className="px-3 py-2 text-center">{c.count}</td>
                          <td className="px-3 py-2 text-center">{c.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'misalignment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard title="Raised" value={misalignmentData.totalRaised?.toLocaleString()} subtitle="Total" icon={AlertTriangle} color="bg-red-500" />
              <MetricCard title="Fixed" value={misalignmentData.totalRectified?.toLocaleString()} subtitle="Rectified" icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Rate" value={`${misalignmentData.rectificationRate}%`} subtitle="Fix rate" icon={TrendingUp} color="bg-blue-500" />
              <MetricCard title="Monthly" value={misalignmentData.avgRaisedPerMonth?.toFixed(1)} subtitle="Average" icon={Calendar} color="bg-orange-500" />
              <MetricCard title="Clients" value={misalignmentData.uniqueClients} subtitle="Affected" icon={Users} color="bg-purple-500" />
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={misalignmentData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="raised" fill="#EF4444" name="Raised" />
                  <Bar dataKey="rectified" fill="#10B981" name="Fixed" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard title="Requests" value={historicalVideoData.totalRequests?.toLocaleString()} subtitle="Total" icon={Video} color="bg-purple-500" />
              <MetricCard title="Delivered" value={historicalVideoData.totalDelivered?.toLocaleString()} subtitle={`${historicalVideoData.overallDeliveryRate}%`} icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Avg Time" value={`${historicalVideoData.avgDeliveryTime}h`} subtitle="Delivery" icon={Clock} color="bg-blue-500" />
              <MetricCard title="Fastest" value={`${historicalVideoData.fastestDeliveryTime}h`} subtitle="Best" icon={TrendingUp} color="bg-green-600" />
              <MetricCard title="Slowest" value={`${historicalVideoData.slowestDeliveryTime}h`} subtitle="Worst" icon={XCircle} color="bg-red-600" />
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
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
                  <Line yAxisId="right" type="monotone" dataKey="avgDeliveryTime" stroke="#F59E0B" strokeWidth={3} name="Avg Time" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard title="Raised" value={generalIssuesData.totalRaised?.toLocaleString()} subtitle="Total" icon={AlertTriangle} color="bg-red-500" />
              <MetricCard title="Resolved" value={generalIssuesData.totalResolved?.toLocaleString()} subtitle="Fixed" icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Rate" value={`${generalIssuesData.resolutionRate}%`} subtitle="Success" icon={Target} color="bg-blue-500" />
              <MetricCard title="Avg Time" value={generalIssuesData.avgResolutionTime} subtitle="Resolution" icon={Clock} color="bg-purple-500" />
              <MetricCard title="Median" value={generalIssuesData.medianResolutionTime} subtitle="Typical" icon={TrendingUp} color="bg-orange-500" />
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Monthly Overview</h3>
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
                  <Line yAxisId="right" type="monotone" dataKey="avgTimeHours" stroke="#8B5CF6" strokeWidth={3} name="Avg Hours" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">📊 Complete Monthly Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left">Month</th>
                      <th className="px-3 py-3 text-center text-red-600">Raised</th>
                      <th className="px-3 py-3 text-center text-green-600">Same Month</th>
                      <th className="px-3 py-3 text-center text-purple-600">Later</th>
                      <th className="px-3 py-3 text-center text-blue-600">Previous</th>
                      <th className="px-3 py-3 text-center text-orange-600">Pending</th>
                      <th className="px-3 py-3 text-center">Rate%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalIssuesData.monthlyData?.map((m, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-3 font-medium">{m.month}</td>
                        <td className="px-3 py-3 text-center"><span className="bg-red-100 text-red-800 px-2 py-1 rounded">{m.raised}</span></td>
                        <td className="px-3 py-3 text-center"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">{m.resolvedSameMonth}</span></td>
                        <td className="px-3 py-3 text-center">{m.resolvedLaterMonths > 0 ? <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{m.resolvedLaterMonths}</span> : '-'}</td>
                        <td className="px-3 py-3 text-center">{m.carryForwardIn > 0 ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{m.carryForwardIn}</span> : '-'}</td>
                        <td className="px-3 py-3 text-center">{m.stillPending > 0 ? <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">{m.stillPending}</span> : '-'}</td>
                        <td className="px-3 py-3 text-center">{m.resolutionRate !== null ? <span className={`px-2 py-1 rounded ${m.resolutionRate >= 80 ? 'bg-green-100 text-green-800' : m.resolutionRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{m.resolutionRate}%</span> : 'TBD'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offline' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard title="Total Devices" value={deviceMovementData.totalDevices?.toLocaleString()} subtitle="Registered" icon={Wifi} color="bg-blue-500" />
              <MetricCard title="Offline Vehicles" value={offlineVehiclesData.totalOfflineVehicles?.toLocaleString()} subtitle={`${offlineVehiclesData.uniqueClients} clients`} icon={WifiOff} color="bg-red-500" />
              <MetricCard title="Offline Rate" value={`${deviceMovementData.totalDevices > 0 ? ((offlineVehiclesData.totalOfflineVehicles / deviceMovementData.totalDevices) * 100).toFixed(1) : 0}%`} subtitle="Of fleet" icon={TrendingDown} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Top 10 Clients</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={offlineVehiclesData.top10Clients}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="client" angle={-45} textAnchor="end" height={120} fontSize={11} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EF4444" name="Offline" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={offlineVehiclesData.top10Clients} cx="50%" cy="50%" labelLine={false} label={({ client, percentage }) => `${client}: ${percentage}%`} outerRadius={110} dataKey="count">
                      {offlineVehiclesData.top10Clients.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">All Clients Breakdown</h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-center">Count</th>
                      <th className="px-4 py-3 text-center">%</th>
                      <th className="px-4 py-3 text-left">Vehicles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offlineVehiclesData.allClients?.map((c, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{c.client}</td>
                        <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">{c.count}</span></td>
                        <td className="px-4 py-3 text-center">{c.percentage}%</td>
                        <td className="px-4 py-3">
                          <details>
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View {c.vehicles.length}</summary>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {c.vehicles.map((v, vi) => <span key={vi} className="text-xs bg-gray-100 px-2 py-1 rounded border">{v}</span>)}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard title="Total" value={deviceMovementData.totalDevices?.toLocaleString()} subtitle="Devices" icon={Truck} color="bg-blue-500" />
              <MetricCard title="Deployed" value={deviceMovementData.deployedCount?.toLocaleString()} subtitle={`${deviceMovementData.deployedPercentage}%`} icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Available" value={deviceMovementData.availableCount?.toLocaleString()} subtitle={`${deviceMovementData.availablePercentage}%`} icon={Wifi} color="bg-cyan-500" />
              <MetricCard title="Repair" value={deviceMovementData.underRepairCount?.toLocaleString()} subtitle={`${deviceMovementData.underRepairPercentage}%`} icon={Settings} color="bg-orange-500" />
              <MetricCard title="Damaged" value={deviceMovementData.damagedCount?.toLocaleString()} subtitle={`${deviceMovementData.damagedPercentage}%`} icon={XCircle} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Deployed', value: deviceMovementData.deployedCount, color: '#10B981' },
                      { name: 'Available', value: deviceMovementData.availableCount, color: '#06B6D4' },
                      { name: 'Repair', value: deviceMovementData.underRepairCount, color: '#F59E0B' },
                      { name: 'Damaged', value: deviceMovementData.damagedCount, color: '#EF4444' }
                    ]} cx="50%" cy="50%" labelLine={true} label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`} outerRadius={110} dataKey="value">
                      {[
                        { color: '#10B981' },
                        { color: '#06B6D4' },
                        { color: '#F59E0B' },
                        { color: '#EF4444' }
                      ].map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Deployments</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={deviceMovementData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="deployed" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Deployed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">All Devices</h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Device</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-left">Vehicle</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceMovementData.deviceDetails?.map((d, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{d.device}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            d.status === 'Deployed' ? 'bg-green-100 text-green-800' :
                            d.status === 'Device available for deployment' ? 'bg-cyan-100 text-cyan-800' :
                            d.status === 'Under Repair' ? 'bg-orange-100 text-orange-800' :
                            d.status === 'Device Damaged' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3">{d.vehicleNumber}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{d.installationDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
