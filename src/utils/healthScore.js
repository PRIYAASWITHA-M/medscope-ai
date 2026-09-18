/**
 * MedScope AI — Smart Health Score Engine
 *
 * Analyses ALL uploaded documents for a patient and produces:
 *  - Overall health score (0–100)
 *  - Per-category scores (Blood, BP, Kidney, Sugar, etc.)
 *  - Trend per category (improving / stable / declining)
 *  - Document-by-document score history (for the graph)
 */

// ── Test parameter definitions ────────────────────────────────────
// Each entry maps a test name fragment → { category, weight, badKeywords }
const TEST_PARAMS = [
  // Blood Sugar
  { keywords: ['blood sugar', 'glucose', 'rbs', 'fbs', 'ppbs', 'hba1c', 'glycated'],
    category: 'Blood Sugar', weight: 20 },
  // Blood Pressure
  { keywords: ['bp', 'blood pressure', 'systolic', 'diastolic', 'hypertension'],
    category: 'Blood Pressure', weight: 18 },
  // Kidney
  { keywords: ['creatinine', 'urea', 'bun', 'uric acid', 'egfr', 'kidney', 'renal'],
    category: 'Kidney', weight: 18 },
  // Liver
  { keywords: ['sgpt', 'sgot', 'alt', 'ast', 'bilirubin', 'liver', 'hepatic', 'alp'],
    category: 'Liver', weight: 15 },
  // Blood Count
  { keywords: ['haemoglobin', 'hemoglobin', 'hb ', 'wbc', 'rbc', 'platelet', 'cbc'],
    category: 'Blood Count', weight: 15 },
  // Cholesterol
  { keywords: ['cholesterol', 'ldl', 'hdl', 'triglyceride', 'lipid'],
    category: 'Cholesterol', weight: 14 },
]

const HIGH_PENALTY   = 15   // points deducted per High result
const MEDIUM_PENALTY = 7    // for slightly abnormal
const DIAGNOSIS_PENALTY = 8 // per chronic diagnosis

// ── Score a single document ───────────────────────────────────────
function scoreDocument(doc) {
  const result     = doc.result || {}
  const tests      = result.tests     || []
  const diagnosis  = result.diagnosis || []
  let score        = 100
  const breakdown  = {}

  // Deduct for high test results
  tests.forEach(t => {
    const name = (t.name || '').toLowerCase()
    const res  = (t.result || '').toLowerCase()

    TEST_PARAMS.forEach(param => {
      if (param.keywords.some(k => name.includes(k))) {
        if (!breakdown[param.category]) breakdown[param.category] = { score: 100, status: 'Normal' }
        if (res.includes('high') || res.includes('↑') || res.includes('abnormal') || res.includes('elevated')) {
          score -= HIGH_PENALTY
          breakdown[param.category].score  -= HIGH_PENALTY
          breakdown[param.category].status  = 'High ↑'
        } else if (res.includes('low') || res.includes('↓') || res.includes('below')) {
          score -= MEDIUM_PENALTY
          breakdown[param.category].score  -= MEDIUM_PENALTY
          breakdown[param.category].status  = 'Low ↓'
        } else {
          breakdown[param.category].status = 'Normal ✓'
        }
      }
    })
  })

  // Deduct for chronic diagnoses
  const chronicKw = ['diabetes', 'hypertension', 'chronic', 'stage', 'failure', 'disease', 'disorder', 'syndrome']
  diagnosis.forEach(d => {
    if (chronicKw.some(k => d.toLowerCase().includes(k))) {
      score -= DIAGNOSIS_PENALTY
    }
  })

  return {
    score:      Math.max(Math.min(score, 100), 10),
    breakdown,
    date:       doc.uploaded_at,
    filename:   doc.filename,
    diagnosis,
  }
}

// ── Trend calculation ─────────────────────────────────────────────
function calcTrend(history) {
  if (history.length < 2) return 'stable'
  const last  = history[history.length - 1].score
  const prev  = history[history.length - 2].score
  const diff  = last - prev
  if (diff >= 5)  return 'improving'
  if (diff <= -5) return 'declining'
  return 'stable'
}

// ── Public entry point ────────────────────────────────────────────
/**
 * @param {Array} docs — patient documents from PatientContext
 * @returns {Object}   — full health score report
 */
export function computeHealthScore(docs) {
  if (!docs || docs.length === 0) {
    return { overall: null, trend: 'stable', history: [], categories: {}, totalDocs: 0 }
  }

  const history    = docs.map(scoreDocument)
  const latest     = history[history.length - 1]
  const trend      = calcTrend(history)

  // Merge category breakdowns across all docs
  const categories = {}
  history.forEach(h => {
    Object.entries(h.breakdown).forEach(([cat, data]) => {
      if (!categories[cat]) categories[cat] = { scores: [], status: data.status }
      categories[cat].scores.push(data.score)
      // Keep latest status
      categories[cat].status = data.status
    })
  })

  // Average per category
  Object.keys(categories).forEach(cat => {
    const avg = categories[cat].scores.reduce((a, b) => a + b, 0) / categories[cat].scores.length
    categories[cat].avg = Math.round(avg)
  })

  return {
    overall:   latest.score,
    trend,
    history,
    categories,
    totalDocs: docs.length,
    latest,
  }
}

// ── UI helpers ────────────────────────────────────────────────────
export function scoreColor(score) {
  if (score >= 80) return { text: 'text-teal-400',  ring: '#14b8a6', label: 'Good',            bg: 'bg-teal-500/10  border-teal-500/30'  }
  if (score >= 60) return { text: 'text-amber-400', ring: '#f59e0b', label: 'Fair',            bg: 'bg-amber-500/10 border-amber-500/30' }
  if (score >= 40) return { text: 'text-orange-400',ring: '#f97316', label: 'Needs Attention', bg: 'bg-orange-500/10 border-orange-500/30'}
  return                  { text: 'text-red-400',   ring: '#ef4444', label: 'Critical',        bg: 'bg-red-500/10   border-red-500/30'   }
}

export const TREND_META = {
  improving: { icon: '📈', label: 'Improving', color: 'text-teal-400',  bg: 'bg-teal-500/10 border-teal-500/30'  },
  stable:    { icon: '➡️', label: 'Stable',    color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/30'  },
  declining: { icon: '📉', label: 'Declining', color: 'text-red-400',   bg: 'bg-red-500/10  border-red-500/30'   },
}
