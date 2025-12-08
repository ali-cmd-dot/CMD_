'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts'
import { 
  Activity, AlertTriangle, TrendingUp, Calendar, Users, Clock, Target,
  BarChart3, Video, Settings, CheckCircle2, XCircle, TrendingDown,
  WifiOff, Cpu, Zap, Filter
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
  
  // Filter states for each tab
  const [alertsFilter, setAlertsFilter] = useState('')
  const [misalignmentFilter, setMisalignmentFilter] = useState('')
  const [videosFilter, setVideosFilter] = useState('')
  const [issuesFilter, setIssuesFilter] = useState('')
  const [offlineFilter, setOfflineFilter] = useState('')
  const [devicesFilter, setDevicesFilter] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await Promise.allSettled([
        fetchAlertData(),
        fetchMisalignmentData(),
        fetchHistoricalVideoData(),
        fetchGeneralIssuesData(),
        fetchOfflineVehiclesData(),
        fetchDeviceMovementData()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load some data.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAlertData = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlertData(data)
      }
    } catch (error) {
      console.error('Error fetching alert data:', error)
      setAlertData({ 
        totalCount: 0, avgPerMonth: 0, uniqueClients: 0, 
        monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchMisalignmentData = async () => {
    try {
      const response = await fetch('/api/misalignment')
      if (response.ok) {
        const data = await response.json()
        setMisalignmentData(data)
      }
    } catch (error) {
      console.error('Error fetching misalignment data:', error)
      setMisalignmentData({ 
        totalRaised: 0, totalRectified: 0, rectificationRate: 0, 
        monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchHistoricalVideoData = async () => {
    try {
      const response = await fetch('/api/issues')
      if (response.ok) {
        const data = await response.json()
        setHistoricalVideoData(data)
      }
    } catch (error) {
      console.error('Error fetching historical video data:', error)
      setHistoricalVideoData({ 
        totalRequests: 0, totalDelivered: 0, overallDeliveryRate: 0,
        avgDeliveryTime: 0, monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchGeneralIssuesData = async () => {
    try {
      const response = await fetch('/api/general-issues')
      if (response.ok) {
        const data = await response.json()
        setGeneralIssuesData(data)
      }
    } catch (error) {
      console.error('Error fetching general issues data:', error)
      setGeneralIssuesData({ 
        totalRaised: 0, totalResolved: 0, resolutionRate: 0,
        avgResolutionTime: 0, monthlyData: [], clientBreakdown: [] 
      })
    }
  }

  const fetchOfflineVehiclesData = async () => {
    try {
      const response = await fetch('/api/offline-vehicles')
      if (response.ok) {
        const data = await response.json()
        setOfflineVehiclesData(data)
      }
    } catch (error) {
      console.error('Error fetching offline vehicles data:', error)
      setOfflineVehiclesData({ 
        totalDevices: 0,
        totalOffline: 0,
        notRunningCount: 0,
        cameraIssueCount: 0,
        offlinePercentage: 0,
        uniqueClients: 0,
        top10Clients: [],
        allClients: [],
        notRunningBreakdown: [],
        cameraIssueBreakdown: [],
        vehicleDetails: [],
        notRunningVehicles: [],
        cameraIssueVehicles: []
      })
    }
  }

  const fetchDeviceMovementData = async () => {
    try {
      const response = await fetch('/api/device-movement')
      if (response.ok) {
        const data = await response.json()
        setDeviceMovementData(data)
      }
    } catch (error) {
      console.error('Error fetching device movement data:', error)
      setDeviceMovementData({ 
        totalDevices: 0, deployedCount: 0, availableCount: 0,
        underRepairCount: 0, damagedCount: 0, monthlyData: [], deviceDetails: []
      })
    }
  }

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#14B8A6', '#F97316', '#84CC16', '#6366F1', '#8B5A2B', '#059669'
  ]

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'bg-blue-500' }) => (
    <div className="metric-card h-full flex flex-col">
      <div className="flex items-start justify-between flex-1">
        <div className={`p-3 rounded-lg ${color} text-white flex-shrink-0`}>
          <Icon size={24} />
        </div>
        <div className="text-right flex-1 ml-4 min-h-[80px] flex flex-col justify-start">
          <div className="text-3xl font-bold text-gray-900 leading-tight mb-2">{value}</div>
          <div className="text-sm text-gray-600 leading-snug">{subtitle}</div>
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-800 mt-4 pt-4 border-t border-gray-100">{title}</h3>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Dashboard...</div>
          <div className="text-gray-500 mt-2">Fetching data from Google Sheets...</div>
        </div>
      </div>
    )
  }

  if (!alertData || !misalignmentData || !historicalVideoData || !generalIssuesData || !offlineVehiclesData || !deviceMovementData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Data Loading Error</div>
          <div className="text-gray-500 mt-2">Please check your configuration</div>
          <button 
            onClick={fetchAllData}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
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

  // Filter functions
  const filterAlerts = () => {
    if (!alertsFilter) return alertData.clientBreakdown
    return alertData.clientBreakdown.filter(client => 
      client.client.toLowerCase().includes(alertsFilter.toLowerCase())
    )
  }

  const filterMisalignment = () => {
    if (!misalignmentFilter) return misalignmentData.clientBreakdown
    return misalignmentData.clientBreakdown.filter(client => 
      client.client.toLowerCase().includes(misalignmentFilter.toLowerCase())
    )
  }

  const filterVideos = () => {
    if (!videosFilter) return historicalVideoData.clientBreakdown
    return historicalVideoData.clientBreakdown.filter(client => 
      client.client.toLowerCase().includes(videosFilter.toLowerCase())
    )
  }

  const filterIssues = () => {
    if (!issuesFilter) return generalIssuesData.clientBreakdown
    return generalIssuesData.clientBreakdown.filter(client => 
      client.client.toLowerCase().includes(issuesFilter.toLowerCase())
    )
  }

  const filterOfflineVehicles = () => {
    if (!offlineFilter) return offlineVehiclesData.allClients
    return offlineVehiclesData.allClients.filter(client => 
      client.client.toLowerCase().includes(offlineFilter.toLowerCase())
    )
  }

  const filterDevices = () => {
    if (!devicesFilter) return deviceMovementData.deviceDetails
    return deviceMovementData.deviceDetails.filter(device => 
      device.device.toLowerCase().includes(devicesFilter.toLowerCase()) ||
      device.status.toLowerCase().includes(devicesFilter.toLowerCase()) ||
      device.vehicleNumber.toLowerCase().includes(devicesFilter.toLowerCase())
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="dashboard-gradient text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">CAUTIO COMMAND CENTER</h1>
              <p className="text-blue-100">Real-time analytics from live Google Sheets</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'misalignment', label: 'Misalignment', icon: Activity },
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'issues', label: 'Issues', icon: Settings },
            { id: 'offline', label: 'Offline', icon: WifiOff },
            { id: 'devices', label: 'Device Movement', icon: Cpu }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
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
                value={`${misalignmentData.totalRaised?.toLocaleString() || '0'}`} 
                subtitle={`${misalignmentData.totalRectified?.toLocaleString() || '0'} fixed (${misalignmentData.rectificationRate}%)`} 
                icon={Activity} 
                color="bg-orange-500" 
              />
              <MetricCard 
                title="Video Requests" 
                value={`${historicalVideoData.totalRequests?.toLocaleString() || '0'}`} 
                subtitle={`${historicalVideoData.totalDelivered?.toLocaleString() || '0'} delivered (${historicalVideoData.overallDeliveryRate}%)`} 
                icon={Video} 
                color="bg-purple-500" 
              />
              <MetricCard 
                title="General Issues" 
                value={`${generalIssuesData.totalRaised?.toLocaleString() || '0'}`} 
                subtitle={`${generalIssuesData.totalResolved?.toLocaleString() || '0'} resolved (${generalIssuesData.resolutionRate}%)`} 
                icon={Settings} 
                color="bg-green-500" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard 
                title="Deployed Devices" 
                value={deviceMovementData.deployedCount?.toLocaleString() || '0'} 
                subtitle={`${deviceMovementData.deployedPercentage}% of total fleet`} 
                icon={Cpu} 
                color="bg-blue-600" 
              />
              <MetricCard 
                title="Offline Devices (48h+)" 
                value={offlineVehiclesData.totalOffline?.toLocaleString() || '0'} 
                subtitle={`${deviceMovementData.deployedCount > 0 ? ((offlineVehiclesData.totalOffline / deviceMovementData.deployedCount) * 100).toFixed(1) : 0}% offline rate`} 
                icon={WifiOff} 
                color="bg-red-600" 
              />
              <MetricCard 
                title="Camera Issues" 
                value={offlineVehiclesData.cameraIssueCount?.toLocaleString() || '0'} 
                subtitle={`Critical: Running but offline`} 
                icon={Video} 
                color="bg-yellow-600" 
              />
            </div>

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
                  <Line yAxisId="right" type="monotone" dataKey="videos" stroke="#8B5CF6" strokeWidth={3} name="Videos" />
                  <Line yAxisId="right" type="monotone" dataKey="issues" stroke="#10B981" strokeWidth={3} name="Issues" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg border border-blue-100">
                <h3 className="text-xl font-bold mb-6 flex items-center text-blue-700">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3 shadow-md">
                    <Target className="text-white" size={24} />
                  </div>
                  Performance Summary
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800 text-lg">Video Delivery</div>
                        <div className="text-sm text-gray-600 mt-1">Avg: {historicalVideoData.avgDeliveryTime}h</div>
                        <div className="text-xs text-gray-500 mt-1">Range: {historicalVideoData.fastestDeliveryTime}h - {historicalVideoData.slowestDeliveryTime}h</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-purple-600">{historicalVideoData.overallDeliveryRate}%</div>
                        <div className="text-sm text-gray-600 font-medium">Success</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800 text-lg">Issue Resolution</div>
                        <div className="text-sm text-gray-600 mt-1">Avg: {generalIssuesData.avgResolutionTime}</div>
                        <div className="text-xs text-gray-500 mt-1">Median: {generalIssuesData.medianResolutionTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-green-600">{generalIssuesData.resolutionRate}%</div>
                        <div className="text-sm text-gray-600 font-medium">Resolved</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800 text-lg">Misalignment Fix</div>
                        <div className="text-sm text-gray-600 mt-1">Monthly avg: {misalignmentData.avgRaisedPerMonth?.toFixed(1)}</div>
                        <div className="text-xs text-gray-500 mt-1">Fixed: {misalignmentData.avgRectifiedPerMonth?.toFixed(1)}/month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-orange-600">{misalignmentData.rectificationRate}%</div>
                        <div className="text-sm text-gray-600 font-medium">Fixed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-yellow-50 p-6 rounded-xl shadow-lg border border-red-100">
                <h3 className="text-xl font-bold mb-6 flex items-center text-red-700">
                  <div className="bg-red-500 p-2 rounded-lg mr-3 shadow-md">
                    <WifiOff className="text-white" size={24} />
                  </div>
                  Device Health Overview
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Cpu className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Total Deployed</div>
                          <div className="text-xs text-gray-500">Active in field</div>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-blue-600">{deviceMovementData.deployedCount?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-red-500">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-3 rounded-lg">
                          <WifiOff className="text-red-600" size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Offline (48h+)</div>
                          <div className="text-xs text-gray-500">Need attention</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-red-600">{offlineVehiclesData.totalOffline?.toLocaleString()}</div>
                        <div className="text-xs text-red-600 font-semibold">
                          {deviceMovementData.deployedCount > 0 ? ((offlineVehiclesData.totalOffline / deviceMovementData.deployedCount) * 100).toFixed(1) : 0}% rate
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <XCircle size={20} />
                        <div className="text-2xl font-black">{offlineVehiclesData.notRunningCount}</div>
                      </div>
                      <div className="text-xs font-semibold">Not Running</div>
                      <div className="text-xs opacity-75 mt-1">Vehicle issue</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Video size={20} />
                        <div className="text-2xl font-black">{offlineVehiclesData.cameraIssueCount}</div>
                      </div>
                      <div className="text-xs font-semibold">Camera Issue</div>
                      <div className="text-xs opacity-75 mt-1">⚠️ Critical</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Top Clients by Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  ...alertData.clientBreakdown.slice(0, 6).map(c => ({ ...c, type: 'Alerts', value: c.count, color: 'bg-red-100 text-red-800' })),
                  ...misalignmentData.clientBreakdown.slice(0, 6).map(c => ({ ...c, type: 'Misalignments', value: c.raised, color: 'bg-orange-100 text-orange-800' }))
                ]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 9)
                  .map((client, index) => (
                  <div key={`${client.client}-${client.type}-${index}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm text-gray-800 flex-1">{client.client}</div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${client.color}`}>{client.type}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-bold text-gray-900">{client.value}</div>
                      <div className="text-sm text-gray-600">{client.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard title="Total Alerts" value={alertData.totalCount?.toLocaleString() || '0'} subtitle="All alerts" icon={AlertTriangle} color="bg-red-500" />
              <MetricCard title="Monthly Avg" value={alertData.avgPerMonth?.toFixed(1) || '0'} subtitle="Per month" icon={TrendingUp} color="bg-blue-500" />
              <MetricCard title="Active Clients" value={alertData.uniqueClients || '0'} subtitle="Unique clients" icon={Users} color="bg-green-500" />
              <MetricCard title="Latest Month" value={alertData.monthlyData?.[alertData.monthlyData?.length - 1]?.total || '0'} subtitle={alertData.monthlyData?.[alertData.monthlyData?.length - 1]?.month || 'N/A'} icon={Calendar} color="bg-purple-500" />
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
                    <Bar dataKey="clients" fill="#10B981" name="Clients" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Client Distribution</h3>
                  <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-500" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={alertsFilter}
                      onChange={(e) => setAlertsFilter(e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                </div>
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
                      {filterAlerts().map((client, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
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

        {activeTab === 'misalignment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard title="Total Raised" value={misalignmentData.totalRaised?.toLocaleString() || '0'} subtitle="Raised" icon={AlertTriangle} color="bg-red-500" />
              <MetricCard title="Total Fixed" value={misalignmentData.totalRectified?.toLocaleString() || '0'} subtitle="Rectified" icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Fix Rate" value={`${misalignmentData.rectificationRate || 0}%`} subtitle="Success" icon={TrendingUp} color="bg-blue-500" />
              <MetricCard title="Monthly Avg" value={misalignmentData.avgRaisedPerMonth?.toFixed(1) || '0'} subtitle="Per month" icon={Calendar} color="bg-orange-500" />
              <MetricCard title="Clients" value={misalignmentData.uniqueClients || '0'} subtitle="Affected" icon={Users} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={misalignmentData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="raised" fill="#EF4444" name="Raised" />
                    <Bar yAxisId="left" dataKey="rectified" fill="#10B981" name="Fixed" />
                    <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#8B5CF6" strokeWidth={2} name="Clients" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Client Performance</h3>
                  <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-500" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={misalignmentFilter}
                      onChange={(e) => setMisalignmentFilter(e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                </div>
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
                      {filterMisalignment().map((client, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2 font-medium text-xs">{client.client}</td>
                          <td className="px-2 py-2 text-center">{client.raised}</td>
                          <td className="px-2 py-2 text-center">{client.rectified}</td>
                          <td className="px-2 py-2 text-center">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              client.rectificationRate > 70 ? 'bg-green-100 text-green-800' : 
                              client.rectificationRate > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
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

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Most Repeated Vehicles</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {misalignmentData.monthlyData?.map((month, index) => (
                  <div key={index}>
                    <h4 className="font-medium mb-3">{month.month}</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {month.vehicleRepeats?.slice(0, 8).map((vehicle, vIndex) => (
                        <div key={vIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{vehicle.vehicle}</div>
                            <div className="text-xs text-gray-600">{vehicle.client}</div>
                          </div>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                            {vehicle.repeats}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard title="Requests" value={historicalVideoData.totalRequests?.toLocaleString() || '0'} subtitle="Total" icon={Video} color="bg-purple-500" />
              <MetricCard title="Delivered" value={historicalVideoData.totalDelivered?.toLocaleString() || '0'} subtitle={`${historicalVideoData.overallDeliveryRate}%`} icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Avg Time" value={`${historicalVideoData.avgDeliveryTime}h`} subtitle="Delivery" icon={Clock} color="bg-blue-500" />
              <MetricCard title="Fastest" value={`${historicalVideoData.fastestDeliveryTime}h`} subtitle="Best" icon={TrendingUp} color="bg-green-600" />
              <MetricCard title="Slowest" value={`${historicalVideoData.slowestDeliveryTime}h`} subtitle="Worst" icon={XCircle} color="bg-red-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <Line yAxisId="right" type="monotone" dataKey="avgDeliveryTime" stroke="#F59E0B" strokeWidth={3} name="Avg(h)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Client Performance</h3>
                  <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-500" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={videosFilter}
                      onChange={(e) => setVideosFilter(e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left">Client</th>
                        <th className="px-2 py-2 text-center">Req</th>
                        <th className="px-2 py-2 text-center">Del</th>
                        <th className="px-2 py-2 text-center">Rate%</th>
                        <th className="px-2 py-2 text-center">Avg(h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterVideos().map((client, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2 font-medium text-xs">{client.client}</td>
                          <td className="px-2 py-2 text-center">{client.requests}</td>
                          <td className="px-2 py-2 text-center">{client.delivered}</td>
                          <td className="px-2 py-2 text-center">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              client.deliveryRate > 80 ? 'bg-green-100 text-green-800' : 
                              client.deliveryRate > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {client.deliveryRate}%
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center">{client.avgDeliveryTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <MetricCard title="Raised" value={generalIssuesData.totalRaised?.toLocaleString() || '0'} subtitle="Total" icon={AlertTriangle} color="bg-red-500" />
              <MetricCard title="Resolved" value={generalIssuesData.totalResolved?.toLocaleString() || '0'} subtitle="Fixed" icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Rate" value={`${generalIssuesData.resolutionRate}%`} subtitle="Success" icon={Target} color="bg-blue-500" />
              <MetricCard title="Avg Time" value={generalIssuesData.avgResolutionTime || '0h'} subtitle="Resolution" icon={Clock} color="bg-purple-500" />
              <MetricCard title="Median" value={generalIssuesData.medianResolutionTime || '0h'} subtitle="Typical" icon={TrendingUp} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={generalIssuesData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="raised" fill="#EF4444" name="Raised" />
                    <Bar yAxisId="left" dataKey="resolved" fill="#10B981" name="Resolved" />
                    <Line yAxisId="right" type="monotone" dataKey="avgTimeHours" stroke="#8B5CF6" strokeWidth={3} name="Avg(h)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Client Performance</h3>
                  <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-500" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={issuesFilter}
                      onChange={(e) => setIssuesFilter(e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left">Client</th>
                        <th className="px-2 py-2 text-center">Raised</th>
                        <th className="px-2 py-2 text-center">Resolved</th>
                        <th className="px-2 py-2 text-center">Rate%</th>
                        <th className="px-2 py-2 text-center">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterIssues().map((client, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-2 py-2 font-medium text-xs">{client.client}</td>
                          <td className="px-2 py-2 text-center">{client.raised}</td>
                          <td className="px-2 py-2 text-center">{client.resolved}</td>
                          <td className="px-2 py-2 text-center">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              client.resolutionRate > 80 ? 'bg-green-100 text-green-800' : 
                              client.resolutionRate > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
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

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">📊 Monthly Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left">Month</th>
                      <th className="px-3 py-3 text-center text-red-600">📈 Raised</th>
                      <th className="px-3 py-3 text-center text-green-600">✅ Same</th>
                      <th className="px-3 py-3 text-center text-purple-600">🔄 Later</th>
                      <th className="px-3 py-3 text-center text-blue-600">⬅️ Previous</th>
                      <th className="px-3 py-3 text-center text-orange-600">⏳ Pending</th>
                      <th className="px-3 py-3 text-center text-gray-600">🎯 Rate%</th>
                      <th className="px-3 py-3 text-center text-indigo-600">⏱️ Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalIssuesData.monthlyData?.map((month, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-3 font-medium flex items-center">
                          {month.month}
                          {month.isCurrentMonth && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">NOW</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{month.raised}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{month.resolvedSameMonth}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.resolvedLaterMonths > 0 ? (
                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">{month.resolvedLaterMonths}</span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.carryForwardIn > 0 ? (
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{month.carryForwardIn}</span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.stillPending > 0 ? (
                            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">{month.stillPending}</span>
                          ) : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.resolutionRate !== null ? (
                            <span className={`inline-block px-2 py-1 rounded text-sm ${
                              month.resolutionRate >= 80 ? 'bg-green-100 text-green-800' : 
                              month.resolutionRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {month.resolutionRate}%
                            </span>
                          ) : <span className="text-gray-400 text-xs">TBD</span>}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {month.avgTime !== '0h' ? (
                            <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">{month.avgTime}</span>
                          ) : '-'}
                        </td>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Devices"
                value={deviceMovementData.deployedCount?.toLocaleString() || '0'}
                subtitle="All deployed devices"
                icon={Cpu}
                color="bg-blue-500"
              />
              <MetricCard
                title="Total Offline (48h+)"
                value={offlineVehiclesData.totalOffline?.toLocaleString() || '0'}
                subtitle={`${deviceMovementData.deployedCount > 0 ? ((offlineVehiclesData.totalOffline / deviceMovementData.deployedCount) * 100).toFixed(1) : 0}% of deployed`}
                icon={WifiOff}
                color="bg-red-500"
              />
              <MetricCard
                title="Not Running"
                value={offlineVehiclesData.notRunningCount?.toLocaleString() || '0'}
                subtitle="Vehicles not running"
                icon={XCircle}
                color="bg-orange-500"
              />
              <MetricCard
                title="Camera Issue"
                value={offlineVehiclesData.cameraIssueCount?.toLocaleString() || '0'}
                subtitle="Offline but running"
                icon={AlertTriangle}
                color="bg-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl shadow-lg border border-red-100">
                <h3 className="text-xl font-bold mb-6 flex items-center text-red-700">
                  <div className="bg-red-500 p-2 rounded-lg mr-3 shadow-md">
                    <WifiOff className="text-white" size={24} />
                  </div>
                  Top 10 Offline Clients
                </h3>
                <div className="space-y-3">
                  {offlineVehiclesData.top10Clients?.map((client, index) => (
                    <div key={index} className="relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
                      <div className="relative flex justify-between items-center p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-red-500">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="relative">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                              {index + 1}
                            </div>
                            {index < 3 && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                ⭐
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 text-base">{client.client}</div>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                <XCircle size={12} className="mr-1" />
                                {client.notRunning} Not Running
                              </span>
                              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                <AlertTriangle size={12} className="mr-1" />
                                {client.cameraIssue} Camera
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-black text-red-600">{client.count}</div>
                          <div className="text-xs text-gray-500 font-medium">{client.percentage}% share</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl shadow-lg border border-orange-100">
                <h3 className="text-xl font-bold mb-4 flex items-center text-orange-700">
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg mr-3 shadow-md">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  Offline Category Split
                </h3>
                
                <div className="bg-white rounded-xl p-4 shadow-inner mb-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Not Running', value: offlineVehiclesData.notRunningCount },
                          { name: 'Camera Issue', value: offlineVehiclesData.cameraIssueCount }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={5}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#F97316" />
                        <Cell fill="#FBB040" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <XCircle size={24} />
                      <div className="text-3xl font-black">{offlineVehiclesData.notRunningCount}</div>
                    </div>
                    <div className="text-sm font-semibold opacity-90">Not Running</div>
                    <div className="text-xs opacity-75 mt-1">
                      {offlineVehiclesData.totalOffline > 0 
                        ? ((offlineVehiclesData.notRunningCount / offlineVehiclesData.totalOffline) * 100).toFixed(1) 
                        : 0}% of offline
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle size={24} />
                      <div className="text-3xl font-black">{offlineVehiclesData.cameraIssueCount}</div>
                    </div>
                    <div className="text-sm font-semibold opacity-90">Camera Issue</div>
                    <div className="text-xs opacity-75 mt-1">
                      {offlineVehiclesData.totalOffline > 0 
                        ? ((offlineVehiclesData.cameraIssueCount / offlineVehiclesData.totalOffline) * 100).toFixed(1) 
                        : 0}% of offline
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <XCircle className="mr-2 text-orange-600" />
                Not Running Vehicles by Client
              </h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-center">Count</th>
                      <th className="px-4 py-3 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offlineVehiclesData.notRunningBreakdown?.map((client, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{client.client}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">{client.count}</span>
                        </td>
                        <td className="px-4 py-3 text-center">{client.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">All Offline Vehicles (48h+ only)</h3>
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={offlineFilter}
                    onChange={(e) => setOfflineFilter(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      <th className="px-4 py-3 text-center">Not Running</th>
                      <th className="px-4 py-3 text-center">Camera</th>
                      <th className="px-4 py-3 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterOfflineVehicles().map((client, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{client.client}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">{client.count}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">{client.notRunning}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{client.cameraIssue}</span>
                        </td>
                        <td className="px-4 py-3 text-center">{client.percentage}%</td>
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
              <MetricCard title="Total" value={deviceMovementData.totalDevices?.toLocaleString() || '0'} subtitle="All devices" icon={Cpu} color="bg-blue-500" />
              <MetricCard title="Deployed" value={deviceMovementData.deployedCount?.toLocaleString() || '0'} subtitle={`${deviceMovementData.deployedPercentage}%`} icon={CheckCircle2} color="bg-green-500" />
              <MetricCard title="Available" value={deviceMovementData.availableCount?.toLocaleString() || '0'} subtitle={`${deviceMovementData.availablePercentage}%`} icon={Zap} color="bg-yellow-500" />
              <MetricCard title="Repair" value={deviceMovementData.underRepairCount?.toLocaleString() || '0'} subtitle={`${deviceMovementData.underRepairPercentage}%`} icon={Settings} color="bg-orange-500" />
              <MetricCard title="Damaged" value={deviceMovementData.damagedCount?.toLocaleString() || '0'} subtitle={`${deviceMovementData.damagedPercentage}%`} icon={XCircle} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Deployed', value: deviceMovementData.deployedCount },
                        { name: 'Available', value: deviceMovementData.availableCount },
                        { name: 'Repair', value: deviceMovementData.underRepairCount },
                        { name: 'Damaged', value: deviceMovementData.damagedCount }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {[0, 1, 2, 3].map((idx) => (
                        <Cell key={`cell-${idx}`} fill={['#10B981', '#F59E0B', '#F97316', '#EF4444'][idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Deployments</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deviceMovementData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="deployed" fill="#10B981" name="Deployed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Device Registry</h3>
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={devicesFilter}
                    onChange={(e) => setDevicesFilter(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left">#</th>
                      <th className="px-3 py-3 text-left">Device ID</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-3 py-3 text-left">Vehicle</th>
                      <th className="px-3 py-3 text-left">Install Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterDevices().map((device, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-3">{idx + 1}</td>
                        <td className="px-3 py-3 font-medium text-xs">{device.device}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            device.status === 'Deployed' ? 'bg-green-100 text-green-800' :
                            device.status === 'Device available for deployment' ? 'bg-yellow-100 text-yellow-800' :
                            device.status === 'Under Repair' ? 'bg-orange-100 text-orange-800' :
                            device.status === 'Device Damaged' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {device.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs">{device.vehicleNumber}</td>
                        <td className="px-3 py-3 text-xs">{device.installationDate}</td>
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
