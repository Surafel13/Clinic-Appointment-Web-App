import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import api from '../../services/api'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function MedicalRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const containerRef = useRef(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  useLayoutEffect(() => {
    let ctx;
    if (!loading && records.length > 0) {
      ctx = gsap.context(() => {
        gsap.from('.record-item', {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'all'
        })
      }, containerRef)
    }
    return () => ctx?.revert()
  }, [loading, records])

  const fetchRecords = async () => {
    try {
      const response = await api.get('/patients/medical-records')
      setRecords(response.data.records || [])
    } catch (error) {
      toast.error('Failed to load medical records')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Medical Records</h1>
        <p className="text-surface-500 mt-1">View your history of diagnoses and prescriptions.</p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 bg-surface-50 rounded-2xl border border-dashed border-surface-200">
          <p className="text-surface-500 text-lg font-medium">No medical records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="record-item card hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 border-b border-surface-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg">
                    {record.doctor_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-surface-900">{record.doctor_name}</h3>
                    {record.specialization && (
                      <p className="text-surface-500 text-sm font-medium">{record.specialization}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-2 text-surface-500 bg-surface-50 px-3 py-1 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-medium">
                    {format(new Date(record.record_date), 'MMMM dd, yyyy')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {record.diagnosis && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-surface-900 uppercase tracking-wider mb-3">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                      Diagnosis
                    </h4>
                    <p className="text-surface-600 bg-amber-50/50 p-4 rounded-xl border border-amber-100">{record.diagnosis}</p>
                  </div>
                )}

                {record.prescription && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-surface-900 uppercase tracking-wider mb-3">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      Prescription
                    </h4>
                    <p className="text-surface-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 whitespace-pre-line">{record.prescription}</p>
                  </div>
                )}
              </div>

              {record.notes && (
                <div className="mt-8 pt-6 border-t border-surface-100">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-surface-900 uppercase tracking-wider mb-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Doctor's Notes
                  </h4>
                  <p className="text-surface-600 italic">{record.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
