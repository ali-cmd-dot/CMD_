'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const IndiaMapLeaflet2 = dynamic(
  () => import('./components/IndiaMapLeaflet2'),
  {
    ssr: false,
    loading: () => (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#060e08' }}>
        <div style={{ textAlign:'center' }}>
          <div className="loading-spinner-clean" />
          <p style={{ color:'rgba(255,255,255,0.4)', marginTop:16, fontSize:14 }}>Loading map…</p>
        </div>
      </div>
    )
  }
)

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts'
import {
  Activity, AlertTriangle, TrendingUp, Calendar, Users, Clock, Target,
  BarChart3, Video, Settings, CheckCircle2, XCircle,
  Cpu, Zap, Filter, Map as MapIcon
} from 'lucide-react'

// ── Brand colors ──
const C = {
  bg:           '#060e08',
  surface:      '#0a1a0d',
  card:         '#0d1f10',
  cardHover:    '#112614',
  elevated:     '#152c19',
  accent:       '#22c55e',
  accentBright: '#4ade80',
  accentDim:    '#16a34a',
  accentGlow:   'rgba(34,197,94,0.15)',
  border:       'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(34,197,94,0.22)',
  textPrimary:  '#ffffff',
  textSec:      'rgba(255,255,255,0.55)',
  textMuted:    'rgba(255,255,255,0.3)',
  textLabel:    'rgba(34,197,94,0.75)',
  red:    '#f87171',
  orange: '#fb923c',
  yellow: '#fbbf24',
  blue:   '#60a5fa',
  purple: '#a78bfa',
}

const TABS = [
  { id: 'overview',     label: 'Overview',        icon: BarChart3    },
  { id: 'alerts',       label: 'Alerts',           icon: AlertTriangle},
  { id: 'misalignment', label: 'Misalignment',     icon: Activity     },
  { id: 'videos',       label: 'Videos',           icon: Video        },
  { id: 'issues',       label: 'Issues',           icon: Settings     },
  { id: 'devices',      label: 'Device Movement',  icon: Cpu          },
  { id: 'cities2',      label: 'Cities',           icon: MapIcon      },
]

