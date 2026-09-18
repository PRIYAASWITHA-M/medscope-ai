/**
 * MedScope AI — Appointment Suggester
 *
 * Reads follow_up text from all uploaded documents and
 * extracts actionable appointment suggestions with:
 *  - Suggested date (computed from "X months/weeks/days")
 *  - Reason
 *  - Recommended doctor type
 *  - Source document
 */

// ── Duration patterns → days ──────────────────────────────────────
const DURATION_PATTERNS = [
  { re: /(\d+)\s*month/i,  multiplier: 30  },
  { re: /(\d+)\s*week/i,   multiplier: 7   },
  { re: /(\d+)\s*day/i,    multiplier: 1   },
  { re: /(\d+)\s*year/i,   multiplier: 365 },
  { re: /one\s*month/i,    fixed: 30  },
  { re: /two\s*months/i,   fixed: 60  },
  { re: /three\s*months/i, fixed: 90  },
  { re: /six\s*months/i,   fixed: 180 },
  { re: /fortnight/i,      fixed: 14  },
  { re: /next\s*week/i,    fixed: 7   },
]

// ── Keywords that indicate a follow-up is needed ─────────────────
const FOLLOWUP_KW = [
  'follow.?up', 'follow up', 'review after', 'review in', 'come back',
  'revisit', 'return in', 'next visit', 'consult again', 'repeat test',
  'check up in', 'schedule', 'appointment in', 'see doctor',
  'monitor', 'recheck', 'reassess',
]

// ── Doctor specialty inference ────────────────────────────────────
const SPECIALTY_MAP = [
  { keywords: ['blood sugar', 'diabetes', 'hba1c', 'glucose', 'insulin', 'metformin'], doctor: 'Endocrinologist' },
  { keywords: ['kidney', 'creatinine', 'renal', 'dialysis', 'urea'],                   doctor: 'Nephrologist'    },
  { keywords: ['heart', 'cardiac', 'bp', 'blood pressure', 'ecg', 'echo'],             doctor: 'Cardiologist'    },
  { keywords: ['liver', 'hepatic', 'sgpt', 'sgot', 'bilirubin'],                       doctor: 'Gastroenterologist'},
  { keywords: ['thyroid', 'tsh', 'levothyroxine', 't3', 't4'],                         doctor: 'Endocrinologist' },
  { keywords: ['bone', 'ortho', 'joint', 'fracture', 'spine'],                          doctor: 'Orthopedic'      },
  { keywords: ['lung', 'chest', 'breathing', 'asthma', 'copd', 'pulmonary'],           doctor: 'Pulmonologist'   },
  { keywords: ['cancer', 'oncol', 'chemo', 'tumor', 'biopsy'],                          doctor: 'Oncologist'      },
  { keywords: ['eye', 'vision', 'retina', 'glaucoma'],                                  doctor: 'Ophthalmologist' },
  { keywords: ['neuro', 'brain', 'seizure', 'migraine', 'stroke'],                      doctor: 'Neurologist'     },
]

// ── Add days to today ─────────────────────────────────────────────
function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + Math.round(days))
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Parse how many days from follow-up text ───────────────────────
function parseDays(text) {
  for (const p of DURATION_PATTERNS) {
    if (p.fixed !== undefined && p.re.test(text)) return p.fixed
    const m = text.match(p.re)
    if (m) return parseInt(m[1]) * p.multiplier
  }
  return null // unknown duration
}

// ── Infer doctor specialty from combined text ─────────────────────
function inferDoctor(text) {
  const lower = text.toLowerCase()
  for (const entry of SPECIALTY_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.doctor
  }
  return 'General Physician'
}

// ── Main extractor ────────────────────────────────────────────────
/**
 * @param {Array} docs — patient docs from PatientContext
 * @returns {Array}    — list of appointment suggestion objects
 */
export function extractAppointmentSuggestions(docs) {
  if (!docs || docs.length === 0) return []

  const suggestions = []

  docs.forEach(doc => {
    const result   = doc.result || {}
    const followUp = result.follow_up || ''
    const summary  = result.summary   || ''
    const diagnoses = (result.diagnosis || []).join(' ')
    const allText   = `${followUp} ${summary}`.toLowerCase()

    // Check if any follow-up keyword is present
    const hasFollowup = FOLLOWUP_KW.some(kw => new RegExp(kw, 'i').test(allText))
    if (!hasFollowup) return

    // Parse duration
    const days          = parseDays(allText)
    const suggestedDate = days ? addDays(days) : addDays(90) // default 3 months
    const durationLabel = days
      ? days >= 365 ? `${Math.round(days/365)} year${days>=730?'s':''}` 
        : days >= 30 ? `${Math.round(days/30)} month${days>=60?'s':''}`
        : `${days} day${days>1?'s':''}`
      : '3 months'

    // Build reason from follow-up text (first 120 chars)
    const reason = followUp.length > 10
      ? followUp.slice(0, 120)
      : `Follow-up after ${doc.filename}`

    // Infer specialty from diagnoses + follow-up text
    const combinedText  = `${followUp} ${diagnoses} ${allText}`
    const doctor        = inferDoctor(combinedText)

    suggestions.push({
      id:            `${doc.filename}-followup`,
      source:        doc.filename,
      sourceDate:    doc.uploaded_at,
      reason,
      suggestedDate,
      durationLabel,
      doctor,
      priority:      days && days <= 30 ? 'urgent' : days && days <= 90 ? 'soon' : 'routine',
      rawFollowUp:   followUp,
    })
  })

  // Sort: urgent first
  const order = { urgent: 0, soon: 1, routine: 2 }
  return suggestions.sort((a, b) => order[a.priority] - order[b.priority])
}

export const PRIORITY_STYLE = {
  urgent:  { badge: 'bg-red-500/15 text-red-300 border-red-500/30',    label: '🔴 Urgent',  dot: 'bg-red-400'    },
  soon:    { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: '🟡 Soon', dot: 'bg-amber-400'  },
  routine: { badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30', label: '🟢 Routine', dot: 'bg-teal-400'   },
}
