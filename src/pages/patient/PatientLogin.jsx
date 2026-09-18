import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function PatientLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)
    // Simulate login — replace with real API call
    setTimeout(() => {
      setLoading(false)
      navigate('/patient/dashboard')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur border border-teal-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-1">MedScope AI</h1>
          <p className="text-slate-400 text-sm">Patient Login</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="patient@example.com"
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New patient?{' '}
          <Link to="/patient/register" className="text-teal-400 hover:underline font-medium">
            Register here
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-slate-500">
          <Link to="/patient" className="hover:text-slate-300 transition">
            ← Back to Portal
          </Link>
        </p>
      </div>
    </div>
  )
}