// ── Custom dark tooltip for Recharts ──
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1f10', border: `1px solid ${C.borderAccent}`,
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      <p style={{ color: C.accentBright, fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'white', margin: '2px 0' }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [alertData,               setAlertData]               = useState(null)
  const [misalignmentData,        setMisalignmentData]        = useState(null)
  const [historicalVideoData,     setHistoricalVideoData]     = useState(null)
  const [generalIssuesData,       setGeneralIssuesData]       = useState(null)
  const [deviceMovementData,      setDeviceMovementData]      = useState(null)
  const [installationTrackerData, setInstallationTrackerData] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const [alertsFilter,       setAlertsFilter]       = useState('')
  const [misalignmentFilter, setMisalignmentFilter] = useState('')
  const [videosFilter,       setVideosFilter]       = useState('')
  const [videoRowsFilter,    setVideoRowsFilter]    = useState('')
  const [videoViewMode,      setVideoViewMode]      = useState(null)
  const [issuesFilter,       setIssuesFilter]       = useState('')
  const [devicesFilter,      setDevicesFilter]      = useState('')
  const [cities2Filter,      setCities2Filter]      = useState('')

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

  const formatHours = h => (!h||h===0) ? '0h' : `${parseFloat(h.toFixed(2))}h`

  const filterAlerts    = () => !alertsFilter       ? alertData.clientBreakdown       : alertData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(alertsFilter.toLowerCase()))
  const filterMisalign  = () => !misalignmentFilter ? misalignmentData.clientBreakdown : misalignmentData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(misalignmentFilter.toLowerCase()))
  const filterVideoCli  = () => !videosFilter       ? historicalVideoData.clientBreakdown : historicalVideoData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(videosFilter.toLowerCase()))
  const filterIssues    = () => !issuesFilter       ? generalIssuesData.clientBreakdown  : generalIssuesData.clientBreakdown.filter(c=>c.client.toLowerCase().includes(issuesFilter.toLowerCase()))
  const filterDevices   = () => !devicesFilter      ? deviceMovementData.deviceDetails   : deviceMovementData.deviceDetails.filter(d=>d.device.toLowerCase().includes(devicesFilter.toLowerCase())||d.status.toLowerCase().includes(devicesFilter.toLowerCase())||d.vehicleNumber.toLowerCase().includes(devicesFilter.toLowerCase()))
  const filterCities2   = () => { if(!installationTrackerData?.citiesBreakdown) return []; return !cities2Filter ? installationTrackerData.citiesBreakdown : installationTrackerData.citiesBreakdown.filter(c=>c.city.toLowerCase().includes(cities2Filter.toLowerCase())) }

  const filterVideoRows = () => {
    if (!videoViewMode) return []
    let rows = historicalVideoData?.allRows || []
    if (videoViewMode==='delivered')     rows = rows.filter(r=>r.isDelivered)
    if (videoViewMode==='not_delivered') rows = rows.filter(r=>!r.isDelivered)
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
        alerts:        alertData.monthlyData.find(d=>d.month===month)?.total  ||0,
        misalignments: misalignmentData.monthlyData.find(d=>d.month===month)?.raised||0,
        videos:        historicalVideoData.monthlyData.find(d=>d.month===month)?.requests||0,
        issues:        generalIssuesData.monthlyData.find(d=>d.month===month)?.raised||0,
      }))
  }

  /* ── LOADING ── */
  if (loading||!alertData||!misalignmentData||!historicalVideoData||!generalIssuesData||!deviceMovementData) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:C.bg, gap:24 }}>
        <img src="/cautio_shield.webp" alt="Cautio" style={{ width:96, height:96, objectFit:'contain', filter:'drop-shadow(0 0 24px rgba(34,197,94,0.4))' }} />
        <div className="loading-spinner-clean" />
        <p style={{ color:C.textSec, fontSize:15, fontWeight:500, letterSpacing:'0.08em', fontFamily:"'DM Sans', sans-serif" }}>Loading Fleet Intelligence...</p>
      </div>
    )
  }

  const combinedMonthlyData = combineMonthlyData()
  const notDelivered = (historicalVideoData.totalRequests||0)-(historicalVideoData.totalDelivered||0)

  /* ═══════════════════════════════
     SHARED MINI-COMPONENTS
  ═══════════════════════════════ */
  const SectionLabel = ({ children }) => (
    <p style={{ color:C.textLabel, fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>
      {children}
    </p>
  )

  const Card = ({ children, style={} }) => (
    <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:'22px 24px', ...style }}>
      {children}
    </div>
  )

  const CardHead = ({ title, right }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10 }}>
      <span style={{ fontSize:14, fontWeight:700, color:C.textPrimary, letterSpacing:'-0.01em' }}>{title}</span>
      {right}
    </div>
  )

  const KpiCard = ({ label, val, sub, accent, icon: Icon }) => (
    <div style={{
      background: C.card,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      borderTop: `2px solid ${accent}`,
      padding: '20px 20px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
        <Icon size={19} color={accent} />
      </div>
      <div style={{ fontSize:26, fontWeight:900, color:C.textPrimary, letterSpacing:'-0.02em', lineHeight:1 }}>{val}</div>
      <div style={{ fontSize:11, color:C.textSec }}>{sub}</div>
      <div style={{ fontSize:12, color:C.textMuted, fontWeight:600, marginTop:8, paddingTop:10, borderTop:`1px solid ${C.border}` }}>{label}</div>
    </div>
  )

  const SearchBox = ({ value, onChange, placeholder='Search…' }) => (
    <div style={{ display:'flex', alignItems:'center', gap:6, background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px' }}>
      <Filter size={13} color={C.textMuted} />
      <input
        style={{ border:'none', outline:'none', background:'transparent', fontSize:12, color:C.textPrimary, width:140 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )

  // Table styles
  const Th = ({ children, center }) => (
    <th style={{ padding:'10px 12px', textAlign:center?'center':'left', fontSize:10, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap', background:C.surface, borderBottom:`1px solid ${C.border}` }}>
      {children}
    </th>
  )
  const Td = ({ children, center, style={} }) => (
    <td style={{ padding:'10px 12px', fontSize:13, color:C.textSec, textAlign:center?'center':'left', ...style }}>
      {children}
    </td>
  )
  const Tr = ({ children, highlight }) => (
    <tr style={{ borderBottom:`1px solid ${C.border}`, background:highlight?'rgba(248,65,65,0.04)':'transparent' }}>
      {children}
    </tr>
  )

  const Pill = ({ children, bg, color }) => (
    <span style={{ display:'inline-block', padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:bg, color }}>{children}</span>
  )

  const ratePill = (rate, high=80, mid=60) => {
    if (rate>high) return <Pill bg='rgba(34,197,94,0.15)' color={C.accentBright}>{rate}%</Pill>
    if (rate>mid)  return <Pill bg='rgba(251,191,36,0.15)' color={C.yellow}>{rate}%</Pill>
    return              <Pill bg='rgba(248,113,113,0.15)' color={C.red}>{rate}%</Pill>
  }

  // Chart axis/grid defaults
  const axisStyle = { fontSize:11, fill:C.textMuted }
  const gridProps = { strokeDasharray:'3 3', stroke:'rgba(255,255,255,0.05)' }

  /* ═══════════════════════════════
     RENDER
  ═══════════════════════════════ */
  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'DM Sans', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: '0 32px',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:70, flexWrap:'wrap', gap:12 }}>

          {/* Logo + Brand — exact match to cautio-infants screenshot */}
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <img
              src="/cautio_shield.webp"
              alt="Cautio"
              style={{
                width: 52, height: 52,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(34,197,94,0.3))',
              }}
            />
            <div>
              <div style={{
                color: '#ffffff',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                fontFamily: "'DM Sans', sans-serif",
              }}>Cautio</div>
              <div style={{
                color: '#22c55e',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                marginTop: 1,
              }}>Fleet Intelligence</div>
            </div>
          </div>

          {/* Live stats */}
          <div style={{ display:'flex', gap:28, alignItems:'center' }}>
            {[
              { label:'Alerts',    val:alertData.totalCount?.toLocaleString() },
              { label:'Video Req', val:historicalVideoData.totalRequests?.toLocaleString() },
              { label:'Issues',    val:generalIssuesData.totalRaised?.toLocaleString() },
            ].map(s=>(
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:800, color:C.textPrimary }}>{s.val}</div>
                <div style={{ fontSize:10, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
              </div>
            ))}
            {/* Live indicator */}
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:20, padding:'4px 10px' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:C.accent, boxShadow:`0 0 6px ${C.accent}`, animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:10, fontWeight:700, color:C.accent, letterSpacing:'0.08em' }}>LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'0 24px', position:'sticky', top:70, zIndex:100 }}>
        <div style={{ display:'flex', gap:0, overflowX:'auto' }}>
          {TABS.map(tab => {
            const active = activeTab===tab.id
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                display:'inline-flex', alignItems:'center', gap:7,
                padding:'13px 16px', fontSize:13, fontWeight:600,
                color: active ? C.accentBright : C.textSec,
                background: 'transparent', border: 'none',
                borderBottom: active ? `2px solid ${C.accentBright}` : '2px solid transparent',
                cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
                transition:'color 0.15s, border-color 0.15s',
              }}>
                <Icon size={14} style={{ flexShrink:0 }} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ padding:'28px 24px', maxWidth:'100%', boxSizing:'border-box' }}>

        {/* ════ OVERVIEW ════ */}
        {activeTab==='overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Page title */}
            <div>
              <SectionLabel>Cautio · Command Center</SectionLabel>
              <h1 style={{ fontSize:28, fontWeight:900, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }}>
                Fleet Operations, <span style={{ color:C.accentBright, fontStyle:'italic' }}>At a Glance</span>
              </h1>
            </div>

            {/* KPI row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {[
                { label:'Total Alerts',   val:alertData.totalCount?.toLocaleString(),              sub:`${alertData.uniqueClients} clients`,                    accent:C.red,    icon:AlertTriangle },
                { label:'Misalignments',  val:misalignmentData.totalRaised?.toLocaleString(),      sub:`${misalignmentData.rectificationRate}% rectified`,      accent:C.orange, icon:Activity },
                { label:'Video Requests', val:historicalVideoData.totalRequests?.toLocaleString(), sub:`${historicalVideoData.overallDeliveryRate}% delivered`,  accent:C.purple, icon:Video },
                { label:'General Issues', val:generalIssuesData.totalRaised?.toLocaleString(),     sub:`${generalIssuesData.resolutionRate}% resolved`,         accent:C.accent, icon:Settings },
              ].map(k=><KpiCard key={k.label} {...k} />)}
            </div>

            {/* Combined chart */}
            <Card>
              <CardHead title="Monthly Trends — All Categories" />
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={combinedMonthlyData}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color:C.textSec, fontSize:12 }} />
                  <Bar yAxisId="left" dataKey="alerts" fill={C.red} name="Alerts" radius={[4,4,0,0]} />
                  <Bar yAxisId="left" dataKey="misalignments" fill={C.orange} name="Misalignments" radius={[4,4,0,0]} />
                  <Line yAxisId="right" type="monotone" dataKey="videos" stroke={C.purple} strokeWidth={2.5} dot={false} name="Videos" />
                  <Line yAxisId="right" type="monotone" dataKey="issues" stroke={C.accent} strokeWidth={2.5} dot={false} name="Issues" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Bottom 2-col */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Card>
                <CardHead title="Performance Summary" />
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { label:'Video Delivery',   sub:`Avg: ${formatHours(historicalVideoData.avgDeliveryTime)}`, val:`${historicalVideoData.overallDeliveryRate}%`,  color:C.purple },
                    { label:'Issue Resolution', sub:`Avg: ${generalIssuesData.avgResolutionTime}`,              val:`${generalIssuesData.resolutionRate}%`,          color:C.accent },
                    { label:'Misalignment Fix', sub:`Monthly avg: ${misalignmentData.avgRaisedPerMonth?.toFixed(1)}`, val:`${misalignmentData.rectificationRate}%`, color:C.orange },
                  ].map(p=>(
                    <div key={p.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:10, background:C.surface, border:`1px solid ${C.border}` }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary }}>{p.label}</div>
                        <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{p.sub}</div>
                      </div>
                      <div style={{ fontSize:24, fontWeight:900, color:p.color }}>{p.val}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHead title="Device Health" />
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:10, background:C.surface, border:`1px solid ${C.borderAccent}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Cpu size={26} color={C.accent} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary }}>Total Deployed</div>
                        <div style={{ fontSize:11, color:C.textMuted }}>Active devices</div>
                      </div>
                    </div>
                    <div style={{ fontSize:26, fontWeight:900, color:C.accent }}>{deviceMovementData.deployedCount?.toLocaleString()}</div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                    {[
                      { label:'Available', val:deviceMovementData.availableCount,    color:C.yellow },
                      { label:'In Repair', val:deviceMovementData.underRepairCount,  color:C.orange },
                      { label:'Damaged',   val:deviceMovementData.damagedCount,      color:C.red },
                    ].map(d=>(
                      <div key={d.label} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 10px', textAlign:'center' }}>
                        <div style={{ fontSize:22, fontWeight:800, color:d.color }}>{d.val}</div>
                        <div style={{ fontSize:11, color:C.textMuted, fontWeight:600, marginTop:4 }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ════ ALERTS ════ */}
        {activeTab==='alerts' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <SectionLabel>Cautio AI · Alert Tracking</SectionLabel>
              <h1 style={{ fontSize:28, fontWeight:900, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }}>
                Driver Behaviour <span style={{ color:C.accentBright, fontStyle:'italic' }}>Alerts</span>
              </h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {[
                { label:'Total Alerts',  val:alertData.totalCount?.toLocaleString(),                               sub:'All time',       accent:C.red,    icon:AlertTriangle },
                { label:'Monthly Avg',   val:alertData.avgPerMonth?.toFixed(1),                                    sub:'Per month',      accent:C.blue,   icon:TrendingUp },
                { label:'Active Clients',val:alertData.uniqueClients,                                              sub:'Unique clients', accent:C.accent, icon:Users },
                { label:'Latest Month',  val:alertData.monthlyData?.[alertData.monthlyData.length-1]?.total,       sub:alertData.monthlyData?.[alertData.monthlyData.length-1]?.month||'N/A', accent:C.purple, icon:Calendar },
              ].map(k=><KpiCard key={k.label} {...k} />)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Card>
                <CardHead title="Monthly Trends" />
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={alertData.monthlyData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ color:C.textSec, fontSize:12 }} />
                    <Bar dataKey="total" fill={C.red} name="Alerts" radius={[4,4,0,0]} />
                    <Bar dataKey="clients" fill={C.accent} name="Clients" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHead title="Client Distribution" right={<SearchBox value={alertsFilter} onChange={e=>setAlertsFilter(e.target.value)} />} />
                <div style={{ maxHeight:300, overflowY:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr><Th>Client</Th><Th center>Count</Th><Th center>Share</Th></tr></thead>
                    <tbody>
                      {filterAlerts().map((c,i)=>(
                        <Tr key={i}><Td>{c.client}</Td><Td center style={{ fontWeight:700, color:C.textPrimary }}>{c.count}</Td><Td center>{ratePill(c.percentage,30,15)}</Td></Tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ════ MISALIGNMENT ════ */}
        {activeTab==='misalignment' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <SectionLabel>Cautio · Camera Misalignment</SectionLabel>
              <h1 style={{ fontSize:28, fontWeight:900, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }}>
                Camera Misalignment <span style={{ color:C.accentBright, fontStyle:'italic' }}>Tracker</span>
              </h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
              {[
                { label:'Total Raised', val:misalignmentData.totalRaised?.toLocaleString(),      sub:'Raised',     accent:C.red,    icon:AlertTriangle },
                { label:'Total Fixed',  val:misalignmentData.totalRectified?.toLocaleString(),   sub:'Rectified',  accent:C.accent, icon:CheckCircle2 },
                { label:'Fix Rate',     val:`${misalignmentData.rectificationRate||0}%`,         sub:'Success',    accent:C.blue,   icon:TrendingUp },
                { label:'Monthly Avg',  val:misalignmentData.avgRaisedPerMonth?.toFixed(1),      sub:'Per month',  accent:C.orange, icon:Calendar },
                { label:'Clients',      val:misalignmentData.uniqueClients,                      sub:'Affected',   accent:C.purple, icon:Users },
              ].map(k=><KpiCard key={k.label} {...k} />)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Card>
                <CardHead title="Monthly Trends" />
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={misalignmentData.monthlyData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ color:C.textSec, fontSize:12 }} />
                    <Bar yAxisId="left" dataKey="raised" fill={C.red} name="Raised" radius={[4,4,0,0]} />
                    <Bar yAxisId="left" dataKey="rectified" fill={C.accent} name="Fixed" radius={[4,4,0,0]} />
                    <Line yAxisId="right" type="monotone" dataKey="clients" stroke={C.purple} strokeWidth={2.5} dot={false} name="Clients" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHead title="Client Performance" right={<SearchBox value={misalignmentFilter} onChange={e=>setMisalignmentFilter(e.target.value)} />} />
                <div style={{ maxHeight:300, overflowY:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr><Th>Client</Th><Th center>Raised</Th><Th center>Fixed</Th><Th center>Rate</Th><Th center>Share</Th></tr></thead>
                    <tbody>
                      {filterMisalign().map((c,i)=>(
                        <Tr key={i}>
                          <Td style={{ fontSize:11 }}>{c.client}</Td>
                          <Td center>{c.raised}</Td>
                          <Td center>{c.rectified}</Td>
                          <Td center>{ratePill(c.rectificationRate)}</Td>
                          <Td center style={{ color:C.textMuted }}>{c.percentage}%</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ════ VIDEOS ════ */}
        {activeTab==='videos' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <SectionLabel>Cautio · Video on Request</SectionLabel>
              <h1 style={{ fontSize:28, fontWeight:900, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }}>
                Video Delivery <span style={{ color:C.accentBright, fontStyle:'italic' }}>Performance</span>
              </h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
              {[
                { label:'Requests',  val:historicalVideoData.totalRequests?.toLocaleString(),   sub:'Total',     accent:C.purple, icon:Video },
                { label:'Delivered', val:historicalVideoData.totalDelivered?.toLocaleString(),  sub:`${historicalVideoData.overallDeliveryRate}%`, accent:C.accent, icon:CheckCircle2 },
                { label:'Avg Time',  val:formatHours(historicalVideoData.avgDeliveryTime),      sub:'Delivery',  accent:C.blue,   icon:Clock },
                { label:'Fastest',   val:formatHours(historicalVideoData.fastestDeliveryTime),  sub:'Best',      accent:C.accentBright, icon:TrendingUp },
                { label:'Slowest',   val:formatHours(historicalVideoData.slowestDeliveryTime),  sub:'Worst',     accent:C.red,    icon:XCircle },
              ].map(k=><KpiCard key={k.label} {...k} />)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Card>
                <CardHead title="Monthly Trends" />
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={historicalVideoData.monthlyData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ color:C.textSec, fontSize:12 }} />
                    <Bar yAxisId="left" dataKey="requests" fill={C.purple} name="Requests" radius={[4,4,0,0]} />
                    <Bar yAxisId="left" dataKey="delivered" fill={C.accent} name="Delivered" radius={[4,4,0,0]} />
                    <Line yAxisId="right" type="monotone" dataKey="avgDeliveryTime" stroke={C.yellow} strokeWidth={2.5} dot={false} name="Avg(h)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHead title="Client Performance" right={<SearchBox value={videosFilter} onChange={e=>setVideosFilter(e.target.value)} />} />
                <div style={{ maxHeight:300, overflowY:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr><Th>Client</Th><Th center>Req</Th><Th center>Del</Th><Th center>Rate</Th><Th center>Avg(h)</Th></tr></thead>
                    <tbody>
                      {filterVideoCli().map((c,i)=>(
                        <Tr key={i}>
                          <Td style={{ fontSize:11 }}>{c.client}</Td>
                          <Td center>{c.requests}</Td>
                          <Td center>{c.delivered}</Td>
                          <Td center>{ratePill(c.deliveryRate)}</Td>
                          <Td center style={{ color:C.textMuted }}>{c.avgDeliveryTime}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Video rows toggle table */}
            <Card>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:14 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary }}>All Video Requests</div>
                  <div style={{ fontSize:12, color:C.textMuted, marginTop:3 }}>
                    <span style={{ color:C.accentBright, fontWeight:700 }}>{historicalVideoData.totalDelivered} delivered</span>
                    <span style={{ color:C.border, margin:'0 8px' }}>·</span>
                    <span style={{ color:C.red, fontWeight:700 }}>{notDelivered} pending</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {[
                    { id:'all',           label:'All',           count:historicalVideoData.totalRequests,  emoji:'📋', color:C.blue   },
                    { id:'delivered',     label:'Delivered',     count:historicalVideoData.totalDelivered, emoji:'✅', color:C.accent },
                    { id:'not_delivered', label:'Not Delivered', count:notDelivered,                       emoji:'⏳', color:C.red    },
                  ].map(btn=>{
                    const active = videoViewMode===btn.id
                    return (
                      <button key={btn.id} onClick={()=>setVideoViewMode(btn.id)} style={{
                        display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
                        borderRadius:10, fontSize:13, fontWeight:700, border:'none', cursor:'pointer',
                        background: active ? btn.color : C.surface,
                        color: active ? '#fff' : C.textSec,
                        boxShadow: active ? `0 4px 14px ${btn.color}44` : 'none',
                        transition:'all 0.18s',
                      }}>
                        <span style={{ fontSize:16 }}>{btn.emoji}</span>
                        <span style={{ fontWeight:700 }}>{btn.label}</span>
                        <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'1px 7px', fontSize:11 }}>{btn.count}</span>
                      </button>
                    )
                  })}
                </div>
                <SearchBox value={videoRowsFilter} onChange={e=>setVideoRowsFilter(e.target.value)} placeholder="Search client, vehicle…" />
              </div>

              {/* Progress bar */}
              {videoViewMode && (
                <div style={{ display:'flex', height:3, borderRadius:3, overflow:'hidden', marginBottom:16, background:C.surface }}>
                  <div style={{ flex:historicalVideoData.totalDelivered, background:C.accent }} />
                  <div style={{ flex:notDelivered, background:C.red }} />
                </div>
              )}

              {!videoViewMode ? (
                <div style={{ textAlign:'center', padding:'48px 0', color:C.textMuted }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>☝️</div>
                  <div style={{ fontSize:15, fontWeight:700, color:C.textSec, marginBottom:6 }}>Select a filter to view records</div>
                  <div style={{ fontSize:13 }}>Click All, Delivered, or Pending above</div>
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <div style={{ maxHeight:480, overflowY:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', minWidth:1000 }}>
                      <thead><tr>
                        <Th>#</Th><Th>Status</Th><Th>Client</Th><Th>Timestamp Raised</Th>
                        <Th>Issue Details</Th><Th>Vehicle</Th><Th>Raised By</Th><Th>Current Status</Th>
                      </tr></thead>
                      <tbody>
                        {filterVideoRows().map((row,i)=>(
                          <Tr key={i} highlight={!row.isDelivered}>
                            <Td style={{ color:C.textMuted, fontSize:11 }}>{i+1}</Td>
                            <Td>
                              {row.isDelivered
                                ? <Pill bg='rgba(34,197,94,0.15)' color={C.accentBright}>✓ Delivered</Pill>
                                : <Pill bg='rgba(248,113,113,0.15)' color={C.red}>⏳ Pending</Pill>}
                            </Td>
                            <Td style={{ fontWeight:600, fontSize:12 }}>{row.client}</Td>
                            <Td style={{ fontSize:11, whiteSpace:'nowrap' }}>{row.timestampRaised}</Td>
                            <Td style={{ fontSize:11, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={row.issueDetails}>{row.issueDetails}</Td>
                            <Td style={{ fontSize:11, fontFamily:'monospace' }}>{row.vehicleNumber}</Td>
                            <Td style={{ fontSize:11 }}>{row.raisedBy}</Td>
                            <Td style={{ fontSize:11, whiteSpace:'nowrap' }}>{row.currentStatus}</Td>
                          </Tr>
                        ))}
                      </tbody>
                    </table>
                    {filterVideoRows().length===0 && (
                      <div style={{ textAlign:'center', padding:'40px 0', color:C.textMuted }}>No records found</div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ════ ISSUES ════ */}
        {activeTab==='issues' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <SectionLabel>Cautio · Client Support</SectionLabel>
              <h1 style={{ fontSize:28, fontWeight:900, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }}>
                Issue Resolution <span style={{ color:C.accentBright, fontStyle:'italic' }}>Tracker</span>
              </h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
              {[
                { label:'Raised',   val:generalIssuesData.totalRaised?.toLocaleString(),  sub:'Total',      accent:C.red,    icon:AlertTriangle },
                { label:'Resolved', val:generalIssuesData.totalResolved?.toLocaleString(),sub:'Fixed',      accent:C.accent, icon:CheckCircle2 },
                { label:'Rate',     val:`${generalIssuesData.resolutionRate}%`,            sub:'Success',    accent:C.blue,   icon:Target },
                { label:'Avg Time', val:generalIssuesData.avgResolutionTime||'0h',         sub:'Resolution', accent:C.purple, icon:Clock },
                { label:'Median',   val:generalIssuesData.medianResolutionTime||'0h',      sub:'Typical',    accent:C.orange, icon:TrendingUp },
              ].map(k=><KpiCard key={k.label} {...k} />)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Card>
                <CardHead title="Monthly Overview" />
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={generalIssuesData.monthlyData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ color:C.textSec, fontSize:12 }} />
                    <Bar yAxisId="left" dataKey="raised" fill={C.red} name="Raised" radius={[4,4,0,0]} />
                    <Bar yAxisId="left" dataKey="resolved" fill={C.accent} name="Resolved" radius={[4,4,0,0]} />
                    <Line yAxisId="right" type="monotone" dataKey="avgTimeHours" stroke={C.purple} strokeWidth={2.5} dot={false} name="Avg(h)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHead title="Client Performance" right={<SearchBox value={issuesFilter} onChange={e=>setIssuesFilter(e.target.value)} />} />
                <div style={{ maxHeight:300, overflowY:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr><Th>Client</Th><Th center>Raised</Th><Th center>Resolved</Th><Th center>Rate</Th><Th center>Time</Th></tr></thead>
                    <tbody>
                      {filterIssues().map((c,i)=>(
                        <Tr key={i}>
                          <Td style={{ fontSize:11 }}>{c.client}</Td>
                          <Td center>{c.raised}</Td>
                          <Td center>{c.resolved}</Td>
                          <Td center>{ratePill(c.resolutionRate)}</Td>
                          <Td center style={{ fontSize:11 }}>{c.avgTime}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
            <Card>
              <CardHead title="Monthly Analysis" />
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr>
                    <Th>Month</Th><Th center>Raised</Th><Th center>Same Month</Th>
                    <Th center>Later</Th><Th center>Carry Fwd</Th><Th center>Pending</Th>
                    <Th center>Rate%</Th><Th center>Avg Time</Th>
                  </tr></thead>
                  <tbody>
                    {generalIssuesData.monthlyData?.map((m,i)=>(
                      <Tr key={i}>
                        <Td style={{ fontWeight:600 }}>
                          {m.month}
                          {m.isCurrentMonth && <Pill bg='rgba(34,197,94,0.15)' color={C.accentBright}> NOW</Pill>}
                        </Td>
                        <Td center><Pill bg='rgba(248,113,113,0.15)' color={C.red}>{m.raised}</Pill></Td>
                        <Td center><Pill bg='rgba(34,197,94,0.15)' color={C.accentBright}>{m.resolvedSameMonth}</Pill></Td>
                        <Td center>{m.resolvedLaterMonths>0?<Pill bg='rgba(167,139,250,0.15)' color={C.purple}>{m.resolvedLaterMonths}</Pill>:'-'}</Td>
                        <Td center>{m.carryForwardIn>0?<Pill bg='rgba(96,165,250,0.15)' color={C.blue}>{m.carryForwardIn}</Pill>:'-'}</Td>
                        <Td center>{m.stillPending>0?<Pill bg='rgba(251,146,60,0.15)' color={C.orange}>{m.stillPending}</Pill>:'-'}</Td>
                        <Td center>{m.resolutionRate!==null ? ratePill(m.resolutionRate) : <span style={{ color:C.textMuted, fontSize:11 }}>TBD</span>}</Td>
                        <Td center>{m.avgTime!=='0h'?<Pill bg='rgba(167,139,250,0.15)' color={C.purple}>{m.avgTime}</Pill>:'-'}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ════ DEVICES ════ */}
        {activeTab==='devices' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <SectionLabel>Cautio · Dashcam Fleet</SectionLabel>
              <h1 style={{ fontSize:28, fontWeight:900, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }}>
                Device <span style={{ color:C.accentBright, fontStyle:'italic' }}>Movement</span>
              </h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
              {[
                { label:'Total',    val:deviceMovementData.totalDevices?.toLocaleString(),     sub:'All devices', accent:C.blue,   icon:Cpu },
                { label:'Deployed', val:deviceMovementData.deployedCount?.toLocaleString(),    sub:`${deviceMovementData.deployedPercentage}%`,    accent:C.accent, icon:CheckCircle2 },
                { label:'Available',val:deviceMovementData.availableCount?.toLocaleString(),   sub:`${deviceMovementData.availablePercentage}%`,   accent:C.yellow, icon:Zap },
                { label:'Repair',   val:deviceMovementData.underRepairCount?.toLocaleString(), sub:`${deviceMovementData.underRepairPercentage}%`, accent:C.orange, icon:Settings },
                { label:'Damaged',  val:deviceMovementData.damagedCount?.toLocaleString(),     sub:`${deviceMovementData.damagedPercentage}%`,     accent:C.red,    icon:XCircle },
              ].map(k=><KpiCard key={k.label} {...k} />)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Card>
                <CardHead title="Status Distribution" />
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={[
                      {name:'Deployed', value:deviceMovementData.deployedCount},
                      {name:'Available',value:deviceMovementData.availableCount},
                      {name:'Repair',   value:deviceMovementData.underRepairCount},
                      {name:'Damaged',  value:deviceMovementData.damagedCount},
                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {[C.accent, C.yellow, C.orange, C.red].map((c,i)=><Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ color:C.textSec, fontSize:12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHead title="Monthly Deployments" />
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={deviceMovementData.monthlyData}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ color:C.textSec, fontSize:12 }} />
                    <Bar dataKey="deployed" fill={C.accent} name="Deployed" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <Card>
              <CardHead title="Device Registry" right={<SearchBox value={devicesFilter} onChange={e=>setDevicesFilter(e.target.value)} placeholder="Search device, status…" />} />
              <div style={{ maxHeight:380, overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr><Th>#</Th><Th>Device ID</Th><Th center>Status</Th><Th>Vehicle</Th><Th>Install Date</Th><Th>Return Comment</Th></tr></thead>
                  <tbody>
                    {filterDevices().map((d,i)=>(
                      <Tr key={i}>
                        <Td style={{ color:C.textMuted }}>{i+1}</Td>
                        <Td style={{ fontSize:11, fontFamily:'monospace', color:C.accentBright }}>{d.device}</Td>
                        <Td center>
                          <Pill
                            bg={d.status==='Deployed'?'rgba(34,197,94,0.15)':d.status==='Under Repair'?'rgba(251,146,60,0.15)':d.status==='Device Damaged'?'rgba(248,113,113,0.15)':'rgba(251,191,36,0.15)'}
                            color={d.status==='Deployed'?C.accentBright:d.status==='Under Repair'?C.orange:d.status==='Device Damaged'?C.red:C.yellow}
                          >{d.status}</Pill>
                        </Td>
                        <Td style={{ fontSize:11 }}>{d.vehicleNumber}</Td>
                        <Td style={{ fontSize:11 }}>{d.installationDate}</Td>
                        <Td style={{ fontSize:11, color:C.textMuted, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={d.returnComment}>{d.returnComment}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ════ CITIES ════ */}
        {activeTab==='cities2' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <SectionLabel>Cautio · Pan India Network</SectionLabel>
              <h1 style={{ fontSize:28, fontWeight:900, color:C.textPrimary, margin:0, letterSpacing:'-0.02em' }}>
                India Device <span style={{ color:C.accentBright, fontStyle:'italic' }}>Network</span>
              </h1>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {[
                { label:'Total Installations', val:installationTrackerData?.totalInstallations?.toLocaleString()||'0', sub:'Devices installed',  accent:C.blue,   icon:Cpu },
                { label:'Cities Covered',       val:installationTrackerData?.uniqueCities||'0',                        sub:'Locations covered', accent:C.accent, icon:MapIcon },
                { label:'Top City',             val:(installationTrackerData?.citiesBreakdown?.[0]?.city||'N/A').toUpperCase(), sub:`${installationTrackerData?.citiesBreakdown?.[0]?.count||0} devices`, accent:C.purple, icon:TrendingUp },
              ].map(k=><KpiCard key={k.label} {...k} />)}
            </div>
            <Card style={{ height:620, padding:0, overflow:'hidden' }}>
              <div style={{ padding:'18px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                <span style={{ fontSize:14, fontWeight:700, color:C.textPrimary }}>India Device Map</span>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, color:C.textMuted }}>
                    <b style={{ color:C.textPrimary }}>{installationTrackerData?.totalInstallations||0}</b> devices · <b style={{ color:C.textPrimary }}>{installationTrackerData?.uniqueCities||0}</b> cities
                  </span>
                  <SearchBox value={cities2Filter} onChange={e=>setCities2Filter(e.target.value)} placeholder="Search city…" />
                </div>
              </div>
              <div style={{ height:'calc(100% - 65px)' }}>
                <IndiaMapLeaflet2 installationTrackerData={installationTrackerData} />
              </div>
            </Card>
            <Card>
              <CardHead title="Cities Table" />
              <div style={{ maxHeight:380, overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr><Th>#</Th><Th>City</Th><Th center>Devices</Th><Th center>Share</Th></tr></thead>
                  <tbody>
                    {filterCities2().map((c,i)=>(
                      <Tr key={i}>
                        <Td style={{ color:C.textMuted }}>{i+1}</Td>
                        <Td style={{ fontWeight:600, textTransform:'capitalize', color:C.textPrimary }}>{c.city}</Td>
                        <Td center>
                          <Pill
                            bg={c.count>10?'rgba(34,197,94,0.15)':c.count>5?'rgba(251,191,36,0.15)':'rgba(96,165,250,0.15)'}
                            color={c.count>10?C.accentBright:c.count>5?C.yellow:C.blue}
                          >{c.count}</Pill>
                        </Td>
                        <Td center style={{ color:C.textMuted }}>{c.percentage}%</Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  )
}
