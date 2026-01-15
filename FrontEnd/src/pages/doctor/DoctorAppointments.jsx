import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  useEffect(() => {
    let ctx;
    if (!loading && appointments.length > 0) {
      ctx = gsap.context(() => {
        const items = document.querySelectorAll('.appointment-item')
        if (items.length > 0) {
          gsap.from(items, {
            opacity: 0,
            x: -20,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all'
          })
        }
      })
    }
    return () => ctx?.revert()
  }, [loading, appointments.length])

  const fetchAppointments = async () => {
    try {
      const url = filter === 'all' ? '/doctors/appointments' : `/doctors/appointments?status=${filter}`
      const response = await api.get(url)
      setAppointments(response.data.appointments || [])
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status })
      toast.success('Appointment status updated')
      fetchAppointments()
    } catch (error) {
      toast.error('Failed to update appointment')
    }
  }

  const handleCreateRecord = async (e) => {
    e.preventDefault()
    try {
      await api.post('/doctors/medical-records', {
        ...recordForm,
        patient_id: selectedAppointment.patient_id,
        appointment_id: selectedAppointment.id
      })
      toast.success('Medical record created successfully')
      setShowRecordModal(false)
      setSelectedAppointment(null)
      setRecordForm({
        diagnosis: '',
        prescription: '',
        notes: '',
        record_date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      toast.error('Failed to create medical record')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Appointments</h1>
          <p className="text-surface-500 mt-1">Manage patient visits and records.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-surface-50 rounded-2xl border border-dashed border-surface-200">
          <p className="text-surface-500 text-lg font-medium">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="appointment-item card hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                      {apt.patient_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-surface-900">{apt.patient_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${apt.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            apt.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-red-50 text-red-700 border-red-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${apt.status === 'approved' ? 'bg-emerald-500' :
                            apt.status === 'pending' ? 'bg-amber-500' :
                              apt.status === 'completed' ? 'bg-blue-500' :
                                'bg-red-500'
                            }`}></span>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-surface-600 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="font-medium text-surface-900">{format(new Date(apt.appointment_date), 'MMMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-medium text-surface-900">{apt.appointment_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span>{apt.patient_email}</span>
                    </div>
                  </div>

                  {apt.reason && (
                    <div className="mb-4 bg-surface-50 p-4 rounded-xl border border-surface-100">
                      <span className="font-semibold text-surface-900 block mb-1">Reason for Visit</span>
                      <p className="text-surface-600 text-sm">{apt.reason}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'approved')}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-sm py-2"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                        className="btn-secondary text-red-600 hover:bg-red-50 border-red-200 text-sm py-2"
                      >
                        Decline Request
                      </button>
                    </>
                  )}

                  {apt.status === 'approved' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        className="btn-secondary text-blue-600 hover:bg-blue-50 border-blue-200 text-sm py-2"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt)
                          setShowRecordModal(true)
                        }}
                        className="btn-primary text-sm py-2"
                      >
                        Add Medical Record
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medical Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-surface-900">Create Medical Record</h2>
              <button
                onClick={() => {
                  setShowRecordModal(false)
                  setSelectedAppointment(null)
                }}
                className="p-2 hover:bg-surface-100 rounded-full transition-colors text-surface-500 hover:text-surface-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  required
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Enter diagnosis"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">
                  Prescription
                </label>
                <textarea
                  value={recordForm.prescription}
                  onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Enter prescription details"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">
                  Record Date *
                </label>
                <input
                  type="date"
                  required
                  value={recordForm.record_date}
                  onChange={(e) => setRecordForm({ ...recordForm, record_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecordModal(false)
                    setSelectedAppointment(null)
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
