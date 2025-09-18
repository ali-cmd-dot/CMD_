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
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.allSettled([
        fetchAlertData(),
        fetchMisalignmentData(),
        fetchHistoricalVideoData(),
        fetchGeneralIssuesData()
      ])

      // Check if any fetch failed
      const failed = results.filter(result => result.status === 'rejected')
      if (failed.length > 0) {
        console.warn('Some API calls failed:', failed)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load some data. Please check your internet connection.')
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
      } else {
        throw new Error(`Alert API failed: ${response.status}`)
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
      } else {
        throw new Error(`Misalignment API failed: ${response.status}`)
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
      } else {
        throw new Error(`Historical Video API failed: ${response.status}`)
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
      } else {
        throw new Error(`General Issues API failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching general issues data:', error)
      setGeneralIssuesData({ 
        totalRaised: 0, totalResolved: 0, resolutionRate: 0,
        avgResolutionTime: 0, monthlyData: [], clientBreakdown: [] 
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Professional Dashboard...</div>
          <div className="text-gray-500 mt-2">Fetching live data from Google Sheets...</div>
        </div>
      </div>
    )
  }

  if (!alertData || !misalignmentData || !historicalVideoData || !generalIssuesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Data Loading Error</div>
          <div className="text-gray-500 mt-2">Please check your API configuration</div>
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

  // Combine monthly data for overview with proper date sorting
  const combineMonthlyData = () => {
    const months = new Set([
      ...alertData.monthlyData.map(d => d.month),
      ...misalignmentData.monthlyData.map(d => d.month),
      ...historicalVideoData.monthlyData.map(d => d.month),
      ...generalIssuesData.monthlyData.map(d => d.month)
    ])

    // Convert to array and sort by actual date
    return Array.from(months)
      .sort((a, b) => {
        // Convert "MMM YYYY" to date for proper sorting
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
          <h1 className="text-3xl font-bold mb-2">Professional Monitoring Dashboard</h1>
          <p className="text-blue-100">Real-time analytics from live Google Sheets data - Your complete monthly analysis</p>
          {error && (
            <div className="mt-2 text-yellow-200 text-sm">{error}</div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Monthly Overview', icon: BarChart3 },
            { id: 'alerts', label: 'Alert Tracking', icon: AlertTriangle },
            { id: 'misalignment', label: 'Misalignment Analysis', icon: Activity },
            { id: 'videos', label: 'Historical Videos', icon: Video },
            { id: 'issues', label: 'General Issues', icon: Settings }
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
        {/* Monthly Overview Section - PRIORITY TAB */}
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
                value={misalignmentData.totalRaised?.toLocaleString() || '0'}
                subtitle={`${misalignmentData.rectificationRate || 0}% rectified`}
                icon={Activity}
                color="bg-orange-500"
              />
              <MetricCard
                title="Video Requests"
                value={historicalVideoData.totalRequests?.toLocaleString() || '0'}
                subtitle={`${historicalVideoData.overallDeliveryRate || 0}% delivered`}
                icon={Video}
                color="bg-purple-500"
              />
              <MetricCard
                title="General Issues"
                value={generalIssuesData.totalRaised?.toLocaleString() || '0'}
                subtitle={`${generalIssuesData.resolutionRate || 0}% resolved`}
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
                      <div className="text-sm text-gray-600">Average: {generalIssuesData.avgResolutionTime}h</div>
                      <div className="text-xs text-gray-500">Median: {generalIssuesData.medianResolutionTime}h</div>
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
                  {/* Combine and sort all client data */}
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
                value={`${historicalVideoData.fastestDeliveryTime}h`}
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
                value={`${generalIssuesData.avgResolutionTime}h`}
                subtitle="Hours to resolve"
                icon={Clock}
                color="bg-purple-500"
              />
              <MetricCard
                title="Median Time"
                value={`${generalIssuesData.medianResolutionTime}h`}
                subtitle="Typical resolution"
                icon={TrendingUp}
                color="bg-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Issues Overview</h3>
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
                    <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#8B5CF6" strokeWidth={3} name="Avg Time (h)" />
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
                        <th className="px-2 py-2 text-center">Avg(h)</th>
                        <th className="px-2 py-2 text-center">Range</th>
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
                          <td className="px-2 py-2 text-center">{client.avgTime}</td>
                          <td className="px-2 py-2 text-center text-xs">
                            {client.minTime}h-{client.maxTime}h
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
      </div>
    </div>
  )
}
