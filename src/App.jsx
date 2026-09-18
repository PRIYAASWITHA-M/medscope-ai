import { Routes, Route, Navigate } from 'react-router-dom'

// Patient Portal
import PatientLanding    from './pages/patient/PatientLanding.jsx'
import PatientLogin      from './pages/patient/PatientLogin.jsx'
import PatientRegister   from './pages/patient/PatientRegister.jsx'
import PatientDashboard  from './pages/patient/PatientDashboard.jsx'
import PatientAppointments from './pages/patient/PatientAppointments.jsx'
import PatientDocuments  from './pages/patient/PatientDocuments.jsx'

// Document Upload + AI (Member 2)
import UploadDocuments   from './pages/documents/UploadDocuments.jsx'
import AIResults         from './pages/documents/AIResults.jsx'

// Timeline
import MedicalTimeline   from './pages/timeline/MedicalTimeline.jsx'
import EventDetails      from './pages/timeline/EventDetails.jsx'
import MedicalGraph      from './pages/timeline/MedicalGraph.jsx'

// Doctor
import DoctorDashboard   from './pages/doctor/DoctorDashboard.jsx'

export default function App() {
  return (
    <Routes>
      {/* Root → patient landing */}
      <Route path="/" element={<Navigate to="/patient" replace />} />

      {/* Patient Portal */}
      <Route path="/patient"              element={<PatientLanding />} />
      <Route path="/patient/login"        element={<PatientLogin />} />
      <Route path="/patient/register"     element={<PatientRegister />} />
      <Route path="/patient/dashboard"    element={<PatientDashboard />} />
      <Route path="/patient/appointments" element={<PatientAppointments />} />
      <Route path="/patient/documents"    element={<PatientDocuments />} />

      {/* Document Upload + AI Results */}
      <Route path="/upload"    element={<UploadDocuments />} />
      <Route path="/ai-results" element={<AIResults />} />

      {/* Timeline */}
      <Route path="/timeline"       element={<MedicalTimeline />} />
      <Route path="/timeline/event" element={<EventDetails />} />
      <Route path="/timeline/graph" element={<MedicalGraph />} />

      {/* Doctor */}
      <Route path="/doctor" element={<DoctorDashboard />} />
    </Routes>
  )
}
