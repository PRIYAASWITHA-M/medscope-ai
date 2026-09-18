/**
 * HealthScoreCard — Smart Health Score with trend graph
 *
 * Shows:
 *  - Animated score ring
 *  - Trend (improving / stable / declining)
 *  - Per-category breakdown bars
 *  - Score history sparkline (SVG bar chart)
 */

import { usePatient }                       from '../context/PatientContext.jsx'
import { computeHealthScore, scoreColor, TREND_META } from '../utils/healthScore.js'

// ── Animated SVG score ring ───────────────────────────────────────
function ScoreRing({ score, color }) {
  const r    = 52
  const circ = 2 * Math.PI * r
  const dash = score ? (score / 100) * circ : 0

  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color.ring} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score ? (
          <>
            <span className={`text-4xl font-black ${color.text}`}>{score}</span>
            <span className="text-xs text-slate-500 font-medium">/100</span>
          </>
        ) : (
          <span className="text-slate-600 text-xs text-center px-3">Upload docs to score</span>
        )}
      </div>
    </div>
  )
}

// ── SVG Line Graph (score history) ───────────────────────────────
function LineGraph({ history }) {
  if (history.length < 2) return null

  const W = 340, H = 100, padX = 28, padY = 12

  const innerW = W - padX * 2
  const innerH = H - padY * 2

  const minScore = Math.max(0,  Math.min(...history.map(h => h.score)) - 10)
  const maxScore = Math.min(100, Math.max(...history.map(h => h.score)) + 10)
  const range    = maxScore - minScore || 1

  // Map each point to SVG coords
  const pts = history.map((h, i) => ({
    x: padX + (i / (history.length - 1)) * innerW,
    y: padY + innerH - ((h.score - minScore) / range) * innerH,
    score: h.score,
    date:  h.date || `D${i + 1}`,
  }))

  const pathD    = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD    = `${pathD} L ${pts[pts.length-1].x} ${padY+innerH} L ${pts[0].x} ${padY+innerH} Z`

  // Pick color for each point
  function ptColor(score) {
    if (score >= 80) return '#14b8a6'
    if (score >= 60) return '#f59e0b'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  // Y-axis grid lines
  const gridLines = [25, 50, 75, 100].map(val => ({
    val,
    y: padY + innerH - ((val - minScore) / range) * innerH,
  })).filter(g => g.y >= padY && g.y <= padY + innerH)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} className="overflow-visible">
      {/* Grid lines */}
      {gridLines.map(g => (
        <g key={g.val}>
          <line x1={padX} y1={g.y} x2={W - padX} y2={g.y}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <text x={padX - 4} y={g.y + 3} textAnchor="end" fontSize="7" fill="#475569">{g.val}</text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#areaGrad)" opacity="0.3" />
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Line */}
      <path d={pathD} fill="none" stroke="#14b8a6" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(20,184,166,0.5))' }} />

      {/* Data points */}
      {pts.map((p, i) => (
        <g key={i}>
          {/* Glow */}
          <circle cx={p.x} cy={p.y} r="6" fill={ptColor(p.score)} opacity="0.2" />
          {/* Dot */}
          <circle cx={p.x} cy={p.y} r="4" fill={ptColor(p.score)}
            stroke="#0d1b2a" strokeWidth="1.5" />
          {/* Score label above dot */}
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8"
            fill={ptColor(p.score)} fontWeight="bold">{p.score}</text>
          {/* Date below x-axis */}
          <text x={p.x} y={H + 18} textAnchor="middle" fontSize="7.5" fill="#475569">
            {p.date.slice(0, 6)}
          </text>
        </g>
      ))}

      {/* X axis */}
      <line x1={padX} y1={padY + innerH} x2={W - padX} y2={padY + innerH}
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
  )
}

// ── Category bar ─────────────────────────────────────────────────
function CategoryBar({ name, avg, status }) {
  const c = scoreColor(avg)
  const isHigh = status.includes('High') || status.includes('↑')
  const isLow  = status.includes('Low')  || status.includes('↓')

  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-slate-400 w-24 shrink-0">{name}</p>
      <div className="flex-1 bg-slate-800/60 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${avg}%`, background: c.ring }}
        />
      </div>
      <span className={`text-xs font-semibold w-20 text-right ${
        isHigh ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-teal-400'
      }`}>
        {status}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function HealthScoreCard({ patientId }) {
  const { getPatientDocs } = usePatient()
  const docs  = getPatientDocs(patientId)
  const data  = computeHealthScore(docs)
  const color = scoreColor(data.overall || 0)
  const trend = TREND_META[data.trend]

  return (
    <div className="bg-[#111c2d] border border-slate-700/50 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center text-sm">💊</span>
          <h3 className="font-bold text-white text-base">Smart Health Score</h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
          AI POWERED
        </span>
      </div>

      <div className="p-5">
        {/* Score ring + summary */}
        <div className="flex items-center gap-6 mb-5">
          <ScoreRing score={data.overall} color={color} />

          <div className="flex-1">
            {data.overall ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-2xl font-black ${color.text}`}>{color.label}</span>
                </div>

                {/* Trend badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold mb-3 ${trend.bg} ${trend.color}`}>
                  <span>{trend.icon}</span>
                  <span>Trend: {trend.label}</span>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed">
                  Based on <strong className="text-slate-300">{data.totalDocs} document{data.totalDocs > 1 ? 's' : ''}</strong>.
                  {data.trend === 'declining' && <span className="text-red-400 font-medium"> Health declining — consult doctor.</span>}
                  {data.trend === 'improving' && <span className="text-teal-400 font-medium"> Keep up the good work!</span>}
                  {data.trend === 'stable'    && <span className="text-blue-400 font-medium"> Condition stable.</span>}
                </p>
              </>
            ) : (
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">No health data yet</p>
                <p className="text-slate-600 text-xs">Upload medical reports to generate your Smart Health Score.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        {Object.keys(data.categories).length > 0 && (
          <div className="mb-5 space-y-2.5">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Category Breakdown</p>
            {Object.entries(data.categories).map(([cat, val]) => (
              <CategoryBar key={cat} name={cat} avg={val.avg} status={val.status} />
            ))}
          </div>
        )}

        {/* Score history line graph */}
        {data.history.length >= 2 && (
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
              Health Score Trend — {data.history.length} Documents
            </p>
            <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 overflow-x-auto">
              <LineGraph history={data.history} />
            </div>
          </div>
        )}

        {/* Latest diagnoses */}
        {data.latest?.diagnosis?.filter(d => d && d !== 'See uploaded document').length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.latest.diagnosis.filter(d => d && d !== 'See uploaded document').map((d, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                ⚕ {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
