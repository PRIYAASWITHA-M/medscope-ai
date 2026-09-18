import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function PatientRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/patient/login')
    }, 1200)
  }

  const fields = [
    { label: 'Full Name *', name: 'fullName', type: 'text', placeholder: 'Arun Kumar' },
    { label: 'Email Address *', name: 'email', type: 'email', placeholder: 'arun@example.com' },
    { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
    { label: 'Date of Birth', name: 'dob', type: 'date', placeholder: '' },
    { label: 'Password *', name: 'password', type: 'password', placeholder: '••••••••' },
    { label: 'Confirm Password *', name: 'confirmPassword', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur border border-teal-500/20 rounded-2xl p-8 max-w-lg w-full shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-1">MedScope AI</h1>
          <p className="text-slate-400 text-sm">New Patient Registration</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.name} className={f.name === 'fullName' || f.name === 'email' ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/patient/login" className="text-teal-400 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
