import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { ArrowLeft, Car, Calendar, Plus, Trash2 } from 'lucide-react'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('bookings')
    const [bookings, setBookings] = useState([])
    const [vehicles, setVehicles] = useState([])

    const [newCar, setNewCar] = useState({ name: '', type: '', price: '', image: '', seats: '' })

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [b, v] = await Promise.all([
                axios.get(`${apiUrl}/api/bookings`),
                axios.get(`${apiUrl}/api/vehicles`)
            ])
            setBookings(b.data)
            setVehicles(v.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleAddCar = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${apiUrl}/api/vehicles`, {
                ...newCar,
                price: Number(newCar.price),
                seats: Number(newCar.seats)
            })
            setNewCar({ name: '', type: '', price: '', image: '', seats: '' })
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteCar = async (id) => {
        try {
            await axios.delete(`${apiUrl}/api/vehicles/${id}`)
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
                <div className="p-6">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight mb-8">Admin Panel</h2>

                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Calendar className="w-5 h-5" /> All Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('fleet')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'fleet' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Car className="w-5 h-5" /> Manage Fleet
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {activeTab === 'bookings' && (
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-8">Recent Bookings</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100/80">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Dates</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Vehicle ID</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {bookings.map(book => (
                                            <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-gray-500">#{book.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{book.name}</div>
                                                    <div className="text-sm text-gray-500">{book.email}</div>
                                                    <div className="text-sm text-gray-500">{book.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900">{book.start_date}</div>
                                                    <div className="text-sm text-gray-500">to {book.end_date}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{book.vehicle_id}</td>
                                                <td className="px-6 py-4 text-right font-medium text-green-600">₹{book.total_price}</td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No bookings yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fleet' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-bold text-gray-900">Manage Fleet</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    {vehicles.map(vehicle => (
                                        <div key={vehicle.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <img src={vehicle.image} alt="" className="w-20 h-20 object-cover rounded-lg" />
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{vehicle.name}</h4>
                                                    <span className="text-sm text-gray-500">{vehicle.type} · {vehicle.seats} Seats</span>
                                                    <div className="font-medium text-primary-600 mt-1">₹{vehicle.price}/day</div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteCar(vehicle.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-primary-600" /> Add New Car
                                        </h4>
                                        <form onSubmit={handleAddCar} className="space-y-4">
                                            <input required placeholder="Car Name" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} />
                                            <input required placeholder="Type (e.g. SUV, Sedan)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })} />
                                            <input required type="number" placeholder="Price per Day (₹)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={newCar.price} onChange={e => setNewCar({ ...newCar, price: e.target.value })} />
                                            <input required type="number" placeholder="Seats" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={newCar.seats} onChange={e => setNewCar({ ...newCar, seats: e.target.value })} />
                                            <input required placeholder="Image URL" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={newCar.image} onChange={e => setNewCar({ ...newCar, image: e.target.value })} />
                                            <button type="submit" className="w-full py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors">
                                                Add to Fleet
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
