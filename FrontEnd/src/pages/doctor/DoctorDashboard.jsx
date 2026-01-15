import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import api from '../../services/api'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null)
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const containerRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  useLayoutEffect(() => {
    let ctx;
    if (!loading && stats) {
      ctx = gsap.context(() => {
        gsap.from('.dashboard-card', {
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
  }, [loading, stats])

  const fetchData = async () => {
    try {
      const response = await api.get('/doctors/appointments')
      const appointments = response.data.appointments || []

      const pendingCount = appointments.filter(a => a.status === 'pending').length
      const approvedCount = appointments.filter(a => a.status === 'approved').length
      const completedCount = appointments.filter(a => a.status === 'completed').length

      setStats({
        pending: pendingCount,
        approved: approvedCount,
        completed: completedCount,
        total: appointments.length
      })

      setRecentAppointments(appointments.slice(0, 5))
    } catch (error) {
      toast.error('Failed to load dashboard data')
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
    <div ref={containerRef} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Doctor Dashboard</h1>
        <p className="text-surface-500 mt-1">Manage your appointments and patient schedule.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Appointments"
          value={stats?.total || 0}
          icon={<svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          color="bg-primary-50"
        />
        <StatsCard
          title="Pending Requests"
          value={stats?.pending || 0}
          icon={<svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="bg-amber-50"
        />
        <StatsCard
          title="Approved"
          value={stats?.approved || 0}
          icon={<svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="bg-emerald-50"
        />
        <StatsCard
          title="Completed"
          value={stats?.completed || 0}
          icon={<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          color="bg-blue-50"
        />
      </div>

      {/* Recent Appointments */}
      <div className="card overflow-hidden border border-surface-100 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-900">Upcoming Appointments</h2>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="text-center py-12 bg-surface-50 rounded-xl border border-dashed border-surface-200">
            <p className="text-surface-500 font-medium">No appointments scheduled</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-100 text-xs uppercase tracking-wider text-surface-500 font-semibold bg-surface-50/50">
                  <th className="px-6 py-4 rounded-tl-lg">Patient</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-tr-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-surface-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-600 font-bold shrink-0">
                          {apt.patient_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900">{apt.patient_name}</p>
                          <p className="text-xs text-surface-500">Patient ID: #{apt.patient_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-surface-900">{new Date(apt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-surface-500">{apt.appointment_time}</p>
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
                      <button className="text-surface-400 hover:text-primary-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, color }) {
  return (
    <div className="dashboard-card bg-white p-6 rounded-2xl shadow-sm border border-surface-100 hover:shadow-card transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <h3 className="text-3xl font-bold text-surface-900 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
