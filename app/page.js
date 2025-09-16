'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Users,
  Clock,
  Target,
  BarChart3
} from 'lucide-react'

export default function Dashboard() {
  const [alertData, setAlertData] = useState([])
  const [misalignmentData, setMisalignmentData] = useState([])
  const [issuesData, setIssuesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('alerts')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch all data from different sheets
      await Promise.all([
        fetchAlertData(),
        fetchMisalignmentData(),
        fetchIssuesData()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
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
        throw new Error('Failed to fetch alert data')
      }
    } catch (error) {
      console.error('Error fetching alert data:', error)
      // Only use mock data if API fails
      setAlertData(generateMockAlertData())
    }
  }

  const fetchMisalignmentData = async () => {
    try {
      const response = await fetch('/api/misalignment')
      if (response.ok) {
        const data = await response.json()
        setMisalignmentData(data)
      } else {
        throw new Error('Failed to fetch misalignment data')
      }
    } catch (error) {
      console.error('Error fetching misalignment data:', error)
      // Only use mock data if API fails
      setMisalignmentData(generateMockMisalignmentData())
    }
  }

  const fetchIssuesData = async () => {
    try {
      const response = await fetch('/api/issues')
      if (response.ok) {
        const data = await response.json()
        setIssuesData(data)
      } else {
        throw new Error('Failed to fetch issues data')
      }
    } catch (error) {
      console.error('Error fetching issues data:', error)
      // Only use mock data if API fails
      setIssuesData(generateMockIssuesData())
    }
  }

  const generateMockAlertData = () => {
    // Fallback mock data - only used if API fails
    return {
      monthlyData: [
        { month: 'Aug 2025', total: 0, clients: 0 },
        { month: 'Sep 2025', total: 0, clients: 0 }
      ],
      clientBreakdown: [
        { client: 'No Data Available', count: 0, percentage: 0 }
      ],
      totalCount: 0,
      avgPerMonth: 0,
      uniqueClients: 0
    }
  }

  const generateMockMisalignmentData = () => {
    return {
      monthlyData: [
        { month: 'Aug 2025', total: 2456, clients: 45 },
        { month: 'Sep 2025', total: 1489, clients: 38 }
      ],
      clientBreakdown: [
        { client: 'P.J.J. Fruits', count: 507, percentage: 12.8 },
        { client: 'Boom Cabs', count: 445, percentage: 11.3 },
        { client: 'Vozi', count: 389, percentage: 9.9 },
        { client: 'GSRTC', count: 356, percentage: 9.0 },
        { client: 'Green Cell Express', count: 298, percentage: 7.6 },
        { client: 'Zingbus', count: 267, percentage: 6.8 },
        { client: 'Trev', count: 234, percentage: 5.9 },
        { client: 'DPS', count: 198, percentage: 5.0 },
        { client: 'Euro Cars - Delhi', count: 178, percentage: 4.5 },
        { client: 'Waves', count: 156, percentage: 4.0 },
        { client: 'Rinku Logistics', count: 145, percentage: 3.7 },
        { client: 'Shree Maruthi', count: 132, percentage: 3.3 },
        { client: 'ESSAR Greenline Mobility', count: 123, percentage: 3.1 },
        { client: 'GoTours', count: 112, percentage: 2.8 },
        { client: 'Others', count: 401, percentage: 10.3 }
      ],
      totalCount: 3945,
      avgPerMonth: 1972.5,
      uniqueClients: 45
    }
  }

  const generateMockIssuesData = () => {
    return {
      monthlyData: [
        { month: 'Aug 2025', raised: 89, resolved: 78, avgTime: 4.2 },
        { month: 'Sep 2025', raised: 76, resolved: 82, avgTime: 3.8 }
      ],
      clientBreakdown: [
        { client: 'Client A', raised: 25, resolved: 23, avgTime: 3.5, minTime: 0.5, maxTime: 12.3, medianTime: 2.8 },
        { client: 'Client B', raised: 19, resolved: 18, avgTime: 4.1, minTime: 0.8, maxTime: 15.2, medianTime: 3.2 },
        { client: 'Client C', raised: 22, resolved: 20, avgTime: 5.2, minTime: 1.2, maxTime: 18.7, medianTime: 4.1 },
        { client: 'Client D', raised: 18, resolved: 16, avgTime: 6.1, minTime: 2.1, maxTime: 22.4, medianTime: 5.3 },
        { client: 'Client E', raised: 21, resolved: 19, avgTime: 4.8, minTime: 1.5, maxTime: 16.9, medianTime: 3.9 }
      ],
      totalRaised: 165,
      totalResolved: 158,
      avgResolutionTime: 4.7,
      minResolutionTime: 0.5,
      maxResolutionTime: 22.4,
      medianResolutionTime: 4.1
    }
  }

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85C1E9', '#D2B4DE', '#AED6F1', '#A9DFBF', '#F9E79F'
  ]

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'bg-blue-500' }) => (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{subtitle}</div>
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
          <div className="text-xl font-semibold text-gray-700">Loading Dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="dashboard-gradient text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Monitoring Dashboard</h1>
          <p className="text-blue-100">Comprehensive analytics and insights</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          {[
            { id: 'alerts', label: 'Alert Tracking', icon: AlertTriangle },
            { id: 'misalignment', label: 'Misalignment', icon: Activity },
            { id: 'issues', label: 'Issues Management', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-6">
        {/* Alert Tracking Section */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Alerts"
                value={alertData.totalCount?.toLocaleString() || '0'}
                subtitle="Excluding No L2 alerts"
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <BarChart3 className="mr-2 text-blue-600" />
                  Monthly Alert Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alertData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3B82F6" name="Total Alerts" />
                    <Bar dataKey="clients" fill="#10B981" name="Active Clients" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Client Distribution */}
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">All Clients Alert Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={alertData.clientBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ client, percentage }) => `${client}: ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {alertData.clientBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Client Name</th>
                          <th className="px-3 py-2 text-center">Count</th>
                          <th className="px-3 py-2 text-center">%</th>
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
          </div>
        )}

        {/* Misalignment Section */}
        {activeTab === 'misalignment' && (
          <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Misalignments"
                value={misalignmentData.totalCount?.toLocaleString() || '0'}
                subtitle="Cumulative count"
                icon={Activity}
                color="bg-orange-500"
              />
              <MetricCard
                title="Monthly Average"
                value={misalignmentData.avgPerMonth?.toFixed(1) || '0'}
                subtitle="Misalignments per month"
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <MetricCard
                title="Affected Clients"
                value={misalignmentData.uniqueClients || '0'}
                subtitle="Unique clients with misalignments"
                icon={Users}
                color="bg-green-500"
              />
              <MetricCard
                title="Latest Month"
                value={misalignmentData.monthlyData?.[misalignmentData.monthlyData?.length - 1]?.total || '0'}
                subtitle={misalignmentData.monthlyData?.[misalignmentData.monthlyData?.length - 1]?.month || 'N/A'}
                icon={Calendar}
                color="bg-purple-500"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Misalignment Trends & Client Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly Trend */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">Monthly Trends</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={misalignmentData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="total" stroke="#F59E0B" fill="#FEF3C7" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Client Distribution Table */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">All Clients Distribution</h4>
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left">Client Name</th>
                            <th className="px-3 py-2 text-center">Count</th>
                            <th className="px-3 py-2 text-center">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {misalignmentData.clientBreakdown?.map((client, index) => (
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
            </div>
          </div>
        )}

        {/* Issues Management Section */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Total Raised"
                value={issuesData.totalRaised?.toLocaleString() || '165'}
                subtitle="Issues raised"
                icon={AlertTriangle}
                color="bg-red-500"
              />
              <MetricCard
                title="Total Resolved"
                value={issuesData.totalResolved?.toLocaleString() || '158'}
                subtitle="Issues resolved"
                icon={Target}
                color="bg-green-500"
              />
              <MetricCard
                title="Avg Resolution"
                value={`${issuesData.avgResolutionTime?.toFixed(1) || '4.7'}h`}
                subtitle="Hours to resolve"
                icon={Clock}
                color="bg-blue-500"
              />
              <MetricCard
                title="Fastest Resolution"
                value={`${issuesData.minResolutionTime?.toFixed(1) || '0.5'}h`}
                subtitle="Minimum time"
                icon={TrendingUp}
                color="bg-green-600"
              />
              <MetricCard
                title="Slowest Resolution"
                value={`${issuesData.maxResolutionTime?.toFixed(1) || '22.4'}h`}
                subtitle="Maximum time"
                icon={Clock}
                color="bg-red-600"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Monthly Issues Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={issuesData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="raised" stroke="#EF4444" name="Raised" />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <h3 className="text-xl font-semibold mb-4">Average Resolution Time by Month</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={issuesData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}h`, 'Avg Time']} />
                    <Bar dataKey="avgTime" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Client Performance Table */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-semibold mb-4">Client Performance Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Client</th>
                      <th className="px-4 py-2 text-center">Raised</th>
                      <th className="px-4 py-2 text-center">Resolved</th>
                      <th className="px-4 py-2 text-center">Avg Time (h)</th>
                      <th className="px-4 py-2 text-center">Min Time (h)</th>
                      <th className="px-4 py-2 text-center">Max Time (h)</th>
                      <th className="px-4 py-2 text-center">Median Time (h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuesData.clientBreakdown?.map((client, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{client.client}</td>
                        <td className="px-4 py-2 text-center">{client.raised}</td>
                        <td className="px-4 py-2 text-center">{client.resolved}</td>
                        <td className="px-4 py-2 text-center">{client.avgTime?.toFixed(1)}</td>
                        <td className="px-4 py-2 text-center">{client.minTime?.toFixed(1)}</td>
                        <td className="px-4 py-2 text-center">{client.maxTime?.toFixed(1)}</td>
                        <td className="px-4 py-2 text-center">{client.medianTime?.toFixed(1)}</td>
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
