/**
 * PatientContext — global state for:
 *  - current logged-in patient
 *  - all uploaded documents (per patient)
 *  - timeline events (auto-built from uploads)
 *  - appointments
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../utils/api.js'

const PatientContext = createContext(null)

// ── 5 demo patients ───────────────────────────────────────────────
const INITIAL_PATIENTS = [
  { id: 'MS-1001', name: 'Arun Kumar',  age: '26', gender: 'Male',   dob: '12 Mar 2000', phone: '+91 98765 00001', bloodGroup: 'O+' },
  { id: 'MS-1002', name: 'Priya S',     age: '31', gender: 'Female', dob: '05 Jun 1995', phone: '+91 98765 00002', bloodGroup: 'A+' },
  { id: 'MS-1003', name: 'Sindhu A',    age: '36', gender: 'Female', dob: '22 Jan 1990', phone: '+91 98765 00003', bloodGroup: 'B+' },
  { id: 'MS-1004', name: 'Ramesh V',    age: '41', gender: 'Male',   dob: '11 Aug 1985', phone: '+91 98765 00004', bloodGroup: 'AB+' },
  { id: 'MS-1005', name: 'Kavitha R',   age: '27', gender: 'Female', dob: '30 Dec 1998', phone: '+91 98765 00005', bloodGroup: 'O-' },
]

// ── Demo documents pre-loaded for Arun (MS-1001) ─────────────────
const DEMO_DOCS = {
  'MS-1001': [
    {
      filename:    'Fever_Consultation_Jan.pdf',
      uploaded_at: '10 Jan 2026',
      result: {
        patient:   { name: 'Arun Kumar', id: 'MS-1001', dob: '12 Mar 2000', age: '26', gender: 'Male' },
        events:    [{ date: '10 Jan 2026', event: 'Fever Consultation', clinical: 'Patient presented with high fever (102°F) and body ache.' }],
        medicines: [{ name: 'Paracetamol 650mg', dosage: '650mg', frequency: 'Twice daily', source: 'Fever_Consultation_Jan.pdf' }],
        tests:     [{ name: 'CBC', date: '10 Jan 2026', value: 'Normal', unit: '', reference: 'Normal', result: 'Within range' }],
        diagnosis: ['Viral Fever'],
        follow_up: 'Review after 3 days if fever persists',
        summary:   'Patient visited for fever. Viral fever diagnosed. Paracetamol prescribed.',
      },
    },
    {
      filename:    'Blood_Test_Report_Jan.pdf',
      uploaded_at: '15 Jan 2026',
      result: {
        patient:   { name: 'Arun Kumar', id: 'MS-1001', dob: '12 Mar 2000', age: '26', gender: 'Male' },
        events:    [{ date: '15 Jan 2026', event: 'Blood Test Investigation', clinical: 'Routine blood work ordered after fever consultation.' }],
        medicines: [],
        tests:     [
          { name: 'Haemoglobin', date: '15 Jan 2026', value: '13.2', unit: 'g/dL', reference: '13-17', result: 'Normal' },
          { name: 'Blood Sugar (RBS)', date: '15 Jan 2026', value: '186', unit: 'mg/dL', reference: '70-140', result: 'High ↑' },
          { name: 'WBC Count', date: '15 Jan 2026', value: '8200', unit: '/cmm', reference: '4000-11000', result: 'Normal' },
        ],
        diagnosis: ['Elevated blood sugar — further evaluation needed'],
        follow_up: 'Fasting blood sugar test recommended',
        summary:   'Blood test shows elevated RBS at 186 mg/dL. Further evaluation for diabetes recommended.',
      },
    },
    {
      filename:    'Diabetes_Diagnosis_Mar.pdf',
      uploaded_at: '01 Mar 2026',
      result: {
        patient:   { name: 'Arun Kumar', id: 'MS-1001', dob: '12 Mar 2000', age: '26', gender: 'Male' },
        events:    [{ date: '01 Mar 2026', event: 'Diabetes Diagnosis', clinical: 'HbA1c 8.2% — Type 2 Diabetes confirmed.' }],
        medicines: [
          { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily with meals', source: 'Diabetes_Diagnosis_Mar.pdf' },
          { name: 'Glipizide 5mg',   dosage: '5mg',   frequency: 'Once daily morning',     source: 'Diabetes_Diagnosis_Mar.pdf' },
        ],
        tests:     [
          { name: 'HbA1c',        date: '01 Mar 2026', value: '8.2', unit: '%',     reference: '<6.5', result: 'High ↑' },
          { name: 'Fasting Sugar', date: '01 Mar 2026', value: '142', unit: 'mg/dL', reference: '70-100', result: 'High ↑' },
        ],
        diagnosis: ['Type 2 Diabetes Mellitus'],
        follow_up: 'Review after 3 months with HbA1c and kidney function tests',
        summary:   'Type 2 Diabetes confirmed. Metformin and Glipizide prescribed. 3-month follow-up needed.',
      },
    },
    {
      filename:    'Kidney_Checkup_Aug.pdf',
      uploaded_at: '20 Aug 2026',
      result: {
        patient:   { name: 'Arun Kumar', id: 'MS-1001', dob: '12 Mar 2000', age: '26', gender: 'Male' },
        events:    [{ date: '20 Aug 2026', event: 'Kidney Function Checkup', clinical: 'Routine monitoring for diabetic nephropathy.' }],
        medicines: [{ name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily', source: 'Kidney_Checkup_Aug.pdf' }],
        tests:     [
          { name: 'Creatinine',   date: '20 Aug 2026', value: '1.1', unit: 'mg/dL', reference: '0.7-1.3', result: 'Normal' },
          { name: 'Urea',         date: '20 Aug 2026', value: '28',  unit: 'mg/dL', reference: '10-40',   result: 'Normal' },
          { name: 'Uric Acid',    date: '20 Aug 2026', value: '5.8', unit: 'mg/dL', reference: '3.5-7.2', result: 'Normal' },
        ],
        diagnosis: ['Kidney function — stable'],
        follow_up: 'Continue current medications. Next review in 6 months.',
        summary:   'Kidney function tests normal. Diabetes management ongoing. Continue Metformin.',
      },
    },
  ],
  'MS-1002': [
    {
      filename:    'Cardiology_Checkup.pdf',
      uploaded_at: '05 Jul 2026',
      result: {
        patient:   { name: 'Priya S', id: 'MS-1002', dob: '05 Jun 1995', age: '31', gender: 'Female' },
        events:    [{ date: '05 Jul 2026', event: 'Cardiology Consultation', clinical: 'Palpitations and mild chest discomfort reported.' }],
        medicines: [{ name: 'Atenolol 25mg', dosage: '25mg', frequency: 'Once daily', source: 'Cardiology_Checkup.pdf' }],
        tests:     [
          { name: 'ECG',       date: '05 Jul 2026', value: 'Normal Sinus Rhythm', unit: '', reference: 'Normal', result: 'Normal' },
          { name: 'Echo',      date: '05 Jul 2026', value: 'EF 62%',              unit: '', reference: '>55%',   result: 'Normal' },
        ],
        diagnosis: ['Mild Sinus Tachycardia'],
        follow_up: 'Follow-up after 2 months with 24-hour Holter monitor',
        summary:   'Cardiology review done. ECG normal. Atenolol started for mild tachycardia.',
      },
    },
  ],
}

// ── Demo appointments ─────────────────────────────────────────────
const DEMO_APPOINTMENTS = [
  { id: 1, patient_id: 'MS-1001', doctor: 'Dr. Kumar',  date: '25 Sep 2026', time: '10:30 AM', reason: 'Diabetes follow-up',     status: 'Confirmed' },
  { id: 2, patient_id: 'MS-1001', doctor: 'Dr. Priya',  date: '30 Sep 2026', time: '11:00 AM', reason: 'Kidney function review',  status: 'Confirmed' },
  { id: 3, patient_id: 'MS-1002', doctor: 'Dr. Ramesh', date: '28 Sep 2026', time: '09:00 AM', reason: 'Holter monitor review',   status: 'Pending'   },
]

export function PatientProvider({ children }) {
  const [currentPatient, setCurrentPatient] = useState(null)
  const [patients]                          = useState(INITIAL_PATIENTS)
  const [documents, setDocuments]           = useState(DEMO_DOCS)
  const [appointments, setAppointments]     = useState(DEMO_APPOINTMENTS)
  const [lastAIResult, setLastAIResult]     = useState(null)
  const [authLoading, setAuthLoading]       = useState(true)
  const [authError, setAuthError]           = useState('')

  useEffect(() => {
    const token = localStorage.getItem('medscope_token')
    if (!token) {
      setAuthLoading(false)
      return
    }

    apiRequest('/auth/me')
      .then(data => setCurrentPatient(data.patient))
      .catch(() => localStorage.removeItem('medscope_token'))
      .finally(() => setAuthLoading(false))
  }, [])

  useEffect(() => {
    if (!currentPatient) return

    apiRequest(`/appointments/${currentPatient.id}`)
      .then(data => setAppointments(data.appointments))
      .catch(error => setAuthError(error.message))
  }, [currentPatient])

  async function login(email, password) {
    setAuthError('')
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('medscope_token', data.token)
    setCurrentPatient(data.patient)
    return data.patient
  }

  async function register(form) {
    setAuthError('')
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        patient_id: form.patientId,
      }),
    })
    localStorage.setItem('medscope_token', data.token)
    setCurrentPatient(data.patient)
    return data.patient
  }

  function logout() {
    localStorage.removeItem('medscope_token')
    setCurrentPatient(null)
  }

  // Get docs for current patient
  function getPatientDocs(patientId) {
    return documents[patientId] || []
  }

  // Add new uploaded document result
  function addDocument(patientId, docRecord) {
    setDocuments(prev => ({
      ...prev,
      [patientId]: [...(prev[patientId] || []), docRecord],
    }))
  }

  // Build timeline from all docs for a patient
  function getTimeline(patientId) {
    const docs = documents[patientId] || []
    const timeline = []

    docs.forEach(doc => {
      const r = doc.result || {}

      ;(r.events || []).forEach(ev => {
        timeline.push({
          date:     ev.date || doc.uploaded_at,
          title:    ev.event,
          type:     'Event',
          clinical: ev.clinical,
          source:   doc.filename,
          icon:     '🩺',
        })
      })

      ;(r.diagnosis || []).forEach(d => {
        if (d && d !== 'See uploaded document') {
          timeline.push({
            date:     doc.uploaded_at,
            title:    `Diagnosis: ${d}`,
            type:     'Diagnosis',
            clinical: '',
            source:   doc.filename,
            icon:     '🏥',
          })
        }
      })

      const meds = (r.medicines || []).filter(m => m.name !== 'See document')
      if (meds.length > 0) {
        timeline.push({
          date:     doc.uploaded_at,
          title:    `Prescribed: ${meds.slice(0,2).map(m => m.name).join(', ')}`,
          type:     'Medicine',
          clinical: r.follow_up || '',
          source:   doc.filename,
          icon:     '💊',
        })
      }
    })

    return timeline
  }

  // Book appointment
  async function bookAppointment(apptData) {
    const data = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(apptData),
    })
    setAppointments(prev => [...prev, data.appointment])
    return data.appointment
  }

  // Cancel appointment
  async function cancelAppointment(apptId) {
    await apiRequest(`/appointments/${apptId}/cancel`, { method: 'PATCH' })
    setAppointments(prev => prev.map(a =>
      a.id === apptId ? { ...a, status: 'Cancelled' } : a
    ))
  }

  function getAppointments(patientId) {
    return appointments.filter(a => a.patient_id === patientId)
  }

  return (
    <PatientContext.Provider value={{
      currentPatient, setCurrentPatient, authLoading, authError,
      login, register, logout,
      patients,
      getPatientDocs, addDocument,
      getTimeline,
      lastAIResult, setLastAIResult,
      bookAppointment, cancelAppointment, getAppointments,
    }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const ctx = useContext(PatientContext)
  if (!ctx) throw new Error('usePatient must be used inside PatientProvider')
  return ctx
}
