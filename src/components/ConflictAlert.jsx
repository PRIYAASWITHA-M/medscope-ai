/**
 * ConflictAlert — Drug interaction warning panel
 * Shows cross-document conflicts with severity, reason, and recommendation.
 */

import { useState } from 'react'
import { detectConflicts, SEVERITY_STYLE } from '../utils/conflictDetector.js'
import { usePatient } from '../context/PatientContext.jsx'

export default function ConflictAlert({ patientId, compact = false }) {
  const { getPatientDocs } = usePatient()
  const docs      = getPatientDocs(patientId)
  const conflicts = detectConflicts(docs)
  const [expanded, setExpanded] = useState({})

  if (conflicts.length === 0) {
    if (compact) return null
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-950/40 border border-teal-500/20">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-teal-300 font-semibold text-sm">No Drug Conflicts Detected</p>
          <p className="text-slate-500 text-xs mt-0.5">All medicines across {docs.length} document(s) appear safe to use together.</p>
        </div>
      </div>
    )
  }

  const highCount   = conflicts.filter(c => c.severity === 'HIGH').length
  const medCount    = conflicts.filter(c => c.severity === 'MEDIUM').length
  const crossDocCount = conflicts.filter(c => c.crossDocument).length

  return (
    <div className="rounded-2xl overflow-hidden border border-red-500/30">

      {/* Header */}
      <div className="bg-red-950/70 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl animate-pulse">
            ⛔
          </div>
          <div>
            <p className="text-red-300 font-bold text-sm">
              Drug Conflict Detection — {conflicts.length} Interaction{conflicts.length > 1 ? 's' : ''} Found
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {highCount > 0 && <span className="text-red-400 font-medium">{highCount} High Risk</span>}
              {highCount > 0 && medCount > 0 && <span className="text-slate-600"> · </span>}
              {medCount > 0 && <span className="text-amber-400 font-medium">{medCount} Moderate</span>}
              {crossDocCount > 0 && <span className="text-slate-400"> · {crossDocCount} cross-document</span>}
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
          AI DETECTED
        </span>
      </div>

      {/* Conflict list */}
      <div className="divide-y divide-slate-800/60">
        {conflicts.map((c, i) => {
          const s  = SEVERITY_STYLE[c.severity]
          const ex = expanded[i]
          return (
            <div key={c.key} className={`${s.bg} border-0`}>
              {/* Summary row */}
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))}
                className="w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-white/5 transition"
              >
                <span className="text-lg shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${s.text}`}>{c.drugA.name}</span>
                    <span className="text-slate-500 text-xs">+</span>
                    <span className={`text-sm font-bold ${s.text}`}>{c.drugB.name}</span>
                    {c.crossDocument && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Cross-Document
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{c.reason}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${s.badge}`}>
                    {s.label}
                  </span>
                  <span className="text-slate-500 text-xs">{ex ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded detail */}
              {ex && (
                <div className="px-5 pb-4 space-y-3">

                  {/* Source docs */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-teal-400 font-semibold">Doc 1:</span>
                      <span className="text-slate-300">{c.drugA.name}</span>
                      <span className="text-slate-500">—</span>
                      <span className="text-slate-400">📄 {c.drugA.source}</span>
                      <span className="text-slate-600">({c.drugA.date})</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <span className="text-teal-400 font-semibold">Doc 2:</span>
                      <span className="text-slate-300">{c.drugB.name}</span>
                      <span className="text-slate-500">—</span>
                      <span className="text-slate-400">📄 {c.drugB.source}</span>
                      <span className="text-slate-600">({c.drugB.date})</span>
                    </div>
                  </div>

                  {/* Why dangerous */}
                  <div className={`p-3 rounded-xl border ${s.bg} ${s.border}`}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Why it's dangerous</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{c.reason}</p>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20">
                    <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide mb-1">✅ Recommendation</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{c.recommendation}</p>
                  </div>

                  <p className="text-xs text-slate-600 italic">
                    ⚠️ This is an AI-assisted alert. Always consult your doctor before changing medications.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
