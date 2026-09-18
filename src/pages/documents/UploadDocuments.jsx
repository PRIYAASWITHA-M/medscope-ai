import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext.jsx'
import VoiceToText from '../../components/VoiceToText.jsx'
import { apiRequest } from '../../utils/api.js'

export default function UploadDocuments() {
  const navigate = useNavigate()
  const fileRef  = useRef(null)
  const { currentPatient, patients, setCurrentPatient, addDocument, setLastAIResult } = usePatient()

  const [file, setFile]         = useState(null)
  const [status, setStatus]     = useState('')
  const [message, setMessage]   = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)

  function handleFile(selected) {
    if (!selected) return
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setFile(null); setMessage('Please select a PDF file only.'); setStatus('error'); return
    }
    setFile(selected); setMessage(''); setStatus('')
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!file) { setMessage('Please select a medical document first.'); setStatus('error'); return }

    setStatus('uploading'); setProgress(10)
    setMessage('Uploading and processing document...')

    // Fake progress animation
    const progressInterval = setInterval(() => {
      setProgress(p => p < 85 ? p + 10 : p)
    }, 300)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('patient_id', currentPatient.id)

      const data = await apiRequest('/upload', { method: 'POST', body: formData })

      clearInterval(progressInterval); setProgress(100)

      if (data.success) {
        // Save to context
        addDocument(currentPatient.id, {
          filename:    data.filename,
          uploaded_at: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          result:      data.result,
        })
        setLastAIResult(data.result)
        setStatus('success')
        setMessage('Document processed successfully!')
        setTimeout(() => navigate('/ai-results', { state: { filename: data.filename, result: data.result } }), 800)
      } else {
        setStatus('error'); setMessage(data.message || 'Upload failed.')
      }

    } catch {
      // Backend not running — use demo mode
      clearInterval(progressInterval); setProgress(100)
      const demoResult = _buildDemoResult(file.name, currentPatient)
      addDocument(currentPatient.id, {
        filename:    file.name,
        uploaded_at: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        result:      demoResult,
      })
      setLastAIResult(demoResult)
      setStatus('success')
      setMessage('Document processed! (demo mode — backend not running)')
      setTimeout(() => navigate('/ai-results', { state: { filename: file.name, result: demoResult } }), 800)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07111f] via-[#102a43] to-[#0b3b4c] flex flex-col">

      <header className="text-center pt-10 pb-4 px-4">
        <h1 className="text-4xl font-bold text-teal-300 tracking-wide">MedScope AI</h1>
        <p className="text-slate-400 mt-2 text-sm">Medical Document Intelligence</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-10 pt-4">
        <div className="w-full max-w-xl bg-[#112538]/90 border border-teal-500/20 rounded-2xl shadow-2xl p-8">

          <h2 className="text-2xl font-semibold text-slate-100 mb-1 text-center">Upload Medical Document</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Upload reports, prescriptions or discharge summaries.</p>

          {/* Patient selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-teal-400 uppercase tracking-wide mb-2">
              📋 Uploading for Patient
            </label>
            <select
              value={currentPatient.id}
              onChange={e => setCurrentPatient(patients.find(p => p.id === e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-600 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-9 cursor-pointer transition-all duration-200 text-center ${
              dragOver ? 'border-teal-400 bg-teal-900/20' : 'border-teal-600/50 bg-[#051625]/60 hover:border-teal-400 hover:bg-[#0d3047]/60'
            }`}
          >
            <div className="text-5xl mb-4">{file ? '✅' : '📄'}</div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">
              {file ? file.name : 'Select Medical Document'}
            </h3>
            <p className="text-slate-500 text-sm">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Drag & drop or click to browse'}</p>
            {!file && <p className="text-xs text-slate-600 mt-2">PDF only · Max 16 MB</p>}
          </div>

          <input ref={fileRef} type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])} className="hidden" />

          {/* Progress bar */}
          {status === 'uploading' && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-600 hover:to-teal-400 text-white font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {status === 'uploading' ? 'Processing...' : '⬆ Upload & Analyze with AI'}
          </button>

          {/* Status */}
          {message && (
            <p className={`mt-4 text-sm font-semibold text-center ${
              status === 'error' ? 'text-red-400' : status === 'success' ? 'text-teal-400' : 'text-slate-400'
            }`}>{message}</p>
          )}

          <div className="mt-5 flex justify-center gap-4 text-xs text-slate-500">
            <Link to="/patient/dashboard" className="hover:text-teal-400 transition">← Dashboard</Link>
            <span>·</span>
            <Link to="/ai-results" className="hover:text-teal-400 transition">View Last Results →</Link>
          </div>

          {/* Voice-to-text for symptoms */}
          <div className="mt-6">
            <p className="text-xs text-slate-500 text-center mb-3 font-medium uppercase tracking-wide">
              🎤 Or describe your symptoms by voice
            </p>
            <VoiceToText
              darkMode={true}
              placeholder="Speak your symptoms — e.g. 'I have fever and headache for 2 days'"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Demo result when backend is offline ──────────────────────────
function _buildDemoResult(filename, patient) {
  return {
    patient:   { name: patient.name, id: patient.id, dob: patient.dob, age: patient.age, gender: patient.gender },
    events:    [{ date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), event: 'Medical Document Upload', clinical: 'Document uploaded and processed in demo mode.' }],
    medicines: [{ name: 'See uploaded document', dosage: 'As prescribed', frequency: 'As directed', source: filename }],
    tests:     [{ name: 'See uploaded document', date: 'See report', value: '—', unit: '', reference: '—', result: 'See report' }],
    diagnosis: ['See uploaded document for diagnosis'],
    follow_up: 'Consult your doctor for follow-up instructions.',
    summary:   `Document "${filename}" uploaded for ${patient.name}. Backend processing not available (demo mode). Please run the Flask server for real AI extraction.`,
    _source:   'demo',
  }
}
