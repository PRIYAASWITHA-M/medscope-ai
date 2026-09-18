import { useNavigate, Link } from 'react-router-dom'

const events = [
  {
    id: 1,
    date: '10 Jan 2026',
    title: 'Fever Consultation',
    doctor: 'Dr. Kumar',
    type: 'Consultation',
    icon: '🤒',
    color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    dotColor: 'bg-orange-400',
  },
  {
    id: 2,
    date: '15 Jan 2026',
    title: 'Blood Test Report',
    doctor: 'Dr. Kumar',
    type: 'Investigation',
    icon: '🩸',
    color: 'from-red-500/20 to-red-600/10 border-red-500/30',
    dotColor: 'bg-red-400',
  },
  {
    id: 3,
    date: '01 Mar 2026',
    title: 'Diabetes Detected',
    doctor: 'Dr. Kumar',
    type: 'Diagnosis',
    icon: '🏥',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    dotColor: 'bg-purple-400',
  },
  {
    id: 4,
    date: '20 Aug 2026',
    title: 'Kidney Checkup',
    doctor: 'Dr. Priya',
    type: 'Checkup',
    icon: '🫘',
    color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
    dotColor: 'bg-teal-400',
  },
]

export default function MedicalTimeline() {
  const navigate = useNavigate()

  function openDetails(event) {
    navigate('/timeline/event', { state: { event } })
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* Header */}
      <header className="bg-teal-600 py-5 px-6 text-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">MEDSCOPE AI — Medical Timeline</h1>
        <p className="text-teal-100 text-sm mt-1">Your complete medical history at a glance</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* AI Summary Card */}
        <div className="mb-8 p-5 bg-slate-800/60 border border-teal-500/20 rounded-2xl">
          <h2 className="text-teal-400 font-semibold text-sm uppercase tracking-wide mb-3">🤖 AI Generated Summary</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Patient attended <strong className="text-white">4 medical events</strong>.
            Diabetes diagnosis detected on 01 Mar 2026.
            Follow-up for kidney checkup completed on 20 Aug 2026.
            <strong className="text-amber-400"> Ongoing follow-up recommended.</strong>
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-teal-500/30" />

          <div className="space-y-5">
            {events.map((ev) => (
              <div
                key={ev.id}
                onClick={() => openDetails(ev)}
                className="relative ml-14 cursor-pointer"
              >
                {/* Dot */}
                <div className={`absolute -left-9 top-5 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] ${ev.dotColor} shadow-lg`} />

                {/* Card */}
                <div className={`bg-gradient-to-r ${ev.color} border rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ev.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white text-base">{ev.title}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{ev.doctor} · {ev.type}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-teal-400 font-medium text-sm">{ev.date}</p>
                      <p className="text-slate-500 text-xs mt-0.5">Tap for details →</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Graph Button */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/timeline/graph"
            className="flex-1 text-center py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition"
          >
            📊 View Medical Graph
          </Link>
          <Link
            to="/patient/dashboard"
            className="flex-1 text-center py-3 rounded-xl border border-slate-600 hover:border-teal-500 text-slate-300 hover:text-teal-400 font-semibold text-sm transition"
          >
            ← Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
