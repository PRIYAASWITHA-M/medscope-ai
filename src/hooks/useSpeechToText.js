/**
 * useSpeechToText — Voice to Text hook using Web Speech API
 *
 * Browser-native, zero API key needed.
 * Supports continuous listening + interim results.
 *
 * Usage:
 *   const { transcript, listening, start, stop, reset, supported } = useSpeechToText('ta-IN')
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export const STT_LANGUAGES = [
  { code: 'en-IN', label: 'English',  flag: '🇬🇧', placeholder: 'Speak in English...'         },
  { code: 'ta-IN', label: 'Tamil',    flag: '🇮🇳', placeholder: 'தமிழில் பேசுங்கள்...'         },
  { code: 'hi-IN', label: 'Hindi',    flag: '🇮🇳', placeholder: 'हिंदी में बोलें...'            },
]

export function useSpeechToText(initialLang = 'en-IN') {
  const [transcript, setTranscript] = useState('')
  const [interim,    setInterim]    = useState('')
  const [listening,  setListening]  = useState(false)
  const [lang,       setLang]       = useState(initialLang)
  const [error,      setError]      = useState('')
  const [supported,  setSupported]  = useState(false)
  const recogRef = useRef(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Speech recognition not supported in this browser. Use Chrome.'); return }

    if (recogRef.current) recogRef.current.abort()

    const recog           = new SR()
    recog.lang            = lang
    recog.continuous      = true
    recog.interimResults  = true
    recog.maxAlternatives = 1

    recog.onstart  = () => { setListening(true); setError('') }
    recog.onend    = () => { setListening(false); setInterim('') }
    recog.onerror  = (e) => {
      setListening(false)
      setError(e.error === 'no-speech' ? 'No speech detected. Try again.' : `Error: ${e.error}`)
    }

    recog.onresult = (e) => {
      let final = ''
      let inter = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript
        if (e.results[i].isFinal) final += text + ' '
        else inter += text
      }
      if (final) setTranscript(prev => prev + final)
      setInterim(inter)
    }

    recogRef.current = recog
    recog.start()
  }, [lang])

  const stop = useCallback(() => {
    recogRef.current?.stop()
    setListening(false)
  }, [])

  const reset = useCallback(() => {
    recogRef.current?.abort()
    setTranscript('')
    setInterim('')
    setListening(false)
    setError('')
  }, [])

  // Restart with new lang
  const changeLang = useCallback((newLang) => {
    recogRef.current?.abort()
    setLang(newLang)
    setListening(false)
  }, [])

  return { transcript, interim, listening, lang, changeLang, start, stop, reset, error, supported }
}
