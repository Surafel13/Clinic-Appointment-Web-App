import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const location = useLocation()
  const sidebarRef = useRef(null)

  // Ref for efficient GSAP selection
  const linksRef = useRef([])

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (sidebarRef.current && user) {
        // Simple entrance animation for sidebar content
        gsap.fromTo(sidebarRef.current.children,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.2,
            clearProps: 'all'
          }
        )
      }
    }, sidebarRef)
    return () => ctx.revert()
  }, [user])

  const patientLinks = [
    {
      path: '/patient/dashboard', label: 'Dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
      )
    },
    {
      path: '/patient/book-appointment', label: 'Book Appointment', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      )
    },
    {
      path: '/patient/appointments', label: 'My Appointments', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      )
    },
    {
      path: '/patient/medical-records', label: 'Medical Records', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      )
    },
  ]

  const doctorLinks = [
    {
      path: '/doctor/dashboard', label: 'Dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
      )
    },
    {
      path: '/doctor/appointments', label: 'Appointments', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
    {
      path: '/doctor/profile', label: 'Profile', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      )
    },
  ]

  const adminLinks = [
    {
      path: '/admin/dashboard', label: 'Dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      )
    },
    {
      path: '/admin/users', label: 'Users', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      )
    },
    {
      path: '/admin/appointments', label: 'Appointments', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      )
    },
  ]

  const links = user?.role === 'patient' ? patientLinks :
    user?.role === 'doctor' ? doctorLinks :
      user?.role === 'admin' ? adminLinks : []

  if (!user) return null

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-surface-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div ref={sidebarRef} className="h-full flex flex-col">
          <div className="h-16 flex items-center px-8 border-b border-surface-100">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">
              ClinicApp
            </h1>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
            <div className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Menu
            </div>
            {links.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => window.innerWidth < 1024 && onClose && onClose()}
                  className={`group flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    }`}
                >
                  <span className={`transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'}`}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-surface-100">
            <div className="bg-surface-50 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-surface-900 truncate">{user.name}</p>
                <p className="text-xs text-surface-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}
    </>
  )
}
