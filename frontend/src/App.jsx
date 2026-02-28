import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FleetGallery from './components/FleetGallery'
import AdminDashboard from './components/AdminDashboard'

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
