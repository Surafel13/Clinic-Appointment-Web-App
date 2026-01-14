import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function Layout() {
  const { user, loading } = useAuth()
  const contentRef = useRef(null)

  // State for mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (contentRef.current && !loading && user) {
      // Gentle entrance for content, avoid setting opacity to 0 to prevent "white screen" issues
      gsap.from(contentRef.current, {
        y: 10,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'all'
      })
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-surface-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <div className="text-surface-500 font-medium animate-pulse">Loading ClinicApp...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-[100dvh] bg-surface-50 overflow-hidden">
      {/* Sidebar - Fixed on desktop, drawer on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
