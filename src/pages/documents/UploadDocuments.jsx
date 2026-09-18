import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function UploadDocuments() {
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [file, setFile]       = useState(null)
  const [status, setStatus]   = useState('')   // 'uploading' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // ── File selection ──────────────────────────────────────────────
  function handleFile(selected) {
    if (!selected) return
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setFile(null)
      setMessage('Please select a PDF file only.')
      setStatus('error')
      return
    }
    setFile(selected)
    setMessage('')
    setStatus('')
  }

  function handleInputChange(e) {
    handleFile(e.target.files[0])
  }

  // ── Drag & Drop ─────────────────────────────────────────────────
  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Upload ──────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file) {
      setMessage('Please select a medical document first.')
      setStatus('error')
      return
    }
    setStatus('uploading')
    setMessage('Uploading and processing document...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setMessage('Document processed successfully!')
        // Pass filename to AI results via state
        setTimeout(() => navigate('/ai-results', { state: { filename: file.name, result: data.result } }), 900)
      } else {
        setStatus('error')
        setMessage(data.message || 'Upload failed. Please try again.')
      }
    } catch {
      // Backend not running — simulate for demo
      setStatus('success')
      setMessage('Document processed successfully! (demo mode)')
      setTimeout(() => navigate('/ai-results', { state: { filename: file.name } }), 900)
    }
  }

  // ── UI ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07111f] via-[#102a43] to-[#0b3b4c] flex flex-col">

      {/* Header */}
      <header className="text-center pt-10 pb-4 px-4">
        <h1 className="text-4xl font-bold text-teal-300 tracking-wide">MedScope AI</h1>
        <p className="text-slate-400 mt-2 text-sm">Medical Document Intelligence</p>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-start justify-center px-4 pb-10 pt-4">
        <div className="w-full max-w-xl bg-[#112538]/90 border border-teal-500/20 rounded-2xl shadow-2xl p-8 text-center">

          <h2 className="text-2xl font-semibold text-slate-100 mb-2">Upload Medical Documents</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-7">
            Upload your previous medical reports, prescriptions and discharge summaries.
          </p>

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-9 cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-teal-400 bg-teal-900/20'
                : 'border-teal-600/50 bg-[#051625]/60 hover:border-teal-400 hover:bg-[#0d3047]/60'
            }`}
          >
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Select Your Medical Document</h3>
            <p className="text-slate-500 text-sm mb-5">Drag & drop here, or click to browse</p>
            <p className="text-xs text-slate-600">Supported format: PDF only</p>
          </div>

          {/* Hidden input */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* File name */}
          {file ? (
            <p className="mt-4 text-teal-400 font-semibold text-sm break-all">
              ✓ Selected: {file.name}
            </p>
          ) : (
            <p className="mt-4 text-slate-500 text-sm">No file selected</p>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {status === 'uploading' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing...
              </span>
            ) : 'Upload Document'}
          </button>

          {/* Status message */}
          {message && (
            <p className={`mt-4 text-sm font-semibold ${
              status === 'error'   ? 'text-red-400' :
              status === 'success' ? 'text-teal-400' : 'text-slate-400'
            }`}>
              {message}
            </p>
          )}

          <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
            <Link to="/patient/dashboard" className="hover:text-teal-400 transition">← Dashboard</Link>
            <span>|</span>
            <Link to="/ai-results" className="hover:text-teal-400 transition">View AI Results →</Link>
          </div>

        </div>
      </main>
    </div>
  )
}
