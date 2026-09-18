/**
 * MedScope AI — Drug Conflict Detector
 *
 * Cross-document medicine interaction checker.
 * Runs entirely in the browser — no API needed.
 *
 * Database covers the most common dangerous interactions
 * seen in Indian clinical practice.
 */

// ── Known dangerous drug pairs ────────────────────────────────────
// Each entry: { drugs: [name_fragment_a, name_fragment_b], severity, reason, recommendation }
const INTERACTION_DB = [
  // Diabetes + common interactions
  {
    drugs: ['metformin', 'alcohol'],
    severity: 'HIGH',
    reason: 'Metformin + Alcohol increases risk of lactic acidosis — a potentially fatal condition.',
    recommendation: 'Avoid alcohol completely while on Metformin.',
  },
  {
    drugs: ['glipizide', 'fluconazole'],
    severity: 'HIGH',
    reason: 'Fluconazole increases Glipizide blood levels, causing severe hypoglycemia.',
    recommendation: 'Use alternative antifungal. Monitor blood sugar closely.',
  },
  {
    drugs: ['metformin', 'contrast'],
    severity: 'HIGH',
    reason: 'Iodine contrast media with Metformin can cause acute kidney injury and lactic acidosis.',
    recommendation: 'Stop Metformin 48 hours before contrast procedures.',
  },

  // Blood pressure
  {
    drugs: ['atenolol', 'verapamil'],
    severity: 'HIGH',
    reason: 'Both slow the heart — combination can cause dangerous bradycardia or heart block.',
    recommendation: 'Avoid combination. Consult cardiologist immediately.',
  },
  {
    drugs: ['atenolol', 'diltiazem'],
    severity: 'HIGH',
    reason: 'Additive effect on heart rate — risk of severe bradycardia and AV block.',
    recommendation: 'Monitor heart rate closely. Consider alternative.',
  },
  {
    drugs: ['lisinopril', 'potassium'],
    severity: 'MEDIUM',
    reason: 'ACE inhibitors like Lisinopril retain potassium — adding potassium supplements risks hyperkalemia.',
    recommendation: 'Monitor serum potassium regularly.',
  },
  {
    drugs: ['amlodipine', 'simvastatin'],
    severity: 'MEDIUM',
    reason: 'Amlodipine increases Simvastatin levels up to 77%, raising risk of muscle breakdown (rhabdomyolysis).',
    recommendation: 'Limit Simvastatin to 20mg/day when combined with Amlodipine.',
  },

  // Antibiotics
  {
    drugs: ['ciprofloxacin', 'antacid'],
    severity: 'MEDIUM',
    reason: 'Antacids reduce Ciprofloxacin absorption by up to 90%, making the antibiotic ineffective.',
    recommendation: 'Take Ciprofloxacin 2 hours before or 6 hours after antacids.',
  },
  {
    drugs: ['metronidazole', 'alcohol'],
    severity: 'HIGH',
    reason: 'Severe disulfiram-like reaction — nausea, vomiting, flushing, rapid heart rate.',
    recommendation: 'Absolutely no alcohol during treatment and 48 hours after.',
  },
  {
    drugs: ['clarithromycin', 'simvastatin'],
    severity: 'HIGH',
    reason: 'Clarithromycin dramatically increases Simvastatin levels — severe muscle damage risk.',
    recommendation: 'Stop Simvastatin during Clarithromycin course.',
  },

  // Pain / NSAIDs
  {
    drugs: ['ibuprofen', 'aspirin'],
    severity: 'MEDIUM',
    reason: 'Ibuprofen blocks aspirin\'s antiplatelet effect — reduces heart protection of aspirin.',
    recommendation: 'Take aspirin 2 hours before Ibuprofen, or use Paracetamol instead.',
  },
  {
    drugs: ['ibuprofen', 'warfarin'],
    severity: 'HIGH',
    reason: 'NSAIDs increase bleeding risk significantly when combined with anticoagulants.',
    recommendation: 'Avoid NSAIDs. Use Paracetamol for pain relief instead.',
  },
  {
    drugs: ['diclofenac', 'lisinopril'],
    severity: 'MEDIUM',
    reason: 'NSAIDs reduce the blood pressure lowering effect of ACE inhibitors.',
    recommendation: 'Monitor blood pressure. Use Paracetamol if possible.',
  },

  // Psychiatric
  {
    drugs: ['sertraline', 'tramadol'],
    severity: 'HIGH',
    reason: 'Risk of serotonin syndrome — potentially life-threatening. Agitation, high fever, rapid heart rate.',
    recommendation: 'Use alternative pain medication. Inform prescribing doctor.',
  },
  {
    drugs: ['fluoxetine', 'tramadol'],
    severity: 'HIGH',
    reason: 'SSRI + Tramadol = serotonin syndrome risk. Also reduces tramadol\'s pain-relieving effect.',
    recommendation: 'Use alternative pain medication. Monitor for serotonin syndrome signs.',
  },

  // Thyroid
  {
    drugs: ['levothyroxine', 'calcium'],
    severity: 'MEDIUM',
    reason: 'Calcium reduces absorption of Levothyroxine, making thyroid treatment less effective.',
    recommendation: 'Take Levothyroxine on empty stomach, 4 hours apart from calcium supplements.',
  },
  {
    drugs: ['levothyroxine', 'antacid'],
    severity: 'MEDIUM',
    reason: 'Antacids (containing magnesium/aluminium) bind Levothyroxine and reduce absorption.',
    recommendation: 'Take Levothyroxine 4 hours before or after antacids.',
  },

  // Cardiac
  {
    drugs: ['warfarin', 'aspirin'],
    severity: 'HIGH',
    reason: 'Both thin the blood — combined use greatly increases bleeding risk, including brain bleeding.',
    recommendation: 'Use only if specifically prescribed together. Requires close INR monitoring.',
  },
  {
    drugs: ['digoxin', 'amiodarone'],
    severity: 'HIGH',
    reason: 'Amiodarone doubles Digoxin levels — toxicity causes dangerous heart rhythm disturbances.',
    recommendation: 'Reduce Digoxin dose by 50% when starting Amiodarone. Monitor closely.',
  },
]

