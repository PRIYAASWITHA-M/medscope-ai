import { Link } from 'react-router-dom'
import PatientNav from '../../components/PatientNav.jsx'

const stats = [
  { icon: '📅', label: 'Upcoming Appointments', value: '2' },
  { icon: '📄', label: 'Uploaded Documents', value: '5' },
  { icon: '🩺', label: 'Medical Events', value: '4' },
]

const recentDocs = [
  { name: 'Blood_Test_Report.pdf', date: '15 Aug 2026', status: 'Processed' },
  { name: 'Prescription_Aug.pdf',  date: '10 Aug 2026', status: 'Processed' },
  { name: 'Discharge_Summary.pdf', date: '01 Mar 2026', status: 'Processed' },
]

const upcomingAppts = [
  { doctor: 'Dr. Kumar',  specialty: 'General',    date: '25 Sep 2026', time: '10:30 AM' },
  { doctor: 'Dr. Priya',  specialty: 'Cardiology', date: '30 Sep 2026', time: '11:00 AM' },
]

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PatientNav />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, Arun 👋</h2>
          <p className="text-slate-500 mt-1">Here's your health overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-teal-600">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">Recent Documents</h3>
              <Link to="/upload" className="text-sm text-teal-600 hover:underline font-medium">
                + Upload New
              </Link>
            </div>
            <div className="space-y-3">
              {recentDocs.map(d => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.date}</p>
                    </div>
                  </div>
                  <Link
                    to="/ai-results"
                    className="text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 font-medium hover:bg-teal-100 transition"
                  >
                    View Results
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">Upcoming Appointments</h3>
              <Link to="/patient/appointments" className="text-sm text-teal-600 hover:underline font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingAppts.map(a => (
                <div key={a.doctor} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-700">{a.doctor}</p>
                      <p className="text-xs text-slate-400">{a.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-teal-600">{a.date}</p>
                      <p className="text-xs text-slate-400">{a.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '⬆️', label: 'Upload Document', to: '/upload' },
            { icon: '🔍', label: 'AI Results',       to: '/ai-results' },
            { icon: '📊', label: 'Timeline',          to: '/timeline' },
            { icon: '📅', label: 'Appointments',      to: '/patient/appointments' },
          ].map(q => (
            <Link
              key={q.label}
              to={q.to}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition shadow-sm text-center"
            >
              <span className="text-2xl">{q.icon}</span>
              <span className="text-xs font-medium text-slate-600">{q.label}</span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  )
}
