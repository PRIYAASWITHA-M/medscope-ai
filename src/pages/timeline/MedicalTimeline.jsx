import { Link, useNavigate } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext.jsx'

const typeStyle = {
  Event:     { dot: 'bg-orange-400',  card: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',  badge: 'bg-orange-500/20 text-orange-300' },
  Diagnosis: { dot: 'bg-purple-400',  card: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',  badge: 'bg-purple-500/20 text-purple-300' },
  Medicine:  { dot: 'bg-teal-400',    card: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',        badge: 'bg-teal-500/20 text-teal-300'   },
}

export default function MedicalTimeline() {
  const navigate = useNavigate()
  const { currentPatient, getTimeline } = usePatient()

  const timeline = getTimeline(currentPatient.id)

  function openDetails(ev) {
    navigate('/timeline/event', { state: { event: ev } })
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="bg-teal-600 py-5 px-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">MEDSCOPE AI — Medical Timeline</h1>
            <p className="text-teal-100 text-sm mt-0.5">{currentPatient.name} · {currentPatient.id}</p>
          </div>
          <Link to="/upload" className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition">
            + Upload Doc
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* AI Summary */}
        <div className="mb-7 p-4 bg-slate-800/60 border border-teal-500/20 rounded-2xl">
          <p className="text-teal-400 font-semibold text-xs uppercase tracking-wide mb-2">🤖 AI Summary</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            {timeline.length === 0
              ? 'No documents uploaded yet. Upload a medical report to build the timeline.'
              : `Patient has ${timeline.length} medical event${timeline.length > 1 ? 's' : ''} across ${getTimeline(currentPatient.id).filter(t => t.type === 'Diagnosis').length} diagnosis record${timeline.filter(t => t.type === 'Diagnosis').length !== 1 ? 's' : ''}. Timeline auto-built from ${[...new Set(timeline.map(t => t.source))].length} uploaded document${[...new Set(timeline.map(t => t.source))].length !== 1 ? 's' : ''}.`
            }
          </p>
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">📄</p>
            <p className="text-slate-400 text-lg font-medium">No documents uploaded yet</p>
            <p className="text-slate-500 text-sm mt-2 mb-6">Upload a PDF report to automatically build this patient's timeline</p>
            <Link to="/upload" className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition">
              Upload First Document →
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical spine */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-teal-500/25" />

            <div className="space-y-4">
              {timeline.map((ev, i) => {
                const style = typeStyle[ev.type] || typeStyle.Event
                return (
                  <div key={i} className="relative ml-14 cursor-pointer" onClick={() => openDetails(ev)}>
                    {/* Dot */}
                    <div className={`absolute -left-9 top-5 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] ${style.dot}`} />
                    {/* Card */}
                    <div className={`bg-gradient-to-r ${style.card} border rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{ev.icon}</span>
                          <div>
                            <h3 className="font-semibold text-white text-sm leading-snug">{ev.title}</h3>
                            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{ev.source}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-teal-400 font-medium text-xs">{ev.date}</p>
                          <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${style.badge}`}>{ev.type}</span>
                        </div>
                      </div>
                      {ev.clinical && (
                        <p className="mt-2 text-slate-400 text-xs leading-relaxed line-clamp-2">{ev.clinical}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/timeline/graph" className="flex-1 text-center py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition">
            📊 View Medical Graph
          </Link>
          <Link to="/patient/dashboard" className="flex-1 text-center py-3 rounded-xl border border-slate-600 hover:border-teal-500 text-slate-300 hover:text-teal-400 font-semibold text-sm transition">
            ← Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
