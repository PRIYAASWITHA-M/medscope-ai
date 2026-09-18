/**
 * VoiceToText — Patient speaks, text appears
 *
 * Features:
 *  - EN / Tamil / Hindi language selector
 *  - Live interim transcript (grey) + confirmed text (white)
 *  - Copy to clipboard
 *  - Clear button
 *  - Animated mic pulse while listening
 */

import { useState } from 'react'
import { useSpeechToText, STT_LANGUAGES } from '../hooks/useSpeechToText.js'

export default function VoiceToText({ onTranscript, darkMode = true, placeholder = 'Your voice will appear here...' }) {
  const { transcript, interim, listening, lang, changeLang, start, stop, reset, error, supported } = useSpeechToText('en-IN')
  const [copied, setCopied]     = useState(false)

  const fullText = transcript + (interim ? interim : '')

  function handleToggle() {
    listening ? stop() : start()
  }

  function handleCopy() {
    if (!transcript) return
    navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (onTranscript) onTranscript(transcript)
  }

  function handleClear() {
    reset()
    setCopied(false)
  }

  if (!supported) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
        ⚠️ Voice input not supported. Please use <strong>Google Chrome</strong> browser.
      </div>
    )
  }

  const base = darkMode
    ? 'bg-slate-800/70 border-slate-700/50 text-slate-200'
    : 'bg-white border-slate-200 text-slate-800'

  return (
    <div className={`rounded-2xl border p-5 ${base}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎤</span>
          <p className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Voice to Text
          </p>
          {listening && (
            <span className="flex gap-0.5 items-end h-4 ml-1">
              {[1,2,3,4,3,2].map((h, i) => (
                <span key={i} className="w-0.5 bg-red-400 rounded-full animate-pulse"
                  style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </span>
          )}
        </div>
        {transcript && (
          <div className="flex gap-2">
            <button onClick={handleCopy}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                copied
                  ? 'bg-teal-600 text-white'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button onClick={handleClear}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                darkMode ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}>
              🗑 Clear
            </button>
          </div>
        )}
      </div>

      {/* Language selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STT_LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => changeLang(l.code)}
            disabled={listening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition disabled:opacity-50 ${
              lang === l.code
                ? 'bg-teal-600 border-teal-500 text-white'
                : darkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-teal-500'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-teal-400'
            }`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* Text display area */}
      <div className={`min-h-28 rounded-xl p-4 mb-4 text-sm leading-relaxed relative ${
        darkMode ? 'bg-slate-900/60 border border-slate-700/50' : 'bg-slate-50 border border-slate-200'
      }`}>
        {!transcript && !interim ? (
          <p className={`${darkMode ? 'text-slate-600' : 'text-slate-400'} select-none`}>
            {listening
              ? (STT_LANGUAGES.find(l => l.code === lang)?.placeholder || 'Listening...')
              : placeholder}
          </p>
        ) : (
          <>
            <span className={darkMode ? 'text-slate-100' : 'text-slate-800'}>{transcript}</span>
            {interim && <span className={`${darkMode ? 'text-slate-500' : 'text-slate-400'} italic`}>{interim}</span>}
          </>
        )}

        {/* Live indicator */}
        {listening && (
          <span className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs text-red-400 font-medium">Live</span>
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">
          <span>⚠️</span>{error}
        </p>
      )}

      {/* Mic button */}
      <button
        onClick={handleToggle}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
          listening
            ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30'
            : 'bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white shadow-lg shadow-teal-900/20'
        }`}
      >
        {listening ? (
          <>
            <span className="w-4 h-4 rounded-sm bg-white/80 animate-pulse" />
            Stop Recording
          </>
        ) : (
          <>
            <span className="text-lg">🎤</span>
            Start Speaking
          </>
        )}
      </button>

      {/* Word count */}
      {transcript && (
        <p className={`mt-2 text-xs text-center ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
          {transcript.trim().split(/\s+/).filter(Boolean).length} words · {transcript.length} characters
        </p>
      )}
    </div>
  )
}
