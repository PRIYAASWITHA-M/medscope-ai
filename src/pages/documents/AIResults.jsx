import { useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { usePatient } from '../../context/PatientContext.jsx'
import VoicePlayer from '../../components/VoicePlayer.jsx'
import Skeleton from '../../components/Skeleton.jsx'

// ── Section wrapper ───────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      <div className="bg-[#051625]/70 border border-teal-500/10 rounded-xl p-4 space-y-2 text-sm">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <p className="text-slate-300 flex gap-2 flex-wrap">
      <span className="font-semibold text-slate-200 shrink-0">{label}:</span>
      <span className={highlight ? 'text-red-400 font-semibold' : ''}>{value || 'Not specified'}</span>
    </p>
  )
}

function Badge({ text, color = 'teal' }) {
  const colors = {
    teal:   'bg-teal-500/15 text-teal-300 border-teal-500/30',
    red:    'bg-red-500/15 text-red-300 border-red-500/30',
    amber:  'bg-amber-500/15 text-amber-300 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold ${colors[color]}`}>
      {text}
    </span>
  )
}

export default function AIResults() {
  const { state }            = useLocation()
  const { currentPatient, getPatientDocs, lastAIResult } = usePatient()

  // Use state result (from upload), or lastAIResult, or most recent doc
  const docs       = getPatientDocs(currentPatient.id)
  const latestDoc  = docs[docs.length - 1]
  const result     = state?.result || lastAIResult || latestDoc?.result || null
  const filename   = state?.filename || latestDoc?.filename || 'Medical_Report.pdf'

  const patient    = result?.patient   || { name: currentPatient.name, id: currentPatient.id, dob: currentPatient.dob, age: currentPatient.age, gender: currentPatient.gender }
  const events     = result?.events    || []
  const medicines  = result?.medicines || []
  const tests      = result?.tests     || []
  const diagnoses  = result?.diagnosis || []
  const followup   = result?.follow_up || ''
  const summary    = result?.summary   || ''
  const aiSource   = result?._source   || 'demo'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07111f] via-[#102a43] to-[#0b3b4c] flex flex-col">

      {/* Header */}
      <header className="text-center pt-8 pb-3 px-4">
        <h1 className="text-3xl font-bold text-teal-300 tracking-wide">MedScope AI</h1>
        <p className="text-slate-400 mt-1 text-sm">Medical Document Intelligence</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-10 pt-3">
        <div className="w-full max-w-2xl">

          {/* ── Title ── */}
          <div className="bg-[#112538]/90 border border-teal-500/20 rounded-2xl shadow-2xl p-6 mb-4">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-xl font-semibold text-slate-100">AI Document Analysis</h2>
              <Badge text={`via ${aiSource}`} color="purple" />
            </div>
            <p className="text-slate-400 text-xs">📄 {filename}</p>
            {summary && (
              <p className="mt-3 text-slate-300 text-sm leading-relaxed bg-teal-900/20 border border-teal-500/15 rounded-xl p-3">
                {summary}
              </p>
            )}
          </div>

          {/* ── 🔊 Voice Player ── */}
          <div className="mb-4">
            <VoicePlayer
              result={result}
              patientName={patient.name || currentPatient.name}
              darkMode={true}
            />
          </div>

          {/* ── Main Results Card ── */}
          <div className="bg-[#112538]/90 border border-teal-500/20 rounded-2xl shadow-2xl p-6">

            {/* Patient */}
            <Section icon="👤" title="Patient Information">
              <Row label="Name"          value={patient.name} />
              <Row label="Patient ID"    value={patient.id} />
              <Row label="Date of Birth" value={patient.dob} />
              <Row label="Age"           value={patient.age} />
              <Row label="Gender"        value={patient.gender} />
            </Section>

            {/* Diagnosis */}
            {diagnoses.length > 0 && (
              <Section icon="🏥" title="Diagnosis">
                <div className="flex flex-wrap gap-2">
                  {diagnoses.map((d, i) => (
                    d && d !== 'See uploaded document' && (
                      <Badge key={i} text={d} color="red" />
                    )
                  ))}
                </div>
              </Section>
            )}

            {/* Medical Events */}
            {events.length > 0 && (
              <Section icon="🩺" title="Medical Events">
                {events.map((ev, i) => (
                  <div key={i} className={i > 0 ? 'pt-3 border-t border-teal-500/10 mt-2' : ''}>
                    <Row label="Date"     value={ev.date} />
                    <Row label="Event"    value={ev.event} />
                    {ev.clinical && <Row label="Clinical" value={ev.clinical} />}
                  </div>
                ))}
              </Section>
            )}

            {/* Medicines */}
            {medicines.length > 0 && (
              <Section icon="💊" title="Medicines">
                {medicines.map((m, i) => (
                  m.name !== 'See document' && (
                    <div key={i} className={i > 0 ? 'pt-3 border-t border-teal-500/10 mt-2' : ''}>
                      <Row label="Medicine"  value={m.name} />
                      <Row label="Dosage"    value={m.dosage} />
                      <Row label="Frequency" value={m.frequency} />
                      <p className="text-xs text-slate-500 mt-1">📎 Source: {m.source}</p>
                    </div>
                  )
                ))}
              </Section>
            )}

            {/* Tests */}
            {tests.length > 0 && (
              <Section icon="🧪" title="Tests / Investigations">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-teal-500/15">
                        {['Test', 'Value', 'Unit', 'Reference', 'Status'].map(h => (
                          <th key={h} className="text-left py-2 pr-3 text-slate-500 font-semibold uppercase tracking-wide text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-500/10">
                      {tests.map((t, i) => (
                        t.name !== 'See document' && (
                          <tr key={i}>
                            <td className="py-2 pr-3 text-slate-300 font-medium">{t.name}</td>
                            <td className={`py-2 pr-3 font-bold ${t.result?.includes('High') || t.result?.includes('↑') ? 'text-red-400' : 'text-teal-300'}`}>{t.value}</td>
                            <td className="py-2 pr-3 text-slate-500">{t.unit}</td>
                            <td className="py-2 pr-3 text-slate-500">{t.reference}</td>
                            <td className="py-2">
                              <Badge
                                text={t.result?.includes('High') || t.result?.includes('↑') ? '⚠ High' : t.result || 'See report'}
                                color={t.result?.includes('High') || t.result?.includes('↑') ? 'red' : 'teal'}
                              />
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Follow-up */}
            {followup && followup !== 'No specific follow-up mentioned' && (
              <Section icon="📅" title="Follow-up">
                <p className="text-slate-300 text-sm">{followup}</p>
              </Section>
            )}

            {/* Source traceability */}
            <Section icon="🔗" title="Source & Traceability">
              <p className="text-slate-400 text-sm leading-relaxed mb-3">
                All extracted information is traceable to the original uploaded document.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-teal-800/40 border border-teal-500/30 text-teal-300 text-xs font-medium">
                  📄 {filename}
                </span>
                <Badge text={`Processed by AI (${aiSource})`} color="purple" />
              </div>
            </Section>

            {/* AI note */}
            <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
              <strong>🤖 AI Note: </strong>
              Extracted information should be reviewed by a healthcare professional before any clinical decision.
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                to="/upload"
                className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white font-bold text-sm transition-all hover:-translate-y-0.5"
              >
                ← Upload Another Document
              </Link>
              <div className="flex gap-3">
                <Link to="/timeline" className="flex-1 text-center py-2.5 rounded-xl border border-teal-500/40 text-teal-400 hover:bg-teal-900/30 text-sm font-medium transition">
                  📊 View Timeline
                </Link>
                <Link to="/patient/appointments" className="flex-1 text-center py-2.5 rounded-xl border border-teal-500/40 text-teal-400 hover:bg-teal-900/30 text-sm font-medium transition">
                  📅 Book Follow-up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
