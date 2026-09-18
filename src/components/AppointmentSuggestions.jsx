/**
 * AppointmentSuggestions — AI Follow-up Intelligence
 *
 * Reads follow_up fields from all uploaded documents,
 * extracts suggested appointments, and lets user book with one click.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatient } from '../context/PatientContext.jsx'
import { extractAppointmentSuggestions, PRIORITY_STYLE } from '../utils/appointmentSuggester.js'

export default function AppointmentSuggestions({ patientId, compact = false }) {
  const { getPatientDocs, bookAppointment, currentPatient } = usePatient()
  const navigate   = useNavigate()
  const docs       = getPatientDocs(patientId)
  const suggestions = extractAppointmentSuggestions(docs)

  const [booked,   setBooked]   = useState({})   // id → true when booked
  const [expanded, setExpanded] = useState(null)

  if (suggestions.length === 0) {
    if (compact) return null
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
        <span className="text-2xl">📅</span>
        <div>
          <p className="text-slate-300 font-semibold text-sm">No Follow-up Reminders</p>
          <p className="text-slate-500 text-xs mt-0.5">
            AI scans uploaded documents for follow-up instructions automatically.
          </p>
        </div>
      </div>
    )
  }

  function handleBook(s) {
    bookAppointment({
      patient_id: patientId,
      doctor:     s.doctor,
      specialty:  s.doctor,
      date:       s.suggestedDate,
      time:       '10:00 AM',
      reason:     s.reason.slice(0, 120),
    })
    setBooked(prev => ({ ...prev, [s.id]: true }))
  }

  function handleBookAndGo(s) {
    handleBook(s)
    setTimeout(() => navigate('/patient/appointments'), 400)
  }

  return (
    <div className="bg-[#111c2d] border border-slate-700/50 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center text-sm">🤖</span>
          <div>
            <h3 className="font-bold text-white text-sm">AI Appointment Intelligence</h3>
            <p className="text-slate-500 text-xs">{suggestions.length} follow-up{suggestions.length > 1 ? 's' : ''} detected from your documents</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
          AUTO-DETECTED
        </span>
      </div>

      {/* Suggestion cards */}
      <div className="divide-y divide-slate-800/60">
        {suggestions.map((s, i) => {
          const p       = PRIORITY_STYLE[s.priority]
          const isOpen  = expanded === i
          const isDone  = booked[s.id]

          return (
            <div key={s.id} className={`transition-all ${isDone ? 'opacity-50' : ''}`}>

              {/* Summary row */}
              <div className="px-5 py-4">
                <div className="flex items-start gap-3">

                  {/* Priority dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${p.dot}`} />

                  <div className="flex-1 min-w-0">
                    {/* Doctor + date */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-slate-200">{s.doctor}</span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-teal-400 text-sm font-semibold">{s.suggestedDate}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${p.badge}`}>
                        {p.label} · {s.durationLabel}
                      </span>
                      {isDone && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          ✓ Booked
                        </span>
                      )}
                    </div>

                    {/* Reason */}
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{s.reason}</p>

                    {/* Source */}
                    <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                      <span>📄</span>
                      <span>Source: {s.source} ({s.sourceDate})</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {!isDone ? (
                      <>
                        <button
                          onClick={() => handleBookAndGo(s)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition whitespace-nowrap"
                        >
                          ✓ Book Now
                        </button>
                        <button
                          onClick={() => setExpanded(isOpen ? null : i)}
                          className="px-3 py-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                        >
                          {isOpen ? 'Hide' : 'Details'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate('/patient/appointments')}
                        className="px-3 py-1.5 rounded-xl bg-slate-700/60 text-teal-400 text-xs font-medium transition hover:bg-slate-700"
                      >
                        View →
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mt-3 ml-5 space-y-2">

                    {/* Original follow-up text */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">
                        📋 Original Follow-up Note
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{s.rawFollowUp}"
                      </p>
                    </div>

                    {/* AI interpretation */}
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20">
                      <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-1">
                        🤖 AI Interpretation
                      </p>
                      <div className="text-xs text-slate-300 space-y-1">
                        <p>📅 Suggested date: <strong className="text-teal-300">{s.suggestedDate}</strong></p>
                        <p>👨‍⚕️ Recommended: <strong className="text-teal-300">{s.doctor}</strong></p>
                        <p>⏱ Duration from note: <strong className="text-teal-300">{s.durationLabel}</strong></p>
                        <p>📊 Priority: <strong className={
                          s.priority === 'urgent' ? 'text-red-400' :
                          s.priority === 'soon'   ? 'text-amber-400' : 'text-teal-400'
                        }>{s.priority.charAt(0).toUpperCase() + s.priority.slice(1)}</strong></p>
                      </div>
                    </div>

                    {/* Quick book with custom time */}
                    <div className="flex gap-2">
                      {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                        <button
                          key={time}
                          onClick={() => {
                            bookAppointment({
                              patient_id: patientId,
                              doctor:     s.doctor,
                              specialty:  s.doctor,
                              date:       s.suggestedDate,
                              time,
                              reason:     s.reason.slice(0, 120),
                            })
                            setBooked(prev => ({ ...prev, [s.id]: true }))
                            setExpanded(null)
                          }}
                          className="flex-1 py-2 rounded-xl bg-teal-700/40 hover:bg-teal-700/60 border border-teal-500/30 text-teal-300 text-xs font-semibold transition"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs">Select a time slot to book instantly</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30">
        <p className="text-xs text-slate-600">
          🤖 AI automatically detects follow-up instructions from uploaded documents.
          Suggested dates are calculated from discharge notes and prescriptions.
        </p>
      </div>
    </div>
  )
}
