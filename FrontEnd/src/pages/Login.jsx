import { useState, useLayoutEffect, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const containerRef = useRef(null)
  const formRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  useLayoutEffect(() => {
    // GSAP Context to handle cleanup and React Strict Mode correctly
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

      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          delay: 0.3,
          ease: 'power2.out',
          clearProps: 'all'
        })
      }
    })

    // Clean up animations (reverting styles to original CSS state) when component unmounts
    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate('/')
    }

    setLoading(false)
  }

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full">
        <div
          ref={formRef}
          className="bg-white rounded-2xl shadow-card p-10 sm:p-12 border border-surface-100"
        >
          <div className="text-center mb-10">
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-6 tracking-tight"
            >
              ClinicApp
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-4">Welcome Back</h2>
            <p className="text-surface-500 text-lg">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-surface-900 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-surface-900 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-3.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-surface-100 pt-8">
            <p className="text-surface-600 text-base">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold hover:underline transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
