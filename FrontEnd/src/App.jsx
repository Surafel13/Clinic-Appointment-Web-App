import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PatientDashboard from './pages/patient/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import PatientAppointments from './pages/patient/PatientAppointments'
import MedicalRecords from './pages/patient/MedicalRecords'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorProfile from './pages/doctor/DoctorProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAppointments from './pages/admin/AdminAppointments'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          
          <Route element={<Layout />}>
            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}
            />
            <Route
              path="/patient/appointments"
              element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>}
            />
            <Route
              path="/patient/book-appointment"
              element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>}
            />
            <Route
              path="/patient/medical-records"
              element={<ProtectedRoute allowedRoles={['patient']}><MedicalRecords /></ProtectedRoute>}
            />
            
            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>}
            />
            <Route
              path="/doctor/appointments"
              element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>}
            />
            <Route
              path="/doctor/profile"
              element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>}
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/users"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>}
            />
            <Route
              path="/admin/appointments"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>}
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
