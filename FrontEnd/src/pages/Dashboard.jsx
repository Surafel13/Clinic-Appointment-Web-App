import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true })
      } else {
        // Redirect based on role
        if (user.role === 'patient') {
          navigate('/patient/dashboard', { replace: true })
        } else if (user.role === 'doctor') {
          navigate('/doctor/dashboard', { replace: true })
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true })
        }
      }
    }
  }, [user, loading, navigate])

  // Show loading while checking auth
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-surface-50 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <div className="text-surface-500 font-medium animate-pulse">Initializing...</div>
      </div>
    </div>
  )
}
