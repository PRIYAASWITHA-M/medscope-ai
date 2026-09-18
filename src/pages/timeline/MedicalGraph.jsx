import { Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext.jsx'

const typeColor = {
  Event:     { border: 'border-orange-400', text: 'text-orange-300', bg: 'bg-orange-500/10', line: '#f97316' },
  Diagnosis: { border: 'border-purple-400', text: 'text-purple-300', bg: 'bg-purple-500/10', line: '#a855f7' },
  Medicine:  { border: 'border-teal-400',   text: 'text-teal-300',   bg: 'bg-teal-500/10',   line: '#14b8a6' },
}

const typeIcon = { Event: '🩺', Diagnosis: '🏥', Medicine: '💊' }

function GraphNode({ item, index }) {
  const c = typeColor[item.type] || typeColor.Event
  return (
    <div className="flex flex-col items-center">
      <div className={`w-28 h-28 rounded-full ${c.bg} border-2 ${c.border} flex flex-col items-center justify-center text-center shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-default p-2`}>
        <span className="text-xl mb-1">{typeIcon[item.type]}</span>
        <span className="text-xs font-semibold text-white leading-tight line-clamp-2">{item.title.replace('Prescribed: ', '').replace('Diagnosis: ', '').slice(0, 28)}</span>
        <span className={`text-xs mt-0.5 ${c.text}`}>{item.date.slice(0, 8)}</span>
      </div>
    </div>
  )
}

function Arrow({ color = '#14b8a6' }) {
  return (
    <div className="flex items-center px-1">
      <div className="h-0.5 w-10 sm:w-16" style={{ background: color }} />
      <div className="w-0 h-0 border-t-4 border-b-4 border-t-transparent border-b-transparent border-l-8" style={{ borderLeftColor: color }} />
    </div>
  )
}

export default function MedicalGraph() {
  const { currentPatient, getTimeline } = usePatient()
  const timeline = getTimeline(currentPatient.id)

  // Group timeline items into rows of 4 for display
  const rows = []
  for (let i = 0; i < timeline.length; i += 4) {
    rows.push(timeline.slice(i, i + 4))
  }

  const docSources = [...new Set(timeline.map(t => t.source))]

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="bg-teal-600 py-5 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Medical Relationship Graph</h1>
            <p className="text-teal-100 text-sm mt-0.5">{currentPatient.name} · Auto-generated from uploaded documents</p>
          </div>
          <Link to="/upload" className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition">
            + Upload Doc
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {[
            { label: 'Events',    count: timeline.filter(t => t.type === 'Event').length,     icon: '🩺', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
            { label: 'Diagnoses', count: timeline.filter(t => t.type === 'Diagnosis').length, icon: '🏥', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
            { label: 'Medicines', count: timeline.filter(t => t.type === 'Medicine').length,  icon: '💊', color: 'border-teal-500/40 bg-teal-500/10 text-teal-300'       },
            { label: 'Documents', count: docSources.length,                                   icon: '📄', color: 'border-slate-500/40 bg-slate-500/10 text-slate-300'    },
          ].map(s => (
            <div key={s.label} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${s.color} flex items-center gap-2`}>
              <span>{s.icon}</span>{s.count} {s.label}
            </div>
          ))}
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">📊</p>
            <p className="text-slate-400 text-lg font-medium">Graph is empty</p>
            <p className="text-slate-500 text-sm mt-2 mb-6">Upload documents to auto-generate the medical relationship graph</p>
            <Link to="/upload" className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition">
              Upload Document →
            </Link>
          </div>
        ) : (
          <>
            {/* Graph rows */}
            <div className="space-y-8">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx}>
                  <div className="flex items-center justify-center flex-wrap">
                    {row.map((item, i) => (
                      <div key={i} className="flex items-center">
                        <GraphNode item={item} index={rowIdx * 4 + i} />
                        {i < row.length - 1 && (
                          <Arrow color={typeColor[row[i + 1]?.type]?.line || '#14b8a6'} />
                        )}
                      </div>
                    ))}
                    {/* Connector to next row */}
                    {rowIdx < rows.length - 1 && (
                      <div className="w-full flex justify-end pr-14 mt-1">
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-0.5 bg-teal-500/50" />
                          <div className="text-teal-500 text-xs">↓</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Source documents */}
            <div className="mt-10">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">📎 Source Documents</p>
              <div className="flex flex-wrap gap-2">
                {docSources.map(src => (
                  <span key={src} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400">
                    📄 {src}
                  </span>
                ))}
              </div>
            </div>

            {/* AI insight */}
            <div className="mt-6 p-4 bg-teal-900/30 border border-teal-500/20 rounded-xl text-sm text-slate-300 leading-relaxed">
              <strong className="text-teal-300">🤖 AI Insight: </strong>
              {timeline.filter(t => t.type === 'Diagnosis').length > 0
                ? `${currentPatient.name}'s medical history shows ${timeline.filter(t => t.type === 'Diagnosis').length} diagnosis record(s) with ${timeline.filter(t => t.type === 'Medicine').length} prescription event(s). Graph auto-updates with each new document upload.`
                : `${currentPatient.name} has ${timeline.length} medical event(s) recorded. No diagnosis detected yet. Upload more documents to build a richer medical graph.`
              }
            </div>
          </>
        )}

        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/timeline" className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition text-center">
            ← Timeline View
          </Link>
          <Link to="/patient/dashboard" className="px-8 py-3 rounded-xl border border-slate-600 hover:border-teal-500 text-slate-300 hover:text-teal-400 font-semibold text-sm transition text-center">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
