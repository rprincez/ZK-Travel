import React from 'react'
import { Link } from 'react-router-dom'
import { Car, Menu } from 'lucide-react'

export default function Navbar() {
    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-500 transition-colors">
                            <Car className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors">
                            ZK Travels
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 font-medium">
                        <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">Home</Link>
                        <a href="#fleet" className="text-gray-600 hover:text-primary-600 transition-colors">Our Fleet</a>
                        <Link to="/admin" className="px-4 py-2 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200">
                            Admin
                        </Link>
                    </div>

                    <button className="md:hidden p-2 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </nav>
    )
}
