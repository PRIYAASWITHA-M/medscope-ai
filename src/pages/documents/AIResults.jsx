import { useLocation, Link } from 'react-router-dom'

// ── Default demo data (shown when no real AI result is passed) ──
const DEMO = {
  filename: 'Medical_Report.pdf',
  patient: {
    name:  'Arun Kumar',
    id:    'MS-1001',
    dob:   '12 March 2000',
  },
  events: [
    { date: '15 August 2026', event: 'Hospital consultation', clinical: 'Fever and general weakness reported.' },
  ],
  medicines: [
    { name: 'Medicine A', dosage: 'As recorded in the document', source: 'Medical_Report.pdf' },
  ],
  tests: [
    { name: 'Blood Test', date: '15 August 2026', result: 'Recorded in uploaded document' },
  ],
}

// ── Section wrapper ──────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      <div className="bg-[#051625]/70 border border-teal-500/15 rounded-xl p-4 space-y-2 text-sm">
        {children}
      </div>
    </div>
  )
}

// ── Row ──────────────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <p className="text-slate-300">
      <span className="font-semibold text-slate-200">{label}: </span>
      {value}
    </p>
  )
}

export default function AIResults() {
  const { state } = useLocation()

  // Merge passed state with demo defaults
  const filename  = state?.filename  || DEMO.filename
  const result    = state?.result    || null

  const patient   = result?.patient   || DEMO.patient
  const events    = result?.events    || DEMO.events
  const medicines = result?.medicines || DEMO.medicines
  const tests     = result?.tests     || DEMO.tests

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07111f] via-[#102a43] to-[#0b3b4c] flex flex-col">

      {/* Header */}
      <header className="text-center pt-10 pb-4 px-4">
        <h1 className="text-4xl font-bold text-teal-300 tracking-wide">MedScope AI</h1>
        <p className="text-slate-400 mt-2 text-sm">Medical Document Intelligence</p>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-start justify-center px-4 pb-10 pt-4">
        <div className="w-full max-w-2xl bg-[#112538]/90 border border-teal-500/20 rounded-2xl shadow-2xl p-8">

          <h2 className="text-2xl font-semibold text-slate-100 mb-2 text-center">AI Document Analysis</h2>
          <p className="text-slate-400 text-sm text-center mb-7">
            AI-extracted medical information from your uploaded document.
          </p>

          {/* Document Info */}
          <Section icon="📄" title="Document Information">
            <Row label="Document" value={filename} />
            <p className="text-slate-300">
              <span className="font-semibold text-slate-200">Status: </span>
              <span className="text-teal-400 font-semibold">✓ Processed</span>
            </p>
          </Section>

          {/* Patient Info */}
          <Section icon="👤" title="Patient Information">
            <Row label="Name"          value={patient.name} />
            <Row label="Patient ID"    value={patient.id} />
            <Row label="Date of Birth" value={patient.dob} />
          </Section>

          {/* Medical Events */}
          <Section icon="🩺" title="Medical Events">
            {events.map((ev, i) => (
              <div key={i} className={i > 0 ? 'pt-3 border-t border-teal-500/10 mt-3' : ''}>
                <Row label="Visit Date"           value={ev.date} />
                <Row label="Event"                value={ev.event} />
                <Row label="Clinical Information" value={ev.clinical} />
              </div>
            ))}
          </Section>

          {/* Medicines */}
          <Section icon="💊" title="Medicines">
            {medicines.map((m, i) => (
              <div key={i} className={i > 0 ? 'pt-3 border-t border-teal-500/10 mt-3' : ''}>
                <Row label="Medicine" value={m.name} />
                <Row label="Dosage"   value={m.dosage} />
                <Row label="Source"   value={m.source} />
              </div>
            ))}
          </Section>

          {/* Tests */}
          <Section icon="🧪" title="Tests / Investigations">
            {tests.map((t, i) => (
              <div key={i} className={i > 0 ? 'pt-3 border-t border-teal-500/10 mt-3' : ''}>
                <Row label="Test"   value={t.name} />
                <Row label="Date"   value={t.date} />
                <Row label="Result" value={t.result} />
              </div>
            ))}
          </Section>

          {/* Source & Traceability */}
          <Section icon="🔗" title="Source & Traceability">
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              Every extracted information item is traceable back to the original medical document.
            </p>
            <button className="px-4 py-2 rounded-lg bg-teal-700/40 border border-teal-500/40 text-teal-300 text-sm font-medium hover:bg-teal-700/60 transition">
              View Source Document
            </button>
          </Section>

          {/* AI Note */}
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm text-amber-300 leading-relaxed">
            <strong className="block mb-1">🤖 AI Processing Note</strong>
            The information shown above is extracted from the uploaded document and should be
            reviewed by a healthcare professional before any clinical decision.
          </div>

          {/* Back button */}
          <Link
            to="/upload"
            className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            ← Upload Another Document
          </Link>

          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
            <Link to="/patient/dashboard" className="hover:text-teal-400 transition">Dashboard</Link>
            <span>|</span>
            <Link to="/timeline" className="hover:text-teal-400 transition">View Timeline</Link>
          </div>

        </div>
      </main>
    </div>
  )
}
