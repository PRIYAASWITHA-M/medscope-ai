/**
 * VoicePlayer — reusable component
 * Shows language selector + Play/Stop button
 * Uses Web Speech API via useVoice hook
 */

import { useState } from 'react'
import { useVoice, LANGUAGES, buildSpeechScript } from '../hooks/useVoice.js'

export default function VoicePlayer({ result, patientName = 'Patient', darkMode = true }) {
  const { speak, stop, speaking, supported } = useVoice()
  const [selectedLang, setSelectedLang]      = useState('en-IN')
  const [rate, setRate]                      = useState(0.9)

  if (!supported) return null

  function handlePlay() {
    if (speaking) { stop(); return }
    const script = buildSpeechScript(result, patientName, selectedLang)
    speak(script, selectedLang, rate)
  }

  const base = darkMode
    ? 'bg-slate-800/70 border-teal-500/20 text-slate-200'
    : 'bg-teal-50 border-teal-300 text-slate-700'

  const btnPlay = darkMode
    ? 'bg-teal-600 hover:bg-teal-500 text-white'
    : 'bg-teal-600 hover:bg-teal-500 text-white'

  const btnStop = 'bg-red-600 hover:bg-red-500 text-white'

  return (
    <div className={`border rounded-2xl p-4 ${base}`}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔊</span>
        <p className={`font-semibold text-sm ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
          AI Voice Summary
        </p>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'}`}>
          Browser TTS
        </span>
      </div>

      {/* Language selector */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => { setSelectedLang(lang.code); stop() }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              selectedLang === lang.code
                ? darkMode
                  ? 'bg-teal-600 border-teal-500 text-white'
                  : 'bg-teal-600 border-teal-600 text-white'
                : darkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-teal-500'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-teal-400'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            <span className={`${darkMode ? 'text-slate-500' : 'text-slate-400'} font-normal`}>
              {lang.nativeName}
            </span>
          </button>
        ))}
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Speed:</span>
        {[
          { label: 'Slow',   val: 0.7 },
          { label: 'Normal', val: 0.9 },
          { label: 'Fast',   val: 1.2 },
        ].map(s => (
          <button
            key={s.val}
            onClick={() => setRate(s.val)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition ${
              rate === s.val
                ? darkMode
                  ? 'bg-teal-700 border-teal-500 text-white'
                  : 'bg-teal-100 border-teal-400 text-teal-700'
                : darkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-400'
                  : 'bg-white border-slate-300 text-slate-500'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Play / Stop button */}
      <button
        onClick={handlePlay}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
          speaking ? btnStop : btnPlay
        }`}
      >
        {speaking ? (
          <>
            <span className="flex gap-0.5 items-end h-4">
              {[1,2,3,4].map(i => (
                <span
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </span>
            Stop Speaking
          </>
        ) : (
          <>
            <span>▶</span>
            Listen in {LANGUAGES.find(l => l.code === selectedLang)?.label}
          </>
        )}
      </button>

      {speaking && (
        <p className={`mt-2 text-xs text-center ${darkMode ? 'text-teal-400' : 'text-teal-600'} animate-pulse`}>
          🔊 Reading your medical report...
        </p>
      )}
    </div>
  )
}
