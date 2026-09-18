import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PatientNav               from '../../components/PatientNav.jsx'
import ConflictAlert            from '../../components/ConflictAlert.jsx'
import HealthScoreCard          from '../../components/HealthScoreCard.jsx'
import AppointmentSuggestions   from '../../components/AppointmentSuggestions.jsx'
import Skeleton                 from '../../components/Skeleton.jsx'
import { usePatient }           from '../../context/PatientContext.jsx'
import { detectConflicts }      from '../../utils/conflictDetector.js'

// ── Greeting by time ─────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ── Health score from docs ────────────────────────────────────────
function getHealthScore(docs) {
  if (docs.length === 0) return null
  // Count high test values as deductions
  let score = 100
  docs.forEach(d => {
    (d.result?.tests || []).forEach(t => {
      if (t.result?.includes('High') || t.result?.includes('↑')) score -= 8
    })
  })
  return Math.max(score, 30)
}

function HealthScoreRing({ score }) {
  if (score === null) return null
  const color = score >= 80 ? '#14b8a6' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Attention'
  const r = 36, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  )
}

export default function PatientDashboard() {
  const { currentPatient, patients, setCurrentPatient,
          getPatientDocs, getTimeline, getAppointments } = usePatient()

  const docs          = getPatientDocs(currentPatient.id)
  const timeline      = getTimeline(currentPatient.id)
  const appointments  = getAppointments(currentPatient.id)
  const recentDocs    = [...docs].reverse().slice(0, 3)
  const upcomingAppts = appointments.slice(0, 3)
  const healthScore   = getHealthScore(docs)

  // Animate counter
  const [counts, setCounts] = useState({ appts: 0, docs: 0, events: 0 })
  const [loading, setLoading] = useState(true)

  // Simulate initial load (replace with real API fetch if needed)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [currentPatient.id])
  useEffect(() => {
    const targets = { appts: appointments.length, docs: docs.length, events: timeline.length }
    let frame
    let cur = { appts: 0, docs: 0, events: 0 }
    const step = () => {
      let done = true
      const next = { ...cur }
      Object.keys(targets).forEach(k => {
        if (cur[k] < targets[k]) { next[k] = Math.min(cur[k] + 1, targets[k]); done = false }
      })
      cur = next
      setCounts({ ...cur })
      if (!done) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [appointments.length, docs.length, timeline.length])

  // Latest diagnosis tags
  const diagnoses = docs.flatMap(d => d.result?.diagnosis || [])
    .filter(d => d && d !== 'See uploaded document').slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0d1b2a]">
      <PatientNav />
      {loading ? <Skeleton.Dashboard /> : (

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Hero Banner ───────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl mb-6 p-6 sm:p-8"
          style={{ background: 'linear-gradient(135deg, #0d4f4a 0%, #0a3d5c 50%, #1a1a4e 100%)' }}>

          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full translate-y-1/2" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Left — greeting */}
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-3xl shadow-lg shadow-teal-900/40 shrink-0">
                {currentPatient.gender === 'Female' ? '👩' : '👨'}
              </div>
              <div>
                <p className="text-teal-300 text-sm font-medium">{getGreeting()},</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{currentPatient.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300">{currentPatient.id}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300">{currentPatient.age} yrs</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300">{currentPatient.gender}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">🩸 {currentPatient.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Right — health score + patient switcher */}
            <div className="flex items-center gap-6">
              <HealthScoreRing score={healthScore} />
              <div>
                <p className="text-xs text-slate-400 mb-1.5 font-medium">Switch Patient</p>
                <select
                  value={currentPatient.id}
                  onChange={e => setCurrentPatient(patients.find(p => p.id === e.target.value))}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-teal-400 transition min-w-36"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-800 text-white">{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Diagnosis tags */}
          {diagnoses.length > 0 && (
            <div className="relative mt-5 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 self-center">Active Conditions:</span>
              {diagnoses.map((d, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium">
                  ⚕ {d}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Animated Stat Cards ───────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { key: 'appts',  label: 'Appointments',  icon: '📅', val: counts.appts,  color: 'from-blue-600/20 to-blue-800/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   glow: 'shadow-blue-500/10'  },
            { key: 'docs',   label: 'Documents',      icon: '📄', val: counts.docs,   color: 'from-teal-600/20 to-teal-800/10',   border: 'border-teal-500/30',   text: 'text-teal-400',   glow: 'shadow-teal-500/10'  },
            { key: 'events', label: 'Health Events',  icon: '🩺', val: counts.events, color: 'from-purple-600/20 to-purple-800/10',border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/10'},
          ].map(s => (
            <div key={s.key}
              className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-4 sm:p-5 shadow-lg ${s.glow} text-center`}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className={`text-3xl font-black ${s.text}`}>{s.val}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Recent Documents */}
          <div className="lg:col-span-2 bg-[#111c2d] border border-slate-700/50 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span className="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center text-sm">📄</span>
                Recent Documents
              </h3>
              <Link to="/upload" className="text-xs px-3 py-1.5 rounded-lg bg-teal-600/20 border border-teal-500/30 text-teal-400 hover:bg-teal-600/30 transition font-medium">
                + Upload
              </Link>
            </div>
            {recentDocs.length === 0 ? (
              <Link to="/upload" className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-slate-700 hover:border-teal-500/50 transition group">
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">📤</span>
                <p className="text-slate-400 text-sm font-medium">Upload your first document</p>
                <p className="text-slate-600 text-xs mt-1">Drag & drop PDF reports here</p>
              </Link>
            ) : (
              <div className="space-y-2.5">
                {recentDocs.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-teal-500/30 transition group">
                    <div className="w-10 h-10 rounded-xl bg-teal-900/50 border border-teal-500/20 flex items-center justify-center text-lg shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{d.filename}</p>
                      <p className="text-xs text-slate-500">{d.uploaded_at}</p>
                    </div>
                    <Link to="/ai-results"
                      className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-teal-600/20 border border-teal-500/30 text-teal-400 hover:bg-teal-600/40 transition font-medium opacity-0 group-hover:opacity-100">
                      AI →
                    </Link>
                    <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-teal-900/50 text-teal-400 border border-teal-500/20 group-hover:hidden">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions vertical */}
          <div className="bg-[#111c2d] border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center text-sm">⚡</span>
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: '⬆️', label: 'Upload Report',   sub: 'Add medical PDF',        to: '/upload',                color: 'hover:border-teal-500/50 hover:bg-teal-900/20'   },
                { icon: '🤖', label: 'AI Results',       sub: 'View AI analysis',       to: '/ai-results',            color: 'hover:border-purple-500/50 hover:bg-purple-900/20'},
                { icon: '📊', label: 'Health Timeline',  sub: 'Medical history',        to: '/timeline',              color: 'hover:border-blue-500/50 hover:bg-blue-900/20'   },
                { icon: '📅', label: 'Book Appointment', sub: 'Schedule a visit',       to: '/patient/appointments',  color: 'hover:border-orange-500/50 hover:bg-orange-900/20'},
                { icon: '📈', label: 'Medical Graph',    sub: 'Relationship view',      to: '/timeline/graph',        color: 'hover:border-pink-500/50 hover:bg-pink-900/20'   },
              ].map(q => (
                <Link key={q.to} to={q.to}
                  className={`flex items-center gap-3 p-3 rounded-xl border border-slate-700/50 transition ${q.color}`}>
                  <span className="text-xl">{q.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{q.label}</p>
                    <p className="text-xs text-slate-500">{q.sub}</p>
                  </div>
                  <span className="ml-auto text-slate-600 text-sm">›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Insights Strip ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Drug conflict banner */}
          {(() => {
            const conflicts = detectConflicts(docs)
            return conflicts.length > 0 ? (
              <Link to="/patient/insights"
                className="lg:col-span-2 flex items-center gap-3 p-4 rounded-2xl bg-red-950/50 border border-red-500/40 hover:border-red-400/60 transition group">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl shrink-0 animate-pulse">⛔</div>
                <div className="flex-1 min-w-0">
                  <p className="text-red-300 font-bold text-sm">
                    {conflicts.length} Drug Conflict{conflicts.length > 1 ? 's' : ''} Detected
                  </p>
                  <p className="text-red-500/70 text-xs mt-0.5 truncate">
                    {conflicts[0].drugA.name} + {conflicts[0].drugB.name} — {conflicts[0].severity} RISK
                  </p>
                </div>
                <span className="text-red-400 group-hover:translate-x-1 transition-transform text-sm shrink-0">View →</span>
              </Link>
            ) : (
              <Link to="/patient/insights"
                className="flex items-center gap-3 p-4 rounded-2xl bg-teal-950/30 border border-teal-500/20 hover:border-teal-500/40 transition group">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-teal-300 font-semibold text-sm">No Drug Conflicts</p>
                  <p className="text-slate-500 text-xs">All medicines safe</p>
                </div>
                <span className="ml-auto text-teal-500 group-hover:translate-x-1 transition-transform text-sm">→</span>
              </Link>
            )
          })()}

          {/* Health score mini */}
          <Link to="/patient/insights"
            className="flex items-center gap-3 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/40 transition group">
            <span className="text-2xl">💊</span>
            <div>
              <p className="text-purple-300 font-bold text-sm">AI Insights</p>
              <p className="text-slate-500 text-xs">Score · Conflicts · Follow-ups</p>
            </div>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold shrink-0">
              NEW
            </span>
          </Link>
        </div>

        {/* ── Appointments ──────────────────────────────────────── */}
        <div className="bg-[#111c2d] border border-slate-700/50 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-sm">📅</span>
              Upcoming Appointments
            </h3>
            <Link to="/patient/appointments"
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition font-medium">
              + Book New
            </Link>
          </div>

          {upcomingAppts.length === 0 ? (
            <Link to="/patient/appointments"
              className="flex items-center gap-4 py-5 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/50 transition group">
              <span className="text-4xl group-hover:scale-110 transition-transform">📅</span>
              <div>
                <p className="text-slate-300 text-sm font-medium">No appointments scheduled</p>
                <p className="text-slate-500 text-xs mt-0.5">Book a consultation with your doctor →</p>
              </div>
            </Link>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {upcomingAppts.map(a => (
                <div key={a.id}
                  className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-blue-500/30 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-base">👨‍⚕️</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{a.doctor}</p>
                      <p className="text-xs text-slate-500">{a.specialty || 'General'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 italic">"{a.reason}"</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-blue-400">{a.date}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-900/50 text-teal-400 border border-teal-500/20">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    )}
    </div>
  )
}
