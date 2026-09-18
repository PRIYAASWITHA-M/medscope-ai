/**
 * HealthInsights — dedicated page showing all 3 unique features:
 *  1. Drug Conflict Detection
 *  2. Smart Health Score
 *  3. AI Appointment Suggestions
 */

import PatientNav                from '../../components/PatientNav.jsx'
import ConflictAlert             from '../../components/ConflictAlert.jsx'
import HealthScoreCard           from '../../components/HealthScoreCard.jsx'
import AppointmentSuggestions    from '../../components/AppointmentSuggestions.jsx'
import { usePatient }            from '../../context/PatientContext.jsx'
import { detectConflicts }       from '../../utils/conflictDetector.js'
import { extractAppointmentSuggestions } from '../../utils/appointmentSuggester.js'
import { computeHealthScore }    from '../../utils/healthScore.js'
import { Link }                  from 'react-router-dom'

export default function HealthInsights() {
  const { currentPatient, patients, setCurrentPatient, getPatientDocs } = usePatient()
  const docs        = getPatientDocs(currentPatient.id)
  const conflicts   = detectConflicts(docs)
  const suggestions = extractAppointmentSuggestions(docs)
  const scoreData   = computeHealthScore(docs)

  return (
    <div className="min-h-screen bg-[#0d1b2a]">
      <PatientNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">AI Health Insights</h2>
            <p className="text-slate-400 text-sm mt-1">
              {currentPatient.name} · {currentPatient.id} · {docs.length} document{docs.length !== 1 ? 's' : ''} analysed
            </p>
          </div>
          <select
            value={currentPatient.id}
            onChange={e => setCurrentPatient(patients.find(p => p.id === e.target.value))}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-teal-500 min-w-40"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>
            ))}
          </select>
        </div>

        {/* Summary ribbon */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            {
              icon:  '⛔',
              label: 'Drug Conflicts',
              value: conflicts.length,
              sub:   conflicts.length > 0 ? `${conflicts.filter(c=>c.severity==='HIGH').length} high risk` : 'All clear',
              color: conflicts.length > 0 ? 'from-red-900/40 to-red-950/40 border-red-500/30 text-red-300' : 'from-teal-900/20 to-teal-950/20 border-teal-500/20 text-teal-300',
            },
            {
              icon:  '💊',
              label: 'Health Score',
              value: scoreData.overall ? `${scoreData.overall}/100` : '—',
              sub:   scoreData.overall ? `Trend: ${scoreData.trend}` : 'Upload docs',
              color: 'from-purple-900/30 to-slate-900/40 border-purple-500/20 text-purple-300',
            },
            {
              icon:  '📅',
              label: 'AI Follow-ups',
              value: suggestions.length,
              sub:   suggestions.length > 0
                ? `${suggestions.filter(s=>s.priority==='urgent').length} urgent`
                : 'None detected',
              color: suggestions.length > 0 ? 'from-amber-900/30 to-slate-900/40 border-amber-500/25 text-amber-300' : 'from-slate-800/40 to-slate-900/40 border-slate-700/40 text-slate-400',
            },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-4 text-center`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-2xl font-black ${s.color.includes('red') ? 'text-red-300' : s.color.includes('purple') ? 'text-purple-300' : s.color.includes('amber') ? 'text-amber-300' : 'text-teal-300'}`}>
                {s.value}
              </p>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {docs.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🏥</p>
            <p className="text-slate-300 text-xl font-bold mb-2">No Documents Yet</p>
            <p className="text-slate-500 text-sm mb-6">Upload medical reports to activate AI Health Insights</p>
            <Link to="/upload"
              className="inline-block px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition">
              Upload First Document →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1. Drug Conflicts — most prominent if any */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⛔</span>
                <h3 className="text-base font-bold text-white">Drug Conflict Detection</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                  CROSS-DOCUMENT AI
                </span>
              </div>
              <ConflictAlert patientId={currentPatient.id} />
            </section>

            {/* 2. Health Score */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💊</span>
                <h3 className="text-base font-bold text-white">Smart Health Score</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">
                  TREND ANALYSIS
                </span>
              </div>
              <HealthScoreCard patientId={currentPatient.id} />
            </section>

            {/* 3. Appointment Suggestions */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <h3 className="text-base font-bold text-white">AI Appointment Intelligence</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  AUTO-SUGGEST
                </span>
              </div>
              <AppointmentSuggestions patientId={currentPatient.id} />
            </section>

          </div>
        )}
      </main>
    </div>
  )
}
