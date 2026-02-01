import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { gsap } from 'gsap'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    specialization: ''
  })
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  const containerRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (user) {
      navigate('/')
      return
    }
  }, [user, navigate])

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.from(containerRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        })
      }

      if (formRef.current) {
        gsap.from(formRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out',
          clearProps: 'all'
        })
      }
    })

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender || undefined,
      specialization: formData.specialization || undefined
    }

    const result = await register(userData)

    if (result.success) {
      navigate('/')
    }

    setLoading(false)
  }

  return (
    <div ref={containerRef} className="min-h-[100dvh] flex items-center justify-center bg-surface-50 py-12 register-container">
      <div className="max-w-2xl w-full mx-4">
        <div ref={formRef} className="register-form bg-white rounded-2xl shadow-card p-10 border border-surface-100">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4 tracking-tight">ClinicApp</h1>
            <h2 className="text-3xl font-bold text-surface-900 mb-3">Create Account</h2>
            <p className="text-surface-500 text-base">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-surface-900 mb-3">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-surface-900 mb-3">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-surface-900 mb-3">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-surface-900 mb-3">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-field"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-surface-900 mb-3">
                Role *
              </label>
              <select
                id="role"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {formData.role === 'doctor' && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-semibold text-surface-900 mb-3">
                  Specialization
                </label>
                <input
                  id="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-surface-900 mb-3">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>

              {formData.role === 'patient' && (
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-semibold text-surface-900 mb-3">
                    Date of Birth
                  </label>
                  <input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}
            </div>

            {formData.role === 'patient' && (
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-surface-900 mb-3">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-surface-900 mb-3">
                Address
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field resize-none"
                rows="2"
                placeholder="Enter your address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-3.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-surface-600 text-base">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-2 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
