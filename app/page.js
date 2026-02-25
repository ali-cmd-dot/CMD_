'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const IndiaMapLeaflet2 = dynamic(
  () => import('./components/IndiaMapLeaflet2'),
  { 
    ssr: false,
    loading: () => <div className="text-center py-20 text-gray-500">Loading map...</div>
  }
)

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts'
import { 
  Activity, AlertTriangle, TrendingUp, Calendar, Users, Clock, Target,
  BarChart3, Video, Settings, CheckCircle2, XCircle,
  Cpu, Zap, Filter, Map as MapIcon, ChevronRight
} from 'lucide-react'

const TABS = [
  { id: 'overview',    label: 'Overview',       icon: BarChart3  },
  { id: 'alerts',      label: 'Alerts',          icon: AlertTriangle },
  { id: 'misalignment',label: 'Misalignment',    icon: Activity   },
  { id: 'videos',      label: 'Videos',          icon: Video      },
  { id: 'issues',      label: 'Issues',          icon: Settings   },
  { id: 'devices',     label: 'Device Movement', icon: Cpu        },
  { id: 'cities2',     label: 'Cities',          icon: MapIcon    },
]

export default function Dashboard() {
  const [alertData,             setAlertData]             = useState(null)
  const [misalignmentData,      setMisalignmentData]      = useState(null)
  const [historicalVideoData,   setHistoricalVideoData]   = useState(null)
  const [generalIssuesData,     setGeneralIssuesData]     = useState(null)
  const [deviceMovementData,    setDeviceMovementData]    = useState(null)
  const [installationTrackerData, setInstallationTrackerData] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // filter states
  const [alertsFilter,      setAlertsFilter]      = useState('')
  const [misalignmentFilter,setMisalignmentFilter] = useState('')
  const [videosFilter,      setVideosFilter]       = useState('')
  const [videoRowsFilter,   setVideoRowsFilter]    = useState('')
  const [videoViewMode,     setVideoViewMode]      = useState('all') // 'all' | 'delivered' | 'not_delivered'
  const [issuesFilter,      setIssuesFilter]       = useState('')
  const [devicesFilter,     setDevicesFilter]      = useState('')
  const [cities2Filter,     setCities2Filter]      = useState('')

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.allSettled([
      fetch('/api/alerts').then(r=>r.ok?r.json():null).then(d=>d&&setAlertData(d)).catch(()=>setAlertData({ totalCount:0,avgPerMonth:0,uniqueClients:0,monthlyData:[],clientBreakdown:[] })),
      fetch('/api/misalignment').then(r=>r.ok?r.json():null).then(d=>d&&setMisalignmentData(d)).catch(()=>setMisalignmentData({ totalRaised:0,totalRectified:0,rectificationRate:0,monthlyData:[],clientBreakdown:[] })),
      fetch('/api/issues').then(r=>r.ok?r.json():null).then(d=>d&&setHistoricalVideoData(d)).catch(()=>setHistoricalVideoData({ totalRequests:0,totalDelivered:0,overallDeliveryRate:0,avgDeliveryTime:0,monthlyData:[],clientBreakdown:[],allRows:[] })),
      fetch('/api/general-issues').then(r=>r.ok?r.json():null).then(d=>d&&setGeneralIssuesData(d)).catch(()=>setGeneralIssuesData({ totalRaised:0,totalResolved:0,resolutionRate:0,avgResolutionTime:0,monthlyData:[],clientBreakdown:[] })),
      fetch('/api/device-movement').then(r=>r.ok?r.json():null).then(d=>d&&setDeviceMovementData(d)).catch(()=>setDeviceMovementData({ totalDevices:0,deployedCount:0,availableCount:0,underRepairCount:0,damagedCount:0,monthlyData:[],deviceDetails:[] })),
      fetch('/api/installation-tracker').then(r=>r.ok?r.json():null).then(d=>d&&setInstallationTrackerData(d)).catch(()=>setInstallationTrackerData({ totalInstallations:0,uniqueCities:0,citiesBreakdown:[],cityCount:{} })),
    ])
    setLoading(false)
  }

  const formatHours = (h) => (!h || h===0) ? '0h' : `${parseFloat(h.toFixed(2))}h`

  /* ── filtered helpers ── */
  const filterAlerts      = () => !alertsFilter       ? alertData.clientBreakdown       : alertData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(alertsFilter.toLowerCase()))
  const filterMisalign    = () => !misalignmentFilter ? misalignmentData.clientBreakdown : misalignmentData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(misalignmentFilter.toLowerCase()))
  const filterVideoCli    = () => !videosFilter       ? historicalVideoData.clientBreakdown : historicalVideoData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(videosFilter.toLowerCase()))
  const filterIssues      = () => !issuesFilter       ? generalIssuesData.clientBreakdown  : generalIssuesData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(issuesFilter.toLowerCase()))
  const filterDevices     = () => !devicesFilter      ? deviceMovementData.deviceDetails   : deviceMovementData.deviceDetails.filter(d=>d.device.toLowerCase().includes(devicesFilter.toLowerCase())||d.status.toLowerCase().includes(devicesFilter.toLowerCase())||d.vehicleNumber.toLowerCase().includes(devicesFilter.toLowerCase()))
  const filterCities2     = () => { if(!installationTrackerData?.citiesBreakdown) return []; return !cities2Filter ? installationTrackerData.citiesBreakdown : installationTrackerData.citiesBreakdown.filter(c=>c.city.toLowerCase().includes(cities2Filter.toLowerCase())) }

  const filterVideoRows = () => {
    let rows = historicalVideoData?.allRows || []
    if (videoViewMode === 'delivered')     rows = rows.filter(r => r.isDelivered)
    if (videoViewMode === 'not_delivered') rows = rows.filter(r => !r.isDelivered)
    if (videoRowsFilter) rows = rows.filter(r =>
      r.client.toLowerCase().includes(videoRowsFilter.toLowerCase()) ||
      r.vehicleNumber.toLowerCase().includes(videoRowsFilter.toLowerCase()) ||
      r.raisedBy.toLowerCase().includes(videoRowsFilter.toLowerCase()) ||
      r.issueDetails.toLowerCase().includes(videoRowsFilter.toLowerCase())
    )
    return rows
  }

  const combineMonthlyData = () => {
    if (!alertData||!misalignmentData||!historicalVideoData||!generalIssuesData) return []
    const months = new Set([
      ...alertData.monthlyData.map(d=>d.month),
      ...misalignmentData.monthlyData.map(d=>d.month),
      ...historicalVideoData.monthlyData.map(d=>d.month),
      ...generalIssuesData.monthlyData.map(d=>d.month),
    ])
    return Array.from(months)
      .sort((a,b)=>new Date(a.replace(' ',' 1, '))-new Date(b.replace(' ',' 1, ')))
      .map(month=>({
        month,
        alerts:       alertData.monthlyData.find(d=>d.month===month)?.total  || 0,
        misalignments:misalignmentData.monthlyData.find(d=>d.month===month)?.raised || 0,
        videos:       historicalVideoData.monthlyData.find(d=>d.month===month)?.requests || 0,
        issues:       generalIssuesData.monthlyData.find(d=>d.month===month)?.raised || 0,
      }))
  }

  /* ═══════════ LOADING ═══════════ */
  if (loading || !alertData || !misalignmentData || !historicalVideoData || !generalIssuesData || !deviceMovementData) {
    return (
      <div style={styles.loadWrap}>
        <div style={styles.loadSpinner} />
        <p style={styles.loadText}>Loading dashboard…</p>
      </div>
    )
  }

  const combinedMonthlyData = combineMonthlyData()
  const notDelivered = (historicalVideoData.totalRequests||0) - (historicalVideoData.totalDelivered||0)

  /* ═══════════ RENDER ═══════════ */
  return (
    <div style={styles.root}>
      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <div style={styles.headerBadge}>LIVE ANALYTICS</div>
            <h1 style={styles.headerTitle}>CAUTIO COMMAND CENTER</h1>
            <p style={styles.headerSub}>Real-time analytics from live Google Sheets</p>
          </div>
          <div style={styles.headerStats}>
            {[
              { label:'Alerts',      val: alertData.totalCount?.toLocaleString() },
              { label:'Video Req',   val: historicalVideoData.totalRequests?.toLocaleString() },
              { label:'Issues',      val: generalIssuesData.totalRaised?.toLocaleString() },
            ].map(s=>(
              <div key={s.label} style={styles.headerStat}>
                <div style={styles.headerStatVal}>{s.val}</div>
                <div style={styles.headerStatLbl}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav style={styles.tabBar}>
        <div style={styles.tabInner}>
          {TABS.map((tab,i) => {
            const active = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(active ? styles.tabActive : {}),
                  animationDelay: `${i*50}ms`,
                }}
              >
                <Icon size={15} style={{ flexShrink:0 }} />
                <span>{tab.label}</span>
                {active && <div style={styles.tabDot} />}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main style={styles.main}>

        {/* ════════════ OVERVIEW ════════════ */}
        {activeTab==='overview' && (
          <div style={styles.section}>
            {/* KPI row */}
            <div style={styles.kpiGrid}>
              {[
                { label:'Total Alerts',   val:alertData.totalCount?.toLocaleString(),          sub:`${alertData.uniqueClients} clients`,              accent:'#ef4444', icon:AlertTriangle },
                { label:'Misalignments',  val:misalignmentData.totalRaised?.toLocaleString(),  sub:`${misalignmentData.rectificationRate}% fixed`,     accent:'#f97316', icon:Activity },
                { label:'Video Requests', val:historicalVideoData.totalRequests?.toLocaleString(), sub:`${historicalVideoData.overallDeliveryRate}% delivered`, accent:'#8b5cf6', icon:Video },
                { label:'General Issues', val:generalIssuesData.totalRaised?.toLocaleString(), sub:`${generalIssuesData.resolutionRate}% resolved`,   accent:'#10b981', icon:Settings },
              ].map(k=>{
                const Icon=k.icon
                return (
                  <div key={k.label} style={{...styles.kpiCard, borderTop:`3px solid ${k.accent}`}}>
                    <div style={{...styles.kpiIcon, background:`${k.accent}18`}}>
                      <Icon size={22} color={k.accent} />
                    </div>
                    <div style={styles.kpiVal}>{k.val}</div>
                    <div style={styles.kpiSub}>{k.sub}</div>
                    <div style={styles.kpiLabel}>{k.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Chart */}
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>Monthly Trends — All Categories</span></div>
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={combinedMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{fontSize:12,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{fontSize:12,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize:12,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={styles.tooltip} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="alerts" fill="#ef4444" name="Alerts" radius={[4,4,0,0]} />
                  <Bar yAxisId="left" dataKey="misalignments" fill="#f97316" name="Misalignments" radius={[4,4,0,0]} />
                  <Line yAxisId="right" type="monotone" dataKey="videos" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Videos" />
                  <Line yAxisId="right" type="monotone" dataKey="issues" stroke="#10b981" strokeWidth={2.5} dot={false} name="Issues" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom 2-col */}
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Performance Summary</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    { label:'Video Delivery',   sub:`Avg: ${formatHours(historicalVideoData.avgDeliveryTime)}`,  val:`${historicalVideoData.overallDeliveryRate}%`, color:'#8b5cf6', bg:'#f5f3ff' },
                    { label:'Issue Resolution', sub:`Avg: ${generalIssuesData.avgResolutionTime}`,               val:`${generalIssuesData.resolutionRate}%`,         color:'#10b981', bg:'#f0fdf4' },
                    { label:'Misalignment',     sub:`Monthly avg: ${misalignmentData.avgRaisedPerMonth?.toFixed(1)}`, val:`${misalignmentData.rectificationRate}%`, color:'#f97316', bg:'#fff7ed' },
                  ].map(p=>(
                    <div key={p.label} style={{...styles.perfRow, background:p.bg}}>
                      <div>
                        <div style={styles.perfLabel}>{p.label}</div>
                        <div style={styles.perfSub}>{p.sub}</div>
                      </div>
                      <div style={{...styles.perfVal, color:p.color}}>{p.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Device Health</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div style={{...styles.perfRow,background:'#eff6ff'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <Cpu size={28} color="#3b82f6" />
                      <div>
                        <div style={styles.perfLabel}>Total Deployed</div>
                        <div style={styles.perfSub}>Active devices</div>
                      </div>
                    </div>
                    <div style={{...styles.perfVal,color:'#3b82f6'}}>{deviceMovementData.deployedCount?.toLocaleString()}</div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                    {[
                      { label:'Available', val:deviceMovementData.availableCount,   bg:'#fef3c7',color:'#92400e' },
                      { label:'In Repair', val:deviceMovementData.underRepairCount, bg:'#ffedd5',color:'#9a3412' },
                      { label:'Damaged',   val:deviceMovementData.damagedCount,     bg:'#fee2e2',color:'#991b1b' },
                    ].map(d=>(
                      <div key={d.label} style={{background:d.bg,borderRadius:10,padding:'14px 10px',textAlign:'center'}}>
                        <div style={{fontSize:24,fontWeight:800,color:d.color}}>{d.val}</div>
                        <div style={{fontSize:11,color:d.color,fontWeight:600,marginTop:2}}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ ALERTS ════════════ */}
        {activeTab==='alerts' && (
          <div style={styles.section}>
            <div style={styles.kpiGrid}>
              {[
                { label:'Total Alerts',  val:alertData.totalCount?.toLocaleString(),                                       sub:'All alerts',     accent:'#ef4444', icon:AlertTriangle },
                { label:'Monthly Avg',   val:alertData.avgPerMonth?.toFixed(1),                                            sub:'Per month',      accent:'#3b82f6', icon:TrendingUp },
                { label:'Active Clients',val:alertData.uniqueClients,                                                      sub:'Unique clients', accent:'#10b981', icon:Users },
                { label:'Latest Month',  val:alertData.monthlyData?.[alertData.monthlyData.length-1]?.total,               sub:alertData.monthlyData?.[alertData.monthlyData.length-1]?.month||'N/A', accent:'#8b5cf6', icon:Calendar },
              ].map(k=>{
                const Icon=k.icon
                return(
                  <div key={k.label} style={{...styles.kpiCard,borderTop:`3px solid ${k.accent}`}}>
                    <div style={{...styles.kpiIcon,background:`${k.accent}18`}}><Icon size={22} color={k.accent}/></div>
                    <div style={styles.kpiVal}>{k.val}</div>
                    <div style={styles.kpiSub}>{k.sub}</div>
                    <div style={styles.kpiLabel}>{k.label}</div>
                  </div>
                )
              })}
            </div>
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Monthly Trends</span></div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={alertData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={styles.tooltip}/>
                    <Legend/>
                    <Bar dataKey="total" fill="#ef4444" name="Alerts" radius={[4,4,0,0]}/>
                    <Bar dataKey="clients" fill="#10b981" name="Clients" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <span style={styles.cardTitle}>Client Distribution</span>
                  <div style={styles.filterBox}>
                    <Filter size={14} color="#94a3b8"/>
                    <input style={styles.filterInput} placeholder="Search client…" value={alertsFilter} onChange={e=>setAlertsFilter(e.target.value)}/>
                  </div>
                </div>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead><tr style={styles.thead}>
                      <th style={styles.th}>Client</th>
                      <th style={{...styles.th,textAlign:'center'}}>Count</th>
                      <th style={{...styles.th,textAlign:'center'}}>%</th>
                    </tr></thead>
                    <tbody>
                      {filterAlerts().map((c,i)=>(
                        <tr key={i} style={styles.tr}>
                          <td style={styles.td}>{c.client}</td>
                          <td style={{...styles.td,textAlign:'center',fontWeight:700}}>{c.count}</td>
                          <td style={{...styles.td,textAlign:'center'}}><span style={styles.badge}>{c.percentage}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ MISALIGNMENT ════════════ */}
        {activeTab==='misalignment' && (
          <div style={styles.section}>
            <div style={{...styles.kpiGrid, gridTemplateColumns:'repeat(5,1fr)'}}>
              {[
                { label:'Total Raised', val:misalignmentData.totalRaised?.toLocaleString(), sub:'Raised',     accent:'#ef4444', icon:AlertTriangle },
                { label:'Total Fixed',  val:misalignmentData.totalRectified?.toLocaleString(), sub:'Rectified', accent:'#10b981', icon:CheckCircle2 },
                { label:'Fix Rate',     val:`${misalignmentData.rectificationRate||0}%`,     sub:'Success',    accent:'#3b82f6', icon:TrendingUp },
                { label:'Monthly Avg',  val:misalignmentData.avgRaisedPerMonth?.toFixed(1),  sub:'Per month',  accent:'#f97316', icon:Calendar },
                { label:'Clients',      val:misalignmentData.uniqueClients,                  sub:'Affected',   accent:'#8b5cf6', icon:Users },
              ].map(k=>{ const Icon=k.icon; return(
                <div key={k.label} style={{...styles.kpiCard,borderTop:`3px solid ${k.accent}`}}>
                  <div style={{...styles.kpiIcon,background:`${k.accent}18`}}><Icon size={20} color={k.accent}/></div>
                  <div style={styles.kpiVal}>{k.val}</div>
                  <div style={styles.kpiSub}>{k.sub}</div>
                  <div style={styles.kpiLabel}>{k.label}</div>
                </div>
              )})}
            </div>
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Monthly Trends</span></div>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={misalignmentData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="left" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={styles.tooltip}/>
                    <Legend/>
                    <Bar yAxisId="left" dataKey="raised" fill="#ef4444" name="Raised" radius={[4,4,0,0]}/>
                    <Bar yAxisId="left" dataKey="rectified" fill="#10b981" name="Fixed" radius={[4,4,0,0]}/>
                    <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Clients"/>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <span style={styles.cardTitle}>Client Performance</span>
                  <div style={styles.filterBox}>
                    <Filter size={14} color="#94a3b8"/>
                    <input style={styles.filterInput} placeholder="Search…" value={misalignmentFilter} onChange={e=>setMisalignmentFilter(e.target.value)}/>
                  </div>
                </div>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead><tr style={styles.thead}>
                      <th style={styles.th}>Client</th>
                      <th style={{...styles.th,textAlign:'center'}}>Raised</th>
                      <th style={{...styles.th,textAlign:'center'}}>Fixed</th>
                      <th style={{...styles.th,textAlign:'center'}}>Rate</th>
                      <th style={{...styles.th,textAlign:'center'}}>Share</th>
                    </tr></thead>
                    <tbody>
                      {filterMisalign().map((c,i)=>(
                        <tr key={i} style={styles.tr}>
                          <td style={{...styles.td,fontSize:11}}>{c.client}</td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.raised}</td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.rectified}</td>
                          <td style={{...styles.td,textAlign:'center'}}>
                            <span style={{...styles.pill, background: c.rectificationRate>70?'#dcfce7':c.rectificationRate>40?'#fef9c3':'#fee2e2', color: c.rectificationRate>70?'#166534':c.rectificationRate>40?'#854d0e':'#991b1b'}}>{c.rectificationRate}%</span>
                          </td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ VIDEOS ════════════ */}
        {activeTab==='videos' && (
          <div style={styles.section}>

            {/* KPI row */}
            <div style={{...styles.kpiGrid, gridTemplateColumns:'repeat(5,1fr)'}}>
              {[
                { label:'Requests',  val:historicalVideoData.totalRequests?.toLocaleString(),   sub:'Total',    accent:'#8b5cf6', icon:Video },
                { label:'Delivered', val:historicalVideoData.totalDelivered?.toLocaleString(),  sub:`${historicalVideoData.overallDeliveryRate}%`, accent:'#10b981', icon:CheckCircle2 },
                { label:'Avg Time',  val:formatHours(historicalVideoData.avgDeliveryTime),      sub:'Delivery', accent:'#3b82f6', icon:Clock },
                { label:'Fastest',   val:formatHours(historicalVideoData.fastestDeliveryTime),  sub:'Best',     accent:'#059669', icon:TrendingUp },
                { label:'Slowest',   val:formatHours(historicalVideoData.slowestDeliveryTime),  sub:'Worst',    accent:'#dc2626', icon:XCircle },
              ].map(k=>{ const Icon=k.icon; return(
                <div key={k.label} style={{...styles.kpiCard,borderTop:`3px solid ${k.accent}`}}>
                  <div style={{...styles.kpiIcon,background:`${k.accent}18`}}><Icon size={20} color={k.accent}/></div>
                  <div style={styles.kpiVal}>{k.val}</div>
                  <div style={styles.kpiSub}>{k.sub}</div>
                  <div style={styles.kpiLabel}>{k.label}</div>
                </div>
              )})}
            </div>

            {/* Charts */}
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Monthly Trends</span></div>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={historicalVideoData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="left" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={styles.tooltip}/>
                    <Legend/>
                    <Bar yAxisId="left" dataKey="requests" fill="#8b5cf6" name="Requests" radius={[4,4,0,0]}/>
                    <Bar yAxisId="left" dataKey="delivered" fill="#10b981" name="Delivered" radius={[4,4,0,0]}/>
                    <Line yAxisId="right" type="monotone" dataKey="avgDeliveryTime" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Avg(h)"/>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <span style={styles.cardTitle}>Client Performance</span>
                  <div style={styles.filterBox}>
                    <Filter size={14} color="#94a3b8"/>
                    <input style={styles.filterInput} placeholder="Search…" value={videosFilter} onChange={e=>setVideosFilter(e.target.value)}/>
                  </div>
                </div>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead><tr style={styles.thead}>
                      <th style={styles.th}>Client</th>
                      <th style={{...styles.th,textAlign:'center'}}>Req</th>
                      <th style={{...styles.th,textAlign:'center'}}>Del</th>
                      <th style={{...styles.th,textAlign:'center'}}>Rate</th>
                      <th style={{...styles.th,textAlign:'center'}}>Avg(h)</th>
                    </tr></thead>
                    <tbody>
                      {filterVideoCli().map((c,i)=>(
                        <tr key={i} style={styles.tr}>
                          <td style={{...styles.td,fontSize:11}}>{c.client}</td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.requests}</td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.delivered}</td>
                          <td style={{...styles.td,textAlign:'center'}}>
                            <span style={{...styles.pill, background:c.deliveryRate>80?'#dcfce7':c.deliveryRate>60?'#fef9c3':'#fee2e2', color:c.deliveryRate>80?'#166534':c.deliveryRate>60?'#854d0e':'#991b1b'}}>{c.deliveryRate}%</span>
                          </td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.avgDeliveryTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── BEAUTIFUL TOGGLE SECTION ── */}
            <div style={styles.card}>
              {/* Header with toggle */}
              <div style={styles.videoTableHeader}>
                <div>
                  <h3 style={styles.cardTitle}>All Video Requests</h3>
                  <p style={styles.videoSubtitle}>
                    <span style={{color:'#10b981',fontWeight:700}}>{historicalVideoData.totalDelivered} delivered</span>
                    <span style={{color:'#cbd5e1',margin:'0 8px'}}>·</span>
                    <span style={{color:'#ef4444',fontWeight:700}}>{notDelivered} pending</span>
                  </p>
                </div>

                {/* Toggle buttons */}
                <div style={styles.toggleGroup}>
                  {[
                    { id:'all',           label:'All',           count: historicalVideoData.totalRequests,    emoji:'📋' },
                    { id:'delivered',     label:'Delivered',     count: historicalVideoData.totalDelivered,   emoji:'✅' },
                    { id:'not_delivered', label:'Not Delivered', count: notDelivered,                         emoji:'⏳' },
                  ].map(btn=>{
                    const active = videoViewMode===btn.id
                    const accentMap = { all:'#3b82f6', delivered:'#10b981', not_delivered:'#ef4444' }
                    const accent = accentMap[btn.id]
                    return (
                      <button
                        key={btn.id}
                        onClick={()=>setVideoViewMode(btn.id)}
                        style={{
                          ...styles.toggleBtn,
                          ...(active ? {
                            background: accent,
                            color: '#fff',
                            boxShadow: `0 4px 14px ${accent}55`,
                            transform: 'translateY(-1px)',
                          } : {
                            background: '#f8fafc',
                            color: '#64748b',
                            border: `1.5px solid #e2e8f0`,
                          })
                        }}
                      >
                        <span style={{fontSize:16}}>{btn.emoji}</span>
                        <span style={{fontWeight:700}}>{btn.label}</span>
                        <span style={{
                          background: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                          color: active ? '#fff' : '#64748b',
                          borderRadius: 20,
                          padding: '2px 8px',
                          fontSize: 12,
                          fontWeight: 800,
                        }}>
                          {btn.count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Search */}
                <div style={styles.filterBox}>
                  <Filter size={14} color="#94a3b8"/>
                  <input
                    style={{...styles.filterInput, width:200}}
                    placeholder="Search client, vehicle…"
                    value={videoRowsFilter}
                    onChange={e=>setVideoRowsFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Status bar */}
              <div style={styles.statusBar}>
                <div style={{...styles.statusSegment, flex:historicalVideoData.totalDelivered, background:'#10b981'}} title={`Delivered: ${historicalVideoData.totalDelivered}`}/>
                <div style={{...styles.statusSegment, flex:notDelivered, background:'#ef4444'}} title={`Not Delivered: ${notDelivered}`}/>
              </div>

              {/* Table */}
              <div style={{overflowX:'auto'}}>
                <div style={{maxHeight:520,overflowY:'auto'}}>
                  <table style={{...styles.table,minWidth:1000}}>
                    <thead>
                      <tr style={styles.thead}>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Clients</th>
                        <th style={styles.th}>Timestamp Issues Raised</th>
                        <th style={styles.th}>Issue Details</th>
                        <th style={styles.th}>Vehicle Number</th>
                        <th style={styles.th}>Raised by</th>
                        <th style={styles.th}>Date - Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterVideoRows().map((row,i)=>(
                        <tr key={i} style={{
                          ...styles.tr,
                          background: !row.isDelivered ? '#fff5f5' : 'white',
                        }}>
                          <td style={{...styles.td,color:'#94a3b8',fontSize:11}}>{i+1}</td>
                          <td style={styles.td}>
                            {row.isDelivered
                              ? <span style={{...styles.pill,background:'#dcfce7',color:'#166534',display:'inline-flex',alignItems:'center',gap:4}}><CheckCircle2 size={11}/>Delivered</span>
                              : <span style={{...styles.pill,background:'#fee2e2',color:'#991b1b',display:'inline-flex',alignItems:'center',gap:4}}><XCircle size={11}/>Pending</span>
                            }
                          </td>
                          <td style={{...styles.td,fontWeight:600,fontSize:12}}>{row.client}</td>
                          <td style={{...styles.td,fontSize:11,whiteSpace:'nowrap',color:'#64748b'}}>{row.timestampRaised}</td>
                          <td style={{...styles.td,fontSize:11,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#64748b'}} title={row.issueDetails}>{row.issueDetails}</td>
                          <td style={{...styles.td,fontSize:11,fontFamily:'monospace',color:'#475569'}}>{row.vehicleNumber}</td>
                          <td style={{...styles.td,fontSize:11,color:'#64748b'}}>{row.raisedBy}</td>
                          <td style={{...styles.td,fontSize:11,whiteSpace:'nowrap',color:'#64748b'}}>{row.currentStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filterVideoRows().length===0 && (
                    <div style={{textAlign:'center',padding:'48px 0',color:'#94a3b8'}}>No records found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ ISSUES ════════════ */}
        {activeTab==='issues' && (
          <div style={styles.section}>
            <div style={{...styles.kpiGrid,gridTemplateColumns:'repeat(5,1fr)'}}>
              {[
                { label:'Raised',   val:generalIssuesData.totalRaised?.toLocaleString(),  sub:'Total',     accent:'#ef4444', icon:AlertTriangle },
                { label:'Resolved', val:generalIssuesData.totalResolved?.toLocaleString(),sub:'Fixed',     accent:'#10b981', icon:CheckCircle2 },
                { label:'Rate',     val:`${generalIssuesData.resolutionRate}%`,            sub:'Success',   accent:'#3b82f6', icon:Target },
                { label:'Avg Time', val:generalIssuesData.avgResolutionTime||'0h',         sub:'Resolution',accent:'#8b5cf6', icon:Clock },
                { label:'Median',   val:generalIssuesData.medianResolutionTime||'0h',      sub:'Typical',   accent:'#f97316', icon:TrendingUp },
              ].map(k=>{ const Icon=k.icon; return(
                <div key={k.label} style={{...styles.kpiCard,borderTop:`3px solid ${k.accent}`}}>
                  <div style={{...styles.kpiIcon,background:`${k.accent}18`}}><Icon size={20} color={k.accent}/></div>
                  <div style={styles.kpiVal}>{k.val}</div>
                  <div style={styles.kpiSub}>{k.sub}</div>
                  <div style={styles.kpiLabel}>{k.label}</div>
                </div>
              )})}
            </div>
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Monthly Overview</span></div>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={generalIssuesData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="left" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={styles.tooltip}/>
                    <Legend/>
                    <Bar yAxisId="left" dataKey="raised" fill="#ef4444" name="Raised" radius={[4,4,0,0]}/>
                    <Bar yAxisId="left" dataKey="resolved" fill="#10b981" name="Resolved" radius={[4,4,0,0]}/>
                    <Line yAxisId="right" type="monotone" dataKey="avgTimeHours" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Avg(h)"/>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <span style={styles.cardTitle}>Client Performance</span>
                  <div style={styles.filterBox}>
                    <Filter size={14} color="#94a3b8"/>
                    <input style={styles.filterInput} placeholder="Search…" value={issuesFilter} onChange={e=>setIssuesFilter(e.target.value)}/>
                  </div>
                </div>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead><tr style={styles.thead}>
                      <th style={styles.th}>Client</th>
                      <th style={{...styles.th,textAlign:'center'}}>Raised</th>
                      <th style={{...styles.th,textAlign:'center'}}>Resolved</th>
                      <th style={{...styles.th,textAlign:'center'}}>Rate</th>
                      <th style={{...styles.th,textAlign:'center'}}>Time</th>
                    </tr></thead>
                    <tbody>
                      {filterIssues().map((c,i)=>(
                        <tr key={i} style={styles.tr}>
                          <td style={{...styles.td,fontSize:11}}>{c.client}</td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.raised}</td>
                          <td style={{...styles.td,textAlign:'center'}}>{c.resolved}</td>
                          <td style={{...styles.td,textAlign:'center'}}>
                            <span style={{...styles.pill,background:c.resolutionRate>80?'#dcfce7':c.resolutionRate>60?'#fef9c3':'#fee2e2',color:c.resolutionRate>80?'#166534':c.resolutionRate>60?'#854d0e':'#991b1b'}}>{c.resolutionRate}%</span>
                          </td>
                          <td style={{...styles.td,textAlign:'center',fontSize:11}}>{c.avgTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>Monthly Analysis</span></div>
              <div style={{overflowX:'auto'}}>
                <table style={styles.table}>
                  <thead><tr style={styles.thead}>
                    <th style={styles.th}>Month</th>
                    <th style={{...styles.th,textAlign:'center',color:'#ef4444'}}>Raised</th>
                    <th style={{...styles.th,textAlign:'center',color:'#10b981'}}>Same Month</th>
                    <th style={{...styles.th,textAlign:'center',color:'#8b5cf6'}}>Later</th>
                    <th style={{...styles.th,textAlign:'center',color:'#3b82f6'}}>Carry Fwd</th>
                    <th style={{...styles.th,textAlign:'center',color:'#f97316'}}>Pending</th>
                    <th style={{...styles.th,textAlign:'center'}}>Rate%</th>
                    <th style={{...styles.th,textAlign:'center',color:'#6366f1'}}>Avg Time</th>
                  </tr></thead>
                  <tbody>
                    {generalIssuesData.monthlyData?.map((m,i)=>(
                      <tr key={i} style={styles.tr}>
                        <td style={{...styles.td,fontWeight:600}}>
                          {m.month}{m.isCurrentMonth&&<span style={{marginLeft:6,...styles.pill,background:'#dbeafe',color:'#1e40af'}}>NOW</span>}
                        </td>
                        <td style={{...styles.td,textAlign:'center'}}><span style={{...styles.pill,background:'#fee2e2',color:'#991b1b'}}>{m.raised}</span></td>
                        <td style={{...styles.td,textAlign:'center'}}><span style={{...styles.pill,background:'#dcfce7',color:'#166534'}}>{m.resolvedSameMonth}</span></td>
                        <td style={{...styles.td,textAlign:'center'}}>{m.resolvedLaterMonths>0?<span style={{...styles.pill,background:'#f3e8ff',color:'#6b21a8'}}>{m.resolvedLaterMonths}</span>:'-'}</td>
                        <td style={{...styles.td,textAlign:'center'}}>{m.carryForwardIn>0?<span style={{...styles.pill,background:'#dbeafe',color:'#1e40af'}}>{m.carryForwardIn}</span>:'-'}</td>
                        <td style={{...styles.td,textAlign:'center'}}>{m.stillPending>0?<span style={{...styles.pill,background:'#ffedd5',color:'#9a3412'}}>{m.stillPending}</span>:'-'}</td>
                        <td style={{...styles.td,textAlign:'center'}}>
                          {m.resolutionRate!==null
                            ?<span style={{...styles.pill,background:m.resolutionRate>=80?'#dcfce7':m.resolutionRate>=60?'#fef9c3':'#fee2e2',color:m.resolutionRate>=80?'#166534':m.resolutionRate>=60?'#854d0e':'#991b1b'}}>{m.resolutionRate}%</span>
                            :<span style={{color:'#94a3b8',fontSize:11}}>TBD</span>}
                        </td>
                        <td style={{...styles.td,textAlign:'center'}}>{m.avgTime!=='0h'?<span style={{...styles.pill,background:'#e0e7ff',color:'#3730a3'}}>{m.avgTime}</span>:'-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ DEVICES ════════════ */}
        {activeTab==='devices' && (
          <div style={styles.section}>
            <div style={{...styles.kpiGrid,gridTemplateColumns:'repeat(5,1fr)'}}>
              {[
                { label:'Total',    val:deviceMovementData.totalDevices?.toLocaleString(),    sub:'All devices', accent:'#3b82f6', icon:Cpu },
                { label:'Deployed', val:deviceMovementData.deployedCount?.toLocaleString(),   sub:`${deviceMovementData.deployedPercentage}%`,   accent:'#10b981', icon:CheckCircle2 },
                { label:'Available',val:deviceMovementData.availableCount?.toLocaleString(),  sub:`${deviceMovementData.availablePercentage}%`,  accent:'#f59e0b', icon:Zap },
                { label:'Repair',   val:deviceMovementData.underRepairCount?.toLocaleString(),sub:`${deviceMovementData.underRepairPercentage}%`,accent:'#f97316', icon:Settings },
                { label:'Damaged',  val:deviceMovementData.damagedCount?.toLocaleString(),    sub:`${deviceMovementData.damagedPercentage}%`,    accent:'#ef4444', icon:XCircle },
              ].map(k=>{ const Icon=k.icon; return(
                <div key={k.label} style={{...styles.kpiCard,borderTop:`3px solid ${k.accent}`}}>
                  <div style={{...styles.kpiIcon,background:`${k.accent}18`}}><Icon size={20} color={k.accent}/></div>
                  <div style={styles.kpiVal}>{k.val}</div>
                  <div style={styles.kpiSub}>{k.sub}</div>
                  <div style={styles.kpiLabel}>{k.label}</div>
                </div>
              )})}
            </div>
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Status Distribution</span></div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={[
                      {name:'Deployed',value:deviceMovementData.deployedCount},
                      {name:'Available',value:deviceMovementData.availableCount},
                      {name:'Repair',value:deviceMovementData.underRepairCount},
                      {name:'Damaged',value:deviceMovementData.damagedCount},
                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {['#10b981','#f59e0b','#f97316','#ef4444'].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={styles.tooltip}/><Legend/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.card}>
                <div style={styles.cardHead}><span style={styles.cardTitle}>Monthly Deployments</span></div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={deviceMovementData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={styles.tooltip}/><Legend/>
                    <Bar dataKey="deployed" fill="#10b981" name="Deployed" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHead}>
                <span style={styles.cardTitle}>Device Registry</span>
                <div style={styles.filterBox}>
                  <Filter size={14} color="#94a3b8"/>
                  <input style={styles.filterInput} placeholder="Search device, status…" value={devicesFilter} onChange={e=>setDevicesFilter(e.target.value)}/>
                </div>
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr style={styles.thead}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Device ID</th>
                    <th style={{...styles.th,textAlign:'center'}}>Status</th>
                    <th style={styles.th}>Vehicle</th>
                    <th style={styles.th}>Install Date</th>
                  </tr></thead>
                  <tbody>
                    {filterDevices().map((d,i)=>(
                      <tr key={i} style={styles.tr}>
                        <td style={{...styles.td,color:'#94a3b8'}}>{i+1}</td>
                        <td style={{...styles.td,fontSize:11,fontFamily:'monospace'}}>{d.device}</td>
                        <td style={{...styles.td,textAlign:'center'}}>
                          <span style={{...styles.pill,
                            background:d.status==='Deployed'?'#dcfce7':d.status==='Under Repair'?'#ffedd5':d.status==='Device Damaged'?'#fee2e2':'#fef9c3',
                            color:d.status==='Deployed'?'#166534':d.status==='Under Repair'?'#9a3412':d.status==='Device Damaged'?'#991b1b':'#854d0e',
                          }}>{d.status}</span>
                        </td>
                        <td style={{...styles.td,fontSize:11}}>{d.vehicleNumber}</td>
                        <td style={{...styles.td,fontSize:11}}>{d.installationDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ CITIES ════════════ */}
        {activeTab==='cities2' && (
          <div style={styles.section}>
            <div style={styles.kpiGrid}>
              {[
                { label:'Total Installations', val:installationTrackerData?.totalInstallations?.toLocaleString()||'0', sub:'Devices installed', accent:'#3b82f6', icon:Cpu },
                { label:'Cities Count',         val:installationTrackerData?.uniqueCities||'0',                        sub:'Locations covered', accent:'#10b981', icon:MapIcon },
                { label:'Top City',             val:(installationTrackerData?.citiesBreakdown?.[0]?.city||'N/A').toUpperCase(), sub:`${installationTrackerData?.citiesBreakdown?.[0]?.count||0} devices`, accent:'#8b5cf6', icon:TrendingUp },
              ].map(k=>{ const Icon=k.icon; return(
                <div key={k.label} style={{...styles.kpiCard,borderTop:`3px solid ${k.accent}`}}>
                  <div style={{...styles.kpiIcon,background:`${k.accent}18`}}><Icon size={20} color={k.accent}/></div>
                  <div style={styles.kpiVal}>{k.val}</div>
                  <div style={styles.kpiSub}>{k.sub}</div>
                  <div style={styles.kpiLabel}>{k.label}</div>
                </div>
              )})}
            </div>
            <div style={{...styles.card,height:640,padding:0,overflow:'hidden'}}>
              <div style={{padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <span style={styles.cardTitle}>India Device Map</span>
                <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                  <span style={{fontSize:13,color:'#64748b'}}><b>{installationTrackerData?.totalInstallations||0}</b> devices · <b>{installationTrackerData?.uniqueCities||0}</b> cities</span>
                  <div style={styles.filterBox}>
                    <Filter size={14} color="#94a3b8"/>
                    <input style={styles.filterInput} placeholder="Search city…" value={cities2Filter} onChange={e=>setCities2Filter(e.target.value)}/>
                  </div>
                </div>
              </div>
              <div style={{height:'calc(100% - 65px)'}}>
                <IndiaMapLeaflet2 installationTrackerData={installationTrackerData}/>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHead}><span style={styles.cardTitle}>Cities Table</span></div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr style={styles.thead}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>City</th>
                    <th style={{...styles.th,textAlign:'center'}}>Devices</th>
                    <th style={{...styles.th,textAlign:'center'}}>Share</th>
                  </tr></thead>
                  <tbody>
                    {filterCities2().map((c,i)=>(
                      <tr key={i} style={styles.tr}>
                        <td style={{...styles.td,color:'#94a3b8'}}>{i+1}</td>
                        <td style={{...styles.td,fontWeight:600,textTransform:'capitalize'}}>{c.city}</td>
                        <td style={{...styles.td,textAlign:'center'}}>
                          <span style={{...styles.pill,background:c.count>10?'#dcfce7':c.count>5?'#fef9c3':'#dbeafe',color:c.count>10?'#166534':c.count>5?'#854d0e':'#1e40af',fontWeight:700}}>{c.count}</span>
                        </td>
                        <td style={{...styles.td,textAlign:'center'}}>{c.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

/* ═══════════════════════════════════════
   STYLES
═══════════════════════════════════════ */
const styles = {
  root: {
    minHeight: '100vh',
    width: '100%',
    background: '#f8fafc',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
  },

  /* Loading */
  loadWrap: { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', gap:16 },
  loadSpinner: { width:48, height:48, border:'4px solid #e2e8f0', borderTop:'4px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  loadText: { color:'#64748b', fontSize:16, fontWeight:500 },

  /* Header */
  header: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
    padding: '28px 32px',
    width: '100%',
  },
  headerInner: { display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 },
  headerBadge: { display:'inline-block', background:'rgba(167,139,250,0.25)', color:'#c4b5fd', fontSize:10, fontWeight:800, letterSpacing:'0.12em', padding:'4px 10px', borderRadius:20, marginBottom:8, border:'1px solid rgba(167,139,250,0.3)' },
  headerTitle: { color:'#fff', fontSize:26, fontWeight:900, letterSpacing:'-0.02em', margin:0 },
  headerSub:   { color:'#a5b4fc', fontSize:13, marginTop:4 },
  headerStats: { display:'flex', gap:24 },
  headerStat:  { textAlign:'center' },
  headerStatVal:{ color:'#fff', fontSize:22, fontWeight:800 },
  headerStatLbl:{ color:'#a5b4fc', fontSize:11, marginTop:2, textTransform:'uppercase', letterSpacing:'0.06em' },

  /* Tab bar */
  tabBar: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  tabInner: { display:'flex', gap:0, overflowX:'auto' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '14px 18px',
    fontSize: 13, fontWeight: 600,
    color: '#64748b',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.18s ease',
    position: 'relative',
  },
  tabActive: {
    color: '#4f46e5',
    borderBottom: '2px solid #4f46e5',
    background: '#fafafe',
  },
  tabDot: { width:5, height:5, borderRadius:'50%', background:'#4f46e5', position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)' },

  /* Main */
  main: { padding: '28px 24px', width:'100%', maxWidth:'100%', boxSizing:'border-box' },
  section: { display:'flex', flexDirection:'column', gap:20 },

  /* KPI grid */
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 },
  kpiCard: {
    background:'#fff', borderRadius:14, padding:'20px 20px 16px',
    boxShadow:'0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
    display:'flex', flexDirection:'column', gap:4,
    transition:'box-shadow 0.2s ease, transform 0.2s ease',
    cursor:'default',
  },
  kpiIcon: { width:42, height:42, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 },
  kpiVal:  { fontSize:28, fontWeight:900, color:'#0f172a', letterSpacing:'-0.02em', lineHeight:1 },
  kpiSub:  { fontSize:12, color:'#94a3b8', fontWeight:500 },
  kpiLabel:{ fontSize:13, color:'#475569', fontWeight:700, marginTop:10, paddingTop:10, borderTop:'1px solid #f1f5f9' },

  /* Card */
  card: { background:'#fff', borderRadius:14, padding:'20px 24px', boxShadow:'0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)' },
  cardHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 },
  cardTitle: { fontSize:15, fontWeight:800, color:'#1e293b' },

  /* Two col */
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },

  /* Table */
  tableWrap: { maxHeight:320, overflowY:'auto' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#f8fafc', position:'sticky', top:0 },
  th: { padding:'10px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' },
  tr: { borderBottom:'1px solid #f1f5f9', transition:'background 0.1s ease' },
  td: { padding:'10px 12px', fontSize:13, color:'#334155' },

  /* Pills & badges */
  pill: { display:'inline-block', padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:700 },
  badge: { display:'inline-block', background:'#f1f5f9', color:'#475569', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 },

  /* Filter */
  filterBox: { display:'flex', alignItems:'center', gap:6, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 10px' },
  filterInput: { border:'none', outline:'none', background:'transparent', fontSize:12, color:'#475569', width:140 },

  /* Performance rows */
  perfRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:10 },
  perfLabel: { fontSize:14, fontWeight:700, color:'#334155' },
  perfSub: { fontSize:11, color:'#94a3b8', marginTop:2 },
  perfVal: { fontSize:26, fontWeight:900 },

  /* Tooltip */
  tooltip: { background:'#1e293b', border:'none', borderRadius:10, color:'#fff', fontSize:12, padding:'8px 12px' },

  /* Video table header */
  videoTableHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:14 },
  videoSubtitle: { fontSize:13, color:'#94a3b8', marginTop:4 },

  /* Toggle */
  toggleGroup: { display:'flex', gap:8, alignItems:'center' },
  toggleBtn: {
    display:'flex', alignItems:'center', gap:8,
    padding:'9px 16px', borderRadius:10,
    fontSize:13, fontWeight:600,
    border:'none', cursor:'pointer',
    transition:'all 0.18s cubic-bezier(0.4,0,0.2,1)',
    outline:'none',
  },

  /* Status bar */
  statusBar: { display:'flex', height:4, borderRadius:4, overflow:'hidden', marginBottom:16, background:'#f1f5f9' },
  statusSegment: { height:'100%', transition:'flex 0.4s ease' },
}
