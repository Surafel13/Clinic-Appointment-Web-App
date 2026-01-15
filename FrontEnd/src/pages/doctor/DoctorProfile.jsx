import { useState, useEffect } from 'react'
import api from '../../services/api'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    address: '',
    license_number: '',
    experience_years: '',
    bio: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (!loading) {
        const form = document.querySelector('.profile-form')
        if (form) {
          gsap.from(form, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all'
          })
        }
      }
    })
    return () => ctx.revert()
  }, [loading])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/doctors/profile')
      const data = response.data
      setProfile(data)
      setFormData({
        name: data.user?.name || '',
        email: data.user?.email || '',
        specialization: data.profile?.specialization || '',
        phone: data.profile?.phone || '',
        address: data.profile?.address || '',
        license_number: data.profile?.license_number || '',
        experience_years: data.profile?.experience_years || '',
        bio: data.profile?.bio || ''
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put('/doctors/profile', formData)
      toast.success('Profile updated successfully')
      fetchProfile()
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Doctor Profile</h1>
        <p className="text-surface-500 mt-1">Manage your professional information.</p>
      </div>

      <div className="card profile-form shadow-card hover:shadow-xl transition-all duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="input-field"
                placeholder="e.g., Cardiology, Pediatrics"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                License Number
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field resize-none"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field resize-none"
              rows="4"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary py-3.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
