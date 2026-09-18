import { Link } from 'react-router-dom'
import PatientNav from '../../components/PatientNav.jsx'

const documents = [
  { name: 'Blood_Test_Report.pdf',  date: '15 Aug 2026', size: '1.2 MB', status: 'Processed' },
  { name: 'Prescription_Aug.pdf',   date: '10 Aug 2026', size: '320 KB', status: 'Processed' },
  { name: 'Discharge_Summary.pdf',  date: '01 Mar 2026', size: '2.4 MB', status: 'Processed' },
  { name: 'Xray_Report_Jan.pdf',    date: '15 Jan 2026', size: '5.1 MB', status: 'Processed' },
  { name: 'Fever_Consultation.pdf', date: '10 Jan 2026', size: '450 KB', status: 'Processed' },
]

export default function PatientDocuments() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PatientNav />

      <main className="max-w-4xl mx-auto px-6 py-8">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Documents</h2>
            <p className="text-slate-500 text-sm mt-1">All your uploaded medical documents.</p>
          </div>
          <Link
            to="/upload"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition"
          >
            + Upload Document
          </Link>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Document</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Uploaded</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Size</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(d => (
                <tr key={d.name} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <span className="font-medium text-slate-700">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{d.date}</td>
                  <td className="px-5 py-4 text-slate-500">{d.size}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                      ✓ {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to="/ai-results"
                      className="text-teal-600 hover:underline font-medium text-xs"
                    >
                      View AI Results →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
