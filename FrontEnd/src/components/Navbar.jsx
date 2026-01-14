import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navbarRef = useRef(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (navbarRef.current) {
        gsap.from(navbarRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all'
        })
      }
    })
    return () => ctx.revert()
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav ref={navbarRef} className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-200 h-16 transition-all duration-300">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumbs or simple title can go here if needed, for now keeping it clean */}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-surface-100 transition-colors border border-transparent hover:border-surface-200"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-surface-900 leading-tight">{user.name}</p>
                  <p className="text-xs text-surface-500 font-medium">{user.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center shadow-md ring-2 ring-white">
                  <span className="text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-card border border-surface-100 py-2 z-50 transform origin-top-right transition-all">
                    <div className="px-4 py-3 border-b border-surface-100 sm:hidden">
                      <p className="text-sm font-semibold text-surface-900">{user.name}</p>
                      <p className="text-xs text-surface-500">{user.role}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
