/**
 * useVoice — AI Voice hook using Web Speech API (SpeechSynthesis)
 *
 * Supports: English, Tamil, Hindi
 * No API key needed — runs entirely in the browser
 *
 * Usage:
 *   const { speak, stop, speaking, supported } = useVoice()
 *   speak("Your blood sugar is high", "ta-IN")
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export const LANGUAGES = [
  { code: 'en-IN', label: 'English',  flag: '🇬🇧', nativeName: 'English'  },
  { code: 'ta-IN', label: 'Tamil',    flag: '🇮🇳', nativeName: 'தமிழ்'   },
  { code: 'hi-IN', label: 'Hindi',    flag: '🇮🇳', nativeName: 'हिंदी'   },
]

// ── Translations for AI result fields ────────────────────────────
export const TRANSLATIONS = {
  'en-IN': {
    greeting:         (name) => `Hello ${name}. Here is your medical report summary.`,
    patient:          'Patient Information.',
    name:             'Name',
    age:              'Age',
    gender:           'Gender',
    diagnosis:        'Diagnosis',
    medicines:        'Medicines prescribed.',
    medicine_item:    (name, dose, freq) => `${name}, ${dose}, ${freq}.`,
    tests:            'Test results.',
    test_item:        (name, val, unit) => `${name}: ${val} ${unit}.`,
    followup:         (text) => `Follow up note: ${text}`,
    summary:          (text) => `Summary: ${text}`,
    closing:          'Please consult your doctor for more details. Thank you.',
    no_data:          'No medical data available to read.',
    high_result:      (name) => `Warning: ${name} is above normal range.`,
  },
  'ta-IN': {
    greeting:         (name) => `வணக்கம் ${name}. உங்கள் மருத்துவ அறிக்கை சுருக்கம் இதோ.`,
    patient:          'நோயாளி தகவல்.',
    name:             'பெயர்',
    age:              'வயது',
    gender:           'பாலினம்',
    diagnosis:        'நோய் கண்டறிதல்',
    medicines:        'பரிந்துரைக்கப்பட்ட மருந்துகள்.',
    medicine_item:    (name, dose, freq) => `${name}, ${dose}, ${freq}.`,
    tests:            'சோதனை முடிவுகள்.',
    test_item:        (name, val, unit) => `${name}: ${val} ${unit}.`,
    followup:         (text) => `மீண்டும் வர வேண்டிய குறிப்பு: ${text}`,
    summary:          (text) => `சுருக்கம்: ${text}`,
    closing:          'மேலும் விவரங்களுக்கு உங்கள் மருத்துவரை அணுகவும். நன்றி.',
    no_data:          'படிக்க மருத்துவ தரவு எதுவும் இல்லை.',
    high_result:      (name) => `எச்சரிக்கை: ${name} இயல்பான அளவை விட அதிகமாக உள்ளது.`,
  },
  'hi-IN': {
    greeting:         (name) => `नमस्ते ${name}। यह आपकी मेडिकल रिपोर्ट का सारांश है।`,
    patient:          'मरीज़ की जानकारी।',
    name:             'नाम',
    age:              'उम्र',
    gender:           'लिंग',
    diagnosis:        'निदान',
    medicines:        'निर्धारित दवाइयाँ।',
    medicine_item:    (name, dose, freq) => `${name}, ${dose}, ${freq}।`,
    tests:            'जाँच के परिणाम।',
    test_item:        (name, val, unit) => `${name}: ${val} ${unit}।`,
    followup:         (text) => `फॉलो-अप नोट: ${text}`,
    summary:          (text) => `सारांश: ${text}`,
    closing:          'अधिक जानकारी के लिए अपने डॉक्टर से मिलें। धन्यवाद।',
    no_data:          'पढ़ने के लिए कोई मेडिकल डेटा उपलब्ध नहीं है।',
    high_result:      (name) => `चेतावनी: ${name} सामान्य सीमा से अधिक है।`,
  },
}

// ── Build speech script from AI result ───────────────────────────
export function buildSpeechScript(result, patientName, langCode) {
  const t = TRANSLATIONS[langCode] || TRANSLATIONS['en-IN']
  if (!result) return t.no_data

  const parts = []

  // Greeting
  parts.push(t.greeting(patientName))

  // Patient info
  if (result.patient) {
    parts.push(t.patient)
    if (result.patient.name && result.patient.name !== 'Not found')
      parts.push(`${t.name}: ${result.patient.name}.`)
    if (result.patient.age && result.patient.age !== 'Not found')
      parts.push(`${t.age}: ${result.patient.age}.`)
    if (result.patient.gender && result.patient.gender !== 'Not found')
      parts.push(`${t.gender}: ${result.patient.gender}.`)
  }

  // Diagnosis
  const diagnoses = (result.diagnosis || []).filter(d => d && d !== 'See uploaded document')
  if (diagnoses.length > 0) {
    parts.push(t.diagnosis + ': ' + diagnoses.join(', ') + '.')
  }

  // Medicines
  const meds = (result.medicines || []).filter(m => m.name !== 'See document')
  if (meds.length > 0) {
    parts.push(t.medicines)
    meds.slice(0, 4).forEach(m => {
      parts.push(t.medicine_item(m.name, m.dosage || '', m.frequency || ''))
    })
  }

  // Tests — flag high results
  const tests = (result.tests || []).filter(ts => ts.name !== 'See document')
  if (tests.length > 0) {
    parts.push(t.tests)
    tests.slice(0, 4).forEach(ts => {
      parts.push(t.test_item(ts.name, ts.value || '', ts.unit || ''))
      if (ts.result && (ts.result.includes('High') || ts.result.includes('↑'))) {
        parts.push(t.high_result(ts.name))
      }
    })
  }

  // Follow-up
  if (result.follow_up && result.follow_up !== 'No specific follow-up mentioned') {
    parts.push(t.followup(result.follow_up))
  }

  // Summary
  if (result.summary) {
    parts.push(t.summary(result.summary))
  }

  parts.push(t.closing)
  return parts.join(' ')
}

// ── Hook ──────────────────────────────────────────────────────────
export function useVoice() {
  const [speaking, setSpeaking]   = useState(false)
  const [supported, setSupported] = useState(false)
  const [voices, setVoices]       = useState([])
  const uttRef                    = useRef(null)

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true)
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    return () => { window.speechSynthesis?.cancel() }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback((text, langCode = 'en-IN', rate = 0.9) => {
    if (!supported || !text) return
    window.speechSynthesis.cancel()

    const utter    = new SpeechSynthesisUtterance(text)
    utter.lang     = langCode
    utter.rate     = rate
    utter.pitch    = 1.0
    utter.volume   = 1.0

    // Try to find a matching voice
    const match = voices.find(v => v.lang === langCode)
      || voices.find(v => v.lang.startsWith(langCode.split('-')[0]))
      || voices[0]
    if (match) utter.voice = match

    utter.onstart = () => setSpeaking(true)
    utter.onend   = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)

    uttRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [supported, voices])

  return { speak, stop, speaking, supported, voices }
}
