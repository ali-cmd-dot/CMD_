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
        {/* Monthly Overview Section - UPDATED CARDS WITH FULL DETAILS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Executive Summary Metrics - UPDATED */}
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
                <h3 className="text-xl font-semibold mb-4">Monthly Issues Overview - Smart Carry Forward Analysis</h3>
                <div className="mb-3 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded mr-1"></span>Raised This Month</span>
                    <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-1"></span>Resolved Same Month</span>
                    <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded mr-1"></span>From Previous Months</span>
                    <span className="flex items-center"><span className="w-3 h-3 bg-orange-500 rounded mr-1"></span>Still Pending</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={generalIssuesData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          const isCurrentMonth = data.isCurrentMonth
                          
                          return (
                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-72">
                              <p className="font-semibold text-lg mb-2 flex items-center">
                                {label}
                                {isCurrentMonth && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CURRENT</span>}
                              </p>
                              
                              <div className="space-y-1 text-sm">
                                <p className="text-red-600 font-medium">📈 Raised This Month: {data.raised}</p>
                                <p className="text-green-600">✅ Resolved Same Month: {data.resolvedSameMonth}</p>
                                
                                {data.carryForwardIn > 0 && (
                                  <p className="text-blue-600">⬅️ From Previous Months: {data.carryForwardIn}</p>
                                )}
                                
                                {data.resolvedLaterMonths > 0 && (
                                  <p className="text-purple-600">🔄 Resolved in Later Months: {data.resolvedLaterMonths}</p>
                                )}
                                
                                {data.stillPending > 0 && (
                                  <p className="text-orange-600">⏳ Still Pending: {data.stillPending}</p>
                                )}
                                
                                <div className="border-t pt-2 mt-2">
                                  <p className="text-indigo-600">⏱️ Avg Resolution Time: {data.avgTime}</p>
                                  <p className="text-gray-600">📊 Same Month Resolution: {data.sameMonthResolutionRate}%</p>
                                  {data.resolutionRate !== null && (
                                    <p className="text-gray-600">🎯 Overall Resolution: {data.resolutionRate}%</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="raised" fill="#EF4444" name="Raised This Month" />
                    <Bar yAxisId="left" dataKey="resolvedSameMonth" fill="#10B981" name="Resolved Same Month" />
                    <Bar yAxisId="left" dataKey="carryForwardIn" fill="#3B82F6" name="From Previous Months" />
                    <Bar yAxisId="left" dataKey="stillPending" fill="#F59E0B" name="Still Pending" />
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
                          <td className="px-2 py-2 text-center text-xs">{client.avgTime}</td>
                          <td className="px-2 py-2 text-center text-xs">
                            {client.minTime} - {client.maxTime}
                          </td>
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
                      <th className="px-3 py-3 text-center font-semibold text-red-600">📈 Raised<br/>This Month</th>
                      <th className="px-3 py-3 text-center font-semibold text-green-600">✅ Resolved<br/>Same Month</th>
                      <th className="px-3 py-3 text-center font-semibold text-purple-600">🔄 Resolved<br/>Later</th>
                      <th className="px-3 py-3 text-center font-semibold text-blue-600">⬅️ From<br/>Previous</th>
                      <th className="px-3 py-3 text-center font-semibold text-orange-600">⏳ Still<br/>Pending</th>
                      <th className="px-3 py-3 text-center font-semibold text-gray-600">🎯 Overall<br/>Rate%</th>
                      <th className="px-3 py-3 text-center font-semibold text-indigo-600">⏱️ Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generalIssuesData.monthlyData?.map((month, index) => {
                      return (
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
                      )
                    })}
                  </tbody>
                  {/* Summary Row */}
                  <tfoot className="bg-gray-100 border-t-2">
                    <tr className="font-semibold">
                      <td className="px-3 py-3 text-left">TOTAL</td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-red-200 text-red-900 px-2 py-1 rounded text-sm font-bold">
                          {generalIssuesData.totalRaised?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-green-200 text-green-900 px-2 py-1 rounded text-sm font-bold">
                          {generalIssuesData.monthlyData?.reduce((sum, month) => sum + month.resolvedSameMonth, 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-purple-200 text-purple-900 px-2 py-1 rounded text-sm font-bold">
                          {generalIssuesData.monthlyData?.reduce((sum, month) => sum + month.resolvedLaterMonths, 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-sm font-bold">
                          {generalIssuesData.monthlyData?.reduce((sum, month) => sum + month.carryForwardIn, 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded text-sm font-bold">
                          {generalIssuesData.monthlyData?.reduce((sum, month) => sum + month.stillPending, 0)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-gray-200 text-gray-900 px-2 py-1 rounded text-sm font-bold">
                          {generalIssuesData.resolutionRate}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-indigo-200 text-indigo-900 px-2 py-1 rounded text-xs font-bold">
                          {generalIssuesData.avgResolutionTime}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">📋 Data Explanation:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>• <strong>Raised This Month:</strong> New issues opened in that month</div>
                  <div>• <strong>Resolved Same Month:</strong> Issues opened & closed within same month</div>
                  <div>• <strong>Resolved Later:</strong> Issues from this month resolved in future months</div>
                  <div>• <strong>From Previous:</strong> Old issues resolved in this month</div>
                  <div>• <strong>Still Pending:</strong> Issues not yet resolved</div>
                  <div>• <strong>Overall Rate:</strong> (Same Month + Later Resolved) / Raised × 100</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
