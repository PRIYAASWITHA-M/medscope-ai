import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/patient/dashboard',    label: 'Dashboard' },
  { to: '/patient/insights',     label: '🧠 AI Insights' },
  { to: '/patient/appointments', label: 'Appointments' },
  { to: '/patient/documents',    label: 'Documents' },
  { to: '/upload',               label: 'Upload Report' },
  { to: '/timeline',             label: 'Timeline' },
]

export default function PatientNav() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white border-b border-slate-200 px-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
        <span className="text-teal-600 font-bold text-lg tracking-wide">MedScope AI</span>
        <div className="flex gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === l.to
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/patient"
            className="ml-3 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  )
}
