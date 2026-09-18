import { Link } from 'react-router-dom'

const nodes = [
  { id: 1, label: 'Fever\nVisit',   icon: '🤒', date: 'Jan 2026', color: 'border-orange-400 text-orange-300' },
  { id: 2, label: 'Blood\nTest',    icon: '🩸', date: 'Jan 2026', color: 'border-red-400 text-red-300' },
  { id: 3, label: 'Diabetes\nDx',   icon: '🏥', date: 'Mar 2026', color: 'border-purple-400 text-purple-300' },
  { id: 4, label: 'Kidney\nCheckup',icon: '🫘', date: 'Aug 2026', color: 'border-teal-400 text-teal-300' },
]

function Node({ node }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-28 h-28 rounded-full bg-[#1e293b] border-2 ${node.color} flex flex-col items-center justify-center text-center shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-default`}>
        <span className="text-2xl mb-1">{node.icon}</span>
        <span className="text-xs font-semibold text-white whitespace-pre-line leading-tight">
          {node.label}
        </span>
        <span className="text-xs text-slate-500 mt-1">{node.date}</span>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="flex items-center justify-center px-1">
      {/* Horizontal line with arrow */}
      <div className="flex items-center gap-0">
        <div className="h-0.5 w-12 sm:w-20 bg-gradient-to-r from-teal-500 to-teal-400" />
        <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-teal-400" />
      </div>
    </div>
  )
}

export default function MedicalGraph() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* Header */}
      <header className="bg-teal-600 py-5 px-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">Medical Relationship Graph</h1>
        <p className="text-teal-100 text-sm mt-1">Visual progression of medical events</p>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {nodes.map(n => (
            <span key={n.id} className={`text-xs px-3 py-1 rounded-full border ${n.color} bg-slate-800/50`}>
              {n.icon} {n.label.replace('\n', ' ')}
            </span>
          ))}
        </div>

        {/* Graph — horizontal chain */}
        <div className="flex items-center justify-center flex-wrap gap-y-8">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <Node node={node} />
              {i < nodes.length - 1 && <Connector />}
            </div>
          ))}
        </div>

        {/* Relationship explanation */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { from: 'Fever Visit', to: 'Blood Test',    note: 'Blood test ordered following fever consultation.' },
            { from: 'Blood Test',  to: 'Diabetes Dx',   note: 'Elevated blood sugar led to diabetes diagnosis.' },
            { from: 'Diabetes Dx', to: 'Kidney Checkup',note: 'Kidney monitoring recommended for diabetic patients.' },
          ].map(r => (
            <div key={r.from} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-sm">
              <p className="text-teal-400 font-semibold mb-1">{r.from} → {r.to}</p>
              <p className="text-slate-400 leading-relaxed">{r.note}</p>
            </div>
          ))}
        </div>

        {/* AI insight */}
        <div className="mt-6 p-4 bg-teal-900/30 border border-teal-500/20 rounded-xl text-sm text-slate-300 leading-relaxed">
          <strong className="text-teal-300">🤖 AI Insight: </strong>
          The patient's medical journey shows a clear progression from an initial fever consultation
          to a diabetes diagnosis, with proactive follow-up care through kidney monitoring.
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/timeline"
            className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition text-center"
          >
            ← Back to Timeline
          </Link>
          <Link
            to="/patient/dashboard"
            className="px-8 py-3 rounded-xl border border-slate-600 hover:border-teal-500 text-slate-300 hover:text-teal-400 font-semibold text-sm transition text-center"
          >
            Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
