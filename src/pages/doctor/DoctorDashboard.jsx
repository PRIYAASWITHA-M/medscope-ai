import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ── Data ────────────────────────────────────────────────────────
const appointments = [
  { id: 'MED1001', name: 'Sindhu A',  time: '10:30 AM', aiStatus: 'Available' },
  { id: 'MED1002', name: 'Priya S',   time: '11:00 AM', aiStatus: 'Available' },
  { id: 'MED1003', name: 'Arun K',    time: '11:30 AM', aiStatus: 'Available' },
  { id: 'MED1004', name: 'Ramesh V',  time: '12:00 PM', aiStatus: 'Processing' },
  { id: 'MED1005', name: 'Kavitha R', time: '02:00 PM', aiStatus: 'Pending' },
]

const followUps = [
  { patient: 'Sindhu A',  date: '25 Sep 2026', reason: 'Review lab results',   status: 'Due Soon' },
  { patient: 'Priya S',   date: '27 Sep 2026', reason: 'Medication follow-up', status: 'Due Soon' },
  { patient: 'Arun K',    date: '30 Sep 2026', reason: 'Treatment review',     status: 'Upcoming' },
]

const stats = [
  { icon: '📅', label: "Today's Appointments", value: '8',  color: 'text-blue-600'  },
  { icon: '👥', label: 'Patients to Review',    value: '5',  color: 'text-teal-600'  },
  { icon: '🔔', label: 'Pending Follow-ups',    value: '3',  color: 'text-amber-600' },
]

const aiStatusStyle = {
  Available:  'bg-teal-50 text-teal-700 border border-teal-200',
  Processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  Pending:    'bg-amber-50 text-amber-700 border border-amber-200',
}

const followStatusStyle = {
  'Due Soon': 'bg-red-50 text-red-700 border border-red-200',
  Upcoming:   'bg-slate-100 text-slate-600 border border-slate-200',
}

// ── Nav links ────────────────────────────────────────────────────
const navLinks = [
  { label: 'Dashboard',    to: '/doctor' },
  { label: 'Patients',     to: '/doctor/patients' },
  { label: 'Appointments', to: '/doctor/appointments' },
  { label: 'Follow-ups',   to: '/doctor/followups' },
]

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 tracking-wide leading-none">MEDSCOPE AI</h1>
          <p className="text-xs text-slate-400 mt-0.5">Medical Record Intelligence System</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">👨‍⚕️</div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-none">Dr. Kumar</p>
            <p className="text-xs text-slate-400 mt-0.5">General Medicine</p>
          </div>
        </div>
      </header>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 px-8">
        <div className="flex items-center gap-1 h-12">
          {navLinks.map(l => (
            <button
              key={l.label}
              onClick={() => setActiveNav(l.label)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                activeNav === l.label
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              {l.label}
            </button>
          ))}
          <Link
            to="/patient"
            className="ml-auto px-4 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            Logout
          </Link>
        </div>
      </nav>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-slate-800">Good Morning, Doctor 👋</h2>
          <p className="text-slate-500 text-sm mt-1">Here is your patient overview for today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">
                {s.icon}
              </div>
              <div>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-base">Today's Appointments</h3>
            <span className="text-xs text-slate-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Patient Name', 'Patient ID', 'Time', 'AI Summary', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                          {a.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{a.id}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{a.time}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${aiStatusStyle[a.aiStatus]}`}>
                        {a.aiStatus === 'Available' ? '✓ ' : ''}{a.aiStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => navigate('/ai-results')}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                      >
                        View Patient
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Follow-ups */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-base">Upcoming Follow-ups</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {followUps.map(f => (
              <div key={f.patient} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-600">
                    {f.patient.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{f.patient}</p>
                    <p className="text-xs text-slate-400">{f.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <p className="text-sm font-medium text-slate-600">{f.date}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${followStatusStyle[f.status]}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links to patient side */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap gap-3 text-sm">
          <span className="text-blue-600 font-medium">Quick Links:</span>
          <Link to="/upload"   className="text-blue-500 hover:underline">Upload Document</Link>
          <span className="text-slate-300">·</span>
          <Link to="/ai-results" className="text-blue-500 hover:underline">AI Results</Link>
          <span className="text-slate-300">·</span>
          <Link to="/timeline" className="text-blue-500 hover:underline">Patient Timeline</Link>
          <span className="text-slate-300">·</span>
          <Link to="/patient"  className="text-blue-500 hover:underline">Patient Portal</Link>
        </div>

      </main>
    </div>
  )
}
