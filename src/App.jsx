import { Routes, Route, Navigate } from 'react-router-dom'
import { usePatient } from './context/PatientContext.jsx'

// Patient Portal
import PatientLanding    from './pages/patient/PatientLanding.jsx'
import PatientLogin      from './pages/patient/PatientLogin.jsx'
import PatientRegister   from './pages/patient/PatientRegister.jsx'
import PatientDashboard  from './pages/patient/PatientDashboard.jsx'
import PatientAppointments from './pages/patient/PatientAppointments.jsx'
import PatientDocuments  from './pages/patient/PatientDocuments.jsx'
import HealthInsights    from './pages/patient/HealthInsights.jsx'

// Document Upload + AI (Member 2)
import UploadDocuments   from './pages/documents/UploadDocuments.jsx'
import AIResults         from './pages/documents/AIResults.jsx'

// Timeline
import MedicalTimeline   from './pages/timeline/MedicalTimeline.jsx'
import EventDetails      from './pages/timeline/EventDetails.jsx'
import MedicalGraph      from './pages/timeline/MedicalGraph.jsx'

// Doctor
import DoctorDashboard   from './pages/doctor/DoctorDashboard.jsx'

function ProtectedRoute({ children }) {
  const { currentPatient, authLoading } = usePatient()
  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading your medical workspace...</div>
  return currentPatient ? children : <Navigate to="/patient/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/patient" replace />} />

      {/* Patient Portal */}
      <Route path="/patient"              element={<PatientLanding />} />
      <Route path="/patient/login"        element={<PatientLogin />} />
      <Route path="/patient/register"     element={<PatientRegister />} />
      <Route path="/patient/dashboard"    element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/documents"    element={<ProtectedRoute><PatientDocuments /></ProtectedRoute>} />
      <Route path="/patient/insights"     element={<ProtectedRoute><HealthInsights /></ProtectedRoute>} />

      {/* Document Upload + AI Results */}
      <Route path="/upload"     element={<ProtectedRoute><UploadDocuments /></ProtectedRoute>} />
      <Route path="/ai-results" element={<ProtectedRoute><AIResults /></ProtectedRoute>} />

      {/* Timeline */}
      <Route path="/timeline"       element={<ProtectedRoute><MedicalTimeline /></ProtectedRoute>} />
      <Route path="/timeline/event" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
      <Route path="/timeline/graph" element={<ProtectedRoute><MedicalGraph /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor" element={<DoctorDashboard />} />
    </Routes>
  )
}
