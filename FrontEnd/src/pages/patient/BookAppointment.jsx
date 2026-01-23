import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const formContainerRef = useRef(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the form if it exists
      const form = document.querySelector('.book-form')
      if (form) {
        gsap.from(form, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all'
        })
      }
    }, formContainerRef)
    return () => ctx.revert()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors/all')
      setDoctors(response.data.doctors || [])
    } catch (error) {
      toast.error('Failed to load doctors')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/appointments', formData)
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={formContainerRef} className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Book Appointment</h1>
        <p className="text-surface-500 mt-2">Schedule a visit with one of our specialists.</p>
      </div>

      <div className="card book-form shadow-card hover:shadow-xl transition-shadow duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Select Doctor *
            </label>
            <select
              required
              value={formData.doctor_id}
              onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
              className="input-field"
            >
              <option value="">Choose a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Appointment Time *
              </label>
              <input
                type="time"
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field resize-none"
              rows="4"
              placeholder="Describe your symptoms or reason for visit..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}
