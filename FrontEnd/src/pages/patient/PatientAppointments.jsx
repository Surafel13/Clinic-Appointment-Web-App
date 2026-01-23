import { useState, useEffect } from 'react'
import api from '../../services/api'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (!loading && appointments.length > 0) {
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
      }
    })
    return () => ctx.revert()
  }, [loading, appointments.length])

  const fetchAppointments = async () => {
    try {
      const url = filter === 'all' ? '/appointments' : `/appointments?status=${filter}`
      const response = await api.get(url)
      setAppointments(response.data.appointments || [])
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      await api.put(`/appointments/${id}`, { status: 'cancelled' })
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (error) {
      toast.error('Failed to cancel appointment')
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
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">My Appointments</h1>
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
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-surface-900">{apt.doctor_name}</h3>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-surface-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="font-medium text-surface-900">{format(new Date(apt.appointment_date), 'MMMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-medium text-surface-900">{apt.appointment_time}</span>
                    </div>
                    {apt.specialization && (
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span>{apt.specialization}</span>
                      </div>
                    )}
                  </div>

                  {apt.reason && (
                    <div className="mt-4 p-4 bg-surface-50 rounded-xl border border-surface-100">
                      <span className="text-sm font-semibold text-surface-900 block mb-1">Reason for Visit</span>
                      <p className="text-surface-600 text-sm">{apt.reason}</p>
                    </div>
                  )}
                </div>

                {apt.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="mt-4 md:mt-0 px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
