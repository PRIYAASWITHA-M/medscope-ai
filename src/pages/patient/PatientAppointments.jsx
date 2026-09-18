import { useState } from 'react'
import PatientNav from '../../components/PatientNav.jsx'
import { usePatient } from '../../context/PatientContext.jsx'
import VoiceToText from '../../components/VoiceToText.jsx'

const DOCTORS = [
  { name: 'Dr. Kumar',   specialty: 'General Medicine' },
  { name: 'Dr. Priya',   specialty: 'Cardiology'       },
  { name: 'Dr. Sindhu',  specialty: 'Neurology'        },
  { name: 'Dr. Ramesh',  specialty: 'Orthopedics'      },
  { name: 'Dr. Kavitha', specialty: 'Endocrinology'    },
]

const statusStyle = {
  Confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
}

const EMPTY_FORM = { doctor: '', specialty: '', date: '', time: '', reason: '' }

export default function PatientAppointments() {
  const { currentPatient, bookAppointment, cancelAppointment, getAppointments } = usePatient()
  const appointments = getAppointments(currentPatient.id)

  const [showModal,   setShowModal]   = useState(false)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [confirmed,   setConfirmed]   = useState(null)
  const [errors,      setErrors]      = useState({})
  const [cancelId,    setCancelId]    = useState(null)   // appt pending cancel confirm
  const [filter,      setFilter]      = useState('all')  // all | upcoming | cancelled

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'doctor') {
      const doc = DOCTORS.find(d => d.name === value)
      setForm(prev => ({ ...prev, doctor: value, specialty: doc?.specialty || '' }))
    }
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.doctor) errs.doctor = 'Select a doctor'
    if (!form.date)   errs.date   = 'Select a date'
    if (!form.time)   errs.time   = 'Select a time'
    if (!form.reason) errs.reason = 'Enter reason for visit'
    return errs
  }

  async function handleBook(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      const booked = await bookAppointment({
        patient_id: currentPatient.id,
        doctor: form.doctor, specialty: form.specialty,
        date: form.date, time: form.time, reason: form.reason,
      })
      setConfirmed(booked)
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  function confirmCancel() {
    if (cancelId !== null) {
      cancelAppointment(cancelId)
      setCancelId(null)
    }
  }

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming')  return a.status !== 'Cancelled'
    if (filter === 'cancelled') return a.status === 'Cancelled'
    return true
  })

  const upcomingCount  = appointments.filter(a => a.status !== 'Cancelled').length
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length

  return (
    <div className="min-h-screen bg-slate-50">
      <PatientNav />

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Appointments</h2>
            <p className="text-slate-500 text-sm mt-1">{currentPatient.name} · {currentPatient.id}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition">
            + Book Appointment
          </button>
        </div>

        {/* Booking confirmed banner */}
        {confirmed && (
          <div className="mb-5 p-4 bg-teal-50 border border-teal-300 rounded-xl flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-teal-800">Appointment Confirmed!</p>
              <p className="text-teal-700 text-sm mt-0.5">
                {confirmed.doctor} · {confirmed.date} at {confirmed.time} — {confirmed.reason}
              </p>
            </div>
            <button onClick={() => setConfirmed(null)} className="ml-auto text-teal-400 hover:text-teal-600 text-xl">×</button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'all',       label: `All (${appointments.length})`          },
            { key: 'upcoming',  label: `Upcoming (${upcomingCount})`            },
            { key: 'cancelled', label: `Cancelled (${cancelledCount})`, red: true },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                filter === tab.key
                  ? tab.red ? 'bg-red-100 text-red-700 border-red-300' : 'bg-teal-100 text-teal-700 border-teal-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Appointments list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-slate-500 font-medium">
              {filter === 'cancelled' ? 'No cancelled appointments' : 'No appointments yet'}
            </p>
            {filter !== 'cancelled' && (
              <button onClick={() => setShowModal(true)}
                className="mt-4 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition">
                Book Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <div key={a.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition ${
                  a.status === 'Cancelled' ? 'opacity-60 border-red-100' : 'border-slate-200 hover:border-teal-200'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Doctor info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl ${
                      a.status === 'Cancelled' ? 'bg-red-50' : 'bg-teal-100'
                    }`}>
                      {a.status === 'Cancelled' ? '❌' : '👨‍⚕️'}
                    </div>
                    <div>
                      <p className={`font-semibold ${a.status === 'Cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {a.doctor}
                      </p>
                      <p className="text-sm text-slate-400">{a.specialty || 'General'}</p>
                      <p className="text-xs text-slate-400 mt-0.5 italic">{a.reason}</p>
                    </div>
                  </div>

                  {/* Date / time / status / cancel */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Date</p>
                      <p className="text-sm font-semibold text-slate-700">{a.date}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Time</p>
                      <p className="text-sm font-semibold text-slate-700">{a.time}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusStyle[a.status] || statusStyle.Pending}`}>
                      {a.status}
                    </span>

                    {/* Cancel button — only for non-cancelled */}
                    {a.status !== 'Cancelled' && (
                      <button
                        onClick={() => setCancelId(a.id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 hover:border-red-400 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available doctors */}
        <div className="mt-8">
          <h3 className="font-semibold text-slate-700 text-sm mb-3 uppercase tracking-wide">Available Doctors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DOCTORS.map(d => (
              <div key={d.name}
                onClick={() => { setForm(f => ({ ...f, doctor: d.name, specialty: d.specialty })); setShowModal(true) }}
                className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition shadow-sm">
                <p className="text-2xl mb-1">👨‍⚕️</p>
                <p className="font-semibold text-slate-800 text-sm">{d.name}</p>
                <p className="text-xs text-slate-400">{d.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Cancel Confirm Dialog ── */}
      {cancelId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">
              ❌
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Cancel Appointment?</h3>
            <p className="text-slate-500 text-sm mb-6">
              This appointment will be marked as cancelled. You can book a new one anytime.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Keep It
              </button>
              <button onClick={confirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Book Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">Book Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm">
              <p className="text-teal-700 font-medium">{currentPatient.name}</p>
              <p className="text-teal-500 text-xs">{currentPatient.id} · {currentPatient.age} yrs · {currentPatient.gender}</p>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Doctor *</label>
                <select name="doctor" value={form.doctor} onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-teal-500 transition ${errors.doctor ? 'border-red-400' : 'border-slate-300'}`}>
                  <option value="">Select a doctor</option>
                  {DOCTORS.map(d => (
                    <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>
                  ))}
                </select>
                {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Date *</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-teal-500 transition ${errors.date ? 'border-red-400' : 'border-slate-300'}`} />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Time *</label>
                  <select name="time" value={form.time} onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-teal-500 transition ${errors.time ? 'border-red-400' : 'border-slate-300'}`}>
                    <option value="">Select</option>
                    {['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                      '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Reason for Visit *</label>
                <textarea name="reason" value={form.reason} onChange={handleChange} rows={2}
                  placeholder="e.g. Diabetes follow-up, Fever, General checkup..."
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:border-teal-500 transition ${errors.reason ? 'border-red-400' : 'border-slate-300'}`} />
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                <div className="mt-2">
                  <p className="text-xs text-slate-400 mb-1.5">🎤 Or speak your reason:</p>
                  <VoiceToText darkMode={false} placeholder="Speak reason for visit..."
                    onTranscript={(text) => setForm(f => ({ ...f, reason: text.trim() }))} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition">
                  ✓ Confirm Booking
                </button>
              </div>
              {errors.submit && <p className="text-red-500 text-xs text-center">{errors.submit}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const LEGACY_DOCTORS = [
  { name: 'Dr. Kumar',   specialty: 'General Medicine' },
  { name: 'Dr. Priya',   specialty: 'Cardiology'       },
  { name: 'Dr. Sindhu',  specialty: 'Neurology'        },
  { name: 'Dr. Ramesh',  specialty: 'Orthopedics'      },
  { name: 'Dr. Kavitha', specialty: 'Endocrinology'    },
]

const legacyStatusStyle = {
  Confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const legacyEmptyForm = { doctor: '', specialty: '', date: '', time: '', reason: '' }

function LegacyPatientAppointments() {
  const { currentPatient, bookAppointment, getAppointments } = usePatient()
  const appointments = getAppointments(currentPatient.id)

  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [confirmed, setConfirmed]   = useState(null)  // last booked appt
  const [errors, setErrors]         = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'doctor') {
      const doc = DOCTORS.find(d => d.name === value)
      setForm(prev => ({ ...prev, doctor: value, specialty: doc?.specialty || '' }))
    }
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.doctor) errs.doctor = 'Select a doctor'
    if (!form.date)   errs.date   = 'Select a date'
    if (!form.time)   errs.time   = 'Select a time'
    if (!form.reason) errs.reason = 'Enter reason for visit'
    return errs
  }

  function handleBook(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const booked = bookAppointment({
      patient_id: currentPatient.id,
      doctor:     form.doctor,
      specialty:  form.specialty,
      date:       form.date,
      time:       form.time,
      reason:     form.reason,
    })
    setConfirmed(booked)
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PatientNav />

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Appointments</h2>
            <p className="text-slate-500 text-sm mt-1">{currentPatient.name} · {currentPatient.id}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition"
          >
            + Book Appointment
          </button>
        </div>

        {/* Booking confirmation banner */}
        {confirmed && (
          <div className="mb-5 p-4 bg-teal-50 border border-teal-300 rounded-xl flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-teal-800">Appointment Confirmed!</p>
              <p className="text-teal-700 text-sm mt-0.5">
                {confirmed.doctor} · {confirmed.date} at {confirmed.time} — {confirmed.reason}
              </p>
            </div>
            <button onClick={() => setConfirmed(null)} className="ml-auto text-teal-400 hover:text-teal-600 text-xl leading-none">×</button>
          </div>
        )}

        {/* Appointments list */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-slate-500 font-medium">No appointments yet</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">Book your first appointment below</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center text-xl">👨‍⚕️</div>
                  <div>
                    <p className="font-semibold text-slate-800">{a.doctor}</p>
                    <p className="text-sm text-slate-400">{a.specialty || 'General'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 italic">{a.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Date</p>
                    <p className="text-sm font-semibold text-slate-700">{a.date}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Time</p>
                    <p className="text-sm font-semibold text-slate-700">{a.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusStyle[a.status] || statusStyle.Pending}`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available doctors */}
        <div className="mt-8">
          <h3 className="font-semibold text-slate-700 text-sm mb-3 uppercase tracking-wide">Available Doctors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DOCTORS.map(d => (
              <div
                key={d.name}
                onClick={() => { setForm(f => ({ ...f, doctor: d.name, specialty: d.specialty })); setShowModal(true) }}
                className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition shadow-sm"
              >
                <p className="text-2xl mb-1">👨‍⚕️</p>
                <p className="font-semibold text-slate-800 text-sm">{d.name}</p>
                <p className="text-xs text-slate-400">{d.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Booking Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">Book Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            {/* Patient info */}
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm">
              <p className="text-teal-700 font-medium">{currentPatient.name}</p>
              <p className="text-teal-500 text-xs">{currentPatient.id} · {currentPatient.age} yrs · {currentPatient.gender}</p>
            </div>

            <form onSubmit={handleBook} className="space-y-4">

              {/* Doctor select */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Doctor *</label>
                <select
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-teal-500 transition ${errors.doctor ? 'border-red-400' : 'border-slate-300'}`}
                >
                  <option value="">Select a doctor</option>
                  {DOCTORS.map(d => (
                    <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>
                  ))}
                </select>
                {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-teal-500 transition ${errors.date ? 'border-red-400' : 'border-slate-300'}`}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Time *</label>
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-teal-500 transition ${errors.time ? 'border-red-400' : 'border-slate-300'}`}
                  >
                    <option value="">Select</option>
                    {['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                      '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Reason for Visit *</label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Diabetes follow-up, Fever, General checkup..."
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:border-teal-500 transition ${errors.reason ? 'border-red-400' : 'border-slate-300'}`}
                />
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}

                {/* Voice input for reason */}
                <div className="mt-2">
                  <p className="text-xs text-slate-400 mb-1.5">🎤 Or speak your reason:</p>
                  <VoiceToText
                    darkMode={false}
                    placeholder="Speak reason for visit..."
                    onTranscript={(text) => setForm(f => ({ ...f, reason: text.trim() }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition">
                  ✓ Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