// ── Normalise medicine name for matching ─────────────────────────
function normaliseName(name) {
  return name
    .toLowerCase()
    .replace(/\d+\s*mg|\d+\s*ml|\d+\s*mcg/gi, '')  // strip dosage
    .replace(/tablet|capsule|syrup|injection|cap|tab/gi, '')
    .trim()
}

// ── Main detector ─────────────────────────────────────────────────
/**
 * Given an array of documents (from PatientContext),
 * return all detected drug interactions across all documents.
 *
 * @param {Array} docs  — patient document array from context
 * @returns {Array}     — list of conflict objects
 */
export function detectConflicts(docs) {
  if (!docs || docs.length === 0) return []

  // Collect ALL medicines with their source document
  const allMeds = []
  docs.forEach(doc => {
    const meds = doc.result?.medicines || []
    meds.forEach(med => {
      if (med.name && med.name !== 'See document') {
        allMeds.push({
          name:       med.name,
          normalised: normaliseName(med.name),
          dosage:     med.dosage || '',
          source:     doc.filename,
          date:       doc.uploaded_at,
        })
      }
    })
  })

  const conflicts = []

  // Check every pair against the interaction DB
  INTERACTION_DB.forEach(interaction => {
    const [drugA, drugB] = interaction.drugs

    const matchA = allMeds.filter(m => m.normalised.includes(drugA))
    const matchB = allMeds.filter(m => m.normalised.includes(drugB))

    if (matchA.length > 0 && matchB.length > 0) {
      // Avoid duplicate conflict entries
      const key = interaction.drugs.sort().join('|')
      const already = conflicts.find(c => c.key === key)
      if (!already) {
        conflicts.push({
          key,
          severity:       interaction.severity,       // 'HIGH' | 'MEDIUM'
          reason:         interaction.reason,
          recommendation: interaction.recommendation,
          drugA:          matchA[0],
          drugB:          matchB[0],
          crossDocument:  matchA[0].source !== matchB[0].source,
        })
      }
    }
  })

  // Sort: HIGH first
  return conflicts.sort((a, b) =>
    a.severity === 'HIGH' && b.severity !== 'HIGH' ? -1 : 1
  )
}

// ── Severity helpers ──────────────────────────────────────────────
export const SEVERITY_STYLE = {
  HIGH: {
    bg:     'bg-red-950/60',
    border: 'border-red-500/40',
    badge:  'bg-red-500/20 text-red-300 border-red-500/40',
    icon:   '⛔',
    label:  'HIGH RISK',
    text:   'text-red-300',
  },
  MEDIUM: {
    bg:     'bg-amber-950/40',
    border: 'border-amber-500/40',
    badge:  'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon:   '⚠️',
    label:  'MODERATE',
    text:   'text-amber-300',
  },
}
