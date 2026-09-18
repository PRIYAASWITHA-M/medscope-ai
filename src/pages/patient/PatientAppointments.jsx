import { useState } from 'react'
import PatientNav from '../../components/PatientNav.jsx'

const appointments = [
  { id: 1, doctor: 'Dr. Kumar',   specialty: 'General Medicine', date: '25 Sep 2026', time: '10:30 AM', status: 'Confirmed' },
  { id: 2, doctor: 'Dr. Priya',   specialty: 'Cardiology',       date: '30 Sep 2026', time: '11:00 AM', status: 'Confirmed' },
  { id: 3, doctor: 'Dr. Sindhu',  specialty: 'Neurology',        date: '05 Oct 2026', time: '09:00 AM', status: 'Pending' },
  { id: 4, doctor: 'Dr. Ramesh',  specialty: 'Orthopedics',      date: '10 Oct 2026', time: '02:00 PM', status: 'Pending' },
]

const statusStyle = {
  Confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export default function PatientAppointments() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ doctor: '', date: '', time: '', reason: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleBook(e) {
    e.preventDefault()
    setShowModal(false)
    setForm({ doctor: '', date: '', time: '', reason: '' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PatientNav />

      <main className="max-w-4xl mx-auto px-6 py-8">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Appointments</h2>
            <p className="text-slate-500 text-sm mt-1">View and manage your scheduled appointments.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition"
          >
            + Book Appointment
          </button>
        </div>

        {/* Appointment Cards */}
        <div className="space-y-4">
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center text-xl">
                  👨‍⚕️
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{a.doctor}</p>
                  <p className="text-sm text-slate-500">{a.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Date</p>
                  <p className="text-sm font-medium text-slate-700">{a.date}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Time</p>
                  <p className="text-sm font-medium text-slate-700">{a.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusStyle[a.status]}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Book Appointment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-slate-800">Book Appointment</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                {[
                  { label: 'Doctor Name', name: 'doctor', type: 'text',  placeholder: 'Dr. Kumar' },
                  { label: 'Date',        name: 'date',   type: 'date',  placeholder: '' },
                  { label: 'Time',        name: 'time',   type: 'time',  placeholder: '' },
                  { label: 'Reason',      name: 'reason', type: 'text',  placeholder: 'General checkup' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-400/40 transition"
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition"
                  >
                    Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
