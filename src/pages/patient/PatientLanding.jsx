import { Link } from 'react-router-dom'

export default function PatientLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur border border-teal-500/20 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">

        {/* Logo */}
        <div className="mb-6">
          <span className="text-5xl">🩺</span>
        </div>

        <h1 className="text-4xl font-bold text-teal-400 tracking-wide mb-2">
          MEDSCOPE AI
        </h1>

        <h2 className="text-xl font-semibold text-slate-200 mb-3">
          Patient Portal
        </h2>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Securely manage your appointments and medical documents in one place.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/patient/login"
            className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/25"
          >
            Patient Login
          </Link>

          <Link
            to="/patient/register"
            className="w-full py-3 rounded-xl border border-teal-500/50 hover:border-teal-400 text-teal-400 hover:text-teal-300 font-semibold text-base transition-all duration-200"
          >
            New Patient Registration
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Are you a doctor?{' '}
          <Link to="/doctor" className="text-teal-400 hover:underline">
            Doctor Dashboard →
          </Link>
        </p>
      </div>
    </div>
  )
}
