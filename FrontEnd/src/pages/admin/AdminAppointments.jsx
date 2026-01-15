import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import api from '../../services/api'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const containerRef = useRef(null)

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  useLayoutEffect(() => {
    let ctx;
    if (!loading && appointments.length > 0) {
      ctx = gsap.context(() => {
        gsap.from('.appointment-item', {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all'
        })
      }, containerRef)
    }
    return () => ctx?.revert()
  }, [loading, appointments.length])

  const fetchAppointments = async () => {
    try {
      const url = filter === 'all' ? '/admin/appointments' : `/admin/appointments?status=${filter}`
      const response = await api.get(url)
      setAppointments(response.data.appointments || [])
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return
    }

    try {
      await api.delete(`/appointments/${id}`)
      toast.success('Appointment deleted successfully')
      fetchAppointments()
    } catch (error) {
      toast.error('Failed to delete appointment')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">All Appointments</h1>
          <p className="text-surface-500 mt-1">Manage all appointments across the system.</p>
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
        <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50 text-xs uppercase tracking-wider text-surface-500 font-semibold">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-surface-50/50 transition-colors appointment-item group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-surface-900">{apt.patient_name}</p>
                      <p className="text-xs text-surface-500">Patient</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-surface-900">{apt.doctor_name}</p>
                      <p className="text-xs text-surface-500">Doctor</p>
                    </td>
                    <td className="px-6 py-4 text-surface-600 font-medium">
                      <div>{format(new Date(apt.appointment_date), 'MMM dd, yyyy')}</div>
                      <div className="text-sm text-surface-400">{apt.appointment_time}</div>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="text-surface-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Delete Appointment"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
