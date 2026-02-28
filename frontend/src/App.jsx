import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FleetGallery from './components/FleetGallery'
import AdminDashboard from './components/AdminDashboard'
import AdminLogin from './components/AdminLogin'
import ChangePassword from './components/ChangePassword'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FleetGallery />
      </main>
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <p>&copy; {new Date().getFullYear()} ZK Travels. All rights reserved.</p>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
