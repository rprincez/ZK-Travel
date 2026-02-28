import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, Calendar, Plus, Trash2, Upload, Image, LogOut } from 'lucide-react'
import { useAuth } from '../AuthContext'

function ImageUploader({ currentImage, onImageChange }) {
    const fileRef = useRef()
    const [preview, setPreview] = useState(currentImage || '')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    const handleFile = async (file) => {
        if (!file) return
        setUploading(true)
        const formData = new FormData()
        formData.append('image', file)
        try {
            const res = await axios.post(`${apiUrl}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setPreview(res.data.url)
            onImageChange(res.data.url)
        } catch (err) {
            alert('Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const onDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        handleFile(file)
    }

    return (
        <div className="mb-2">
            <div
                className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer ${dragOver ? 'border-primary-500 bg-blue-50' : 'border-gray-300 hover:border-primary-400 bg-gray-50'}`}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                style={{ minHeight: 120 }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-36 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-sm font-medium flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Change Image
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-gray-400">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                        ) : (
                            <>
                                <Image className="w-8 h-8 mb-2" />
                                <span className="text-sm">Click or drag & drop image</span>
                                <span className="text-xs mt-1">PNG, JPG, WEBP (max 16MB)</span>
                            </>
                        )}
                    </div>
                )}
                {uploading && preview && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                )}
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFile(e.target.files?.[0])}
            />
        </div>
    )
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('fleet')
    const [bookings, setBookings] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [newCar, setNewCar] = useState({ name: '', type: '', price: '', image: '', seats: '' })
    const { logout } = useAuth()
    const navigate = useNavigate()

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [b, v] = await Promise.all([
                axios.get(`${apiUrl}/api/bookings`),
                axios.get(`${apiUrl}/api/vehicles`)
            ])
            setBookings(b.data)
            setVehicles(v.data)
        } catch (err) { console.error(err) }
    }

    const handleAddCar = async (e) => {
        e.preventDefault()
        if (!newCar.image) { alert('Please upload or select an image first.'); return }
        try {
            await axios.post(`${apiUrl}/api/vehicles`, {
                ...newCar,
                price: Number(newCar.price),
                seats: Number(newCar.seats)
            })
            setNewCar({ name: '', type: '', price: '', image: '', seats: '' })
            fetchData()
        } catch (err) { console.error(err) }
    }

    const handleChangeImage = async (vehicleId, imageUrl) => {
        try {
            await axios.put(`${apiUrl}/api/vehicles/${vehicleId}`, { image: imageUrl })
            fetchData()
        } catch (err) { console.error(err) }
    }

    const handleDeleteCar = async (id) => {
        if (!confirm('Delete this vehicle?')) return
        try {
            await axios.delete(`${apiUrl}/api/vehicles/${id}`)
            fetchData()
        } catch (err) { console.error(err) }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-col hidden md:flex">
                <div className="p-6 flex flex-col h-full">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight mb-8">Admin Panel</h2>
                    <nav className="space-y-2 flex-1">
                        <button
                            onClick={() => setActiveTab('fleet')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'fleet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Car className="w-5 h-5" /> Manage Fleet
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Calendar className="w-5 h-5" /> All Bookings
                        </button>
                    </nav>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm mt-4">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">

                    {/* ── FLEET TAB ── */}
                    {activeTab === 'fleet' && (
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-8">Manage Fleet</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Vehicle list */}
                                <div className="lg:col-span-2 space-y-4">
                                    {vehicles.map(vehicle => (
                                        <VehicleCard
                                            key={vehicle.id}
                                            vehicle={vehicle}
                                            apiUrl={apiUrl}
                                            onDelete={handleDeleteCar}
                                            onImageChange={handleChangeImage}
                                        />
                                    ))}
                                    {vehicles.length === 0 && (
                                        <div className="text-center py-16 text-gray-400">No vehicles yet. Add one!</div>
                                    )}
                                </div>

                                {/* Add car form */}
                                <div>
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-blue-600" /> Add New Car
                                        </h4>
                                        <form onSubmit={handleAddCar} className="space-y-3">
                                            <ImageUploader
                                                currentImage={newCar.image}
                                                onImageChange={(url) => setNewCar({ ...newCar, image: url })}
                                            />
                                            <input required placeholder="Car Name" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newCar.name} onChange={e => setNewCar({ ...newCar, name: e.target.value })} />
                                            <input required placeholder="Type (SUV, Sedan…)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newCar.type} onChange={e => setNewCar({ ...newCar, type: e.target.value })} />
                                            <input required type="number" placeholder="Price / Day (₹)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newCar.price} onChange={e => setNewCar({ ...newCar, price: e.target.value })} />
                                            <input required type="number" placeholder="Seats" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newCar.seats} onChange={e => setNewCar({ ...newCar, seats: e.target.value })} />
                                            <button type="submit" className="w-full py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
                                                Add to Fleet
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BOOKINGS TAB ── */}
                    {activeTab === 'bookings' && (
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-8">Recent Bookings</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Dates</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600">Vehicle</th>
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
                                                <td className="px-6 py-4 text-gray-700">#{book.vehicle_id}</td>
                                                <td className="px-6 py-4 text-right font-medium text-green-600">₹{book.total_price}</td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No bookings yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

/* Sub-component: single vehicle card with inline image change */
function VehicleCard({ vehicle, apiUrl, onDelete, onImageChange }) {
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef()

    const handleFile = async (file) => {
        if (!file) return
        setUploading(true)
        const formData = new FormData()
        formData.append('image', file)
        try {
            const res = await axios.post(`${apiUrl}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            onImageChange(vehicle.id, res.data.url)
        } catch (err) {
            alert('Upload failed.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-4">
                {/* Clickable image to change photo */}
                <div
                    className="relative w-24 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => fileRef.current.click()}
                    title="Click to change image"
                >
                    <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        {uploading
                            ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            : <><Upload className="w-4 h-4 text-white" /><span className="text-white text-[10px] mt-1">Change</span></>
                        }
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">{vehicle.name}</h4>
                    <span className="text-sm text-gray-500">{vehicle.type} · {vehicle.seats} Seats</span>
                    <div className="font-medium text-blue-600 mt-1">₹{vehicle.price}/day</div>
                </div>
            </div>
            <button
                onClick={() => onDelete(vehicle.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    )
}
