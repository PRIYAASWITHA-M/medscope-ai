import { useLocation, useNavigate, Link } from 'react-router-dom'

// Default details used when no state is passed (direct URL access)
const DEFAULT_EVENT = {
  title:   'Diabetes Diagnosis',
  date:    '01 Mar 2026',
  doctor:  'Dr. Kumar',
  type:    'Diagnosis',
  icon:    '🏥',
  symptoms:    'Fatigue, Increased Thirst',
  tests:       'Blood Sugar Test',
  result:      'Diabetes Confirmed',
  prescription:'Metformin 500mg — twice daily',
  notes:       'Follow-up in 3 months. Monitor blood sugar levels regularly.',
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-3 border-b border-slate-700/50 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:w-36 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-slate-200 text-sm">{value}</span>
    </div>
  )
}

export default function EventDetails() {
  const { state }  = useLocation()
  const navigate   = useNavigate()

  const ev = state?.event || DEFAULT_EVENT

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* Header */}
      <header className="bg-teal-600 py-5 px-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">Medical Event Details</h1>
      </header>

      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Event Card */}
        <div className="bg-[#1e293b] border border-teal-500/20 rounded-2xl overflow-hidden shadow-2xl">

          {/* Top banner */}
          <div className="bg-gradient-to-r from-teal-800/60 to-slate-800 px-6 py-5 flex items-center gap-4">
            <span className="text-4xl">{ev.icon || '🏥'}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{ev.title}</h2>
              <p className="text-teal-300 text-sm mt-0.5">{ev.type || 'Medical Event'}</p>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-4">
            <DetailRow label="Date"         value={ev.date} />
            <DetailRow label="Doctor"       value={ev.doctor} />
            {ev.symptoms    && <DetailRow label="Symptoms"     value={ev.symptoms} />}
            {ev.tests       && <DetailRow label="Tests"        value={ev.tests} />}
            {ev.result      && <DetailRow label="Result"       value={ev.result} />}
            {ev.prescription&& <DetailRow label="Prescription" value={ev.prescription} />}
            {ev.notes       && <DetailRow label="Notes"        value={ev.notes} />}
          </div>

        </div>

        {/* Source traceability */}
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-400">
          🔗 <span className="font-medium text-slate-300">Source:</span> Information extracted from uploaded medical documents.
          Always verify with original records.
        </div>

        {/* Navigation */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition"
          >
            ← Back to Timeline
          </button>
          <Link
            to="/upload"
            className="flex-1 text-center py-3 rounded-xl border border-slate-600 hover:border-teal-500 text-slate-300 hover:text-teal-400 font-semibold text-sm transition"
          >
            Upload Document
          </Link>
        </div>

      </div>
    </div>
  )
}
