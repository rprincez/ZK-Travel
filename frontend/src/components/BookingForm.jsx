import React, { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function BookingForm({ vehicle, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        start_date: '',
        end_date: ''
    })
    const [status, setStatus] = useState(null)

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    const calculateDays = () => {
        if (!formData.start_date || !formData.end_date) return 0;
        const start = new Date(formData.start_date)
        const end = new Date(formData.end_date)
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 1
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        try {
            const days = calculateDays()
            const total_price = days * vehicle.price

            await axios.post(`${apiUrl}/api/bookings`, {
                ...formData,
                vehicle_id: vehicle.id,
                total_price
            })
            setStatus('success')
            setTimeout(onClose, 2000)
        } catch (err) {
            console.error(err)
            setStatus('error')
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900">Book {vehicle.name}</h3>
                        <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {status === 'success' ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h4>
                                <p className="text-gray-600">We'll be in touch shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input required type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input required type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input required type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input required type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl mt-6 border border-gray-200">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total Estimate:</span>
                                        <span>₹{calculateDays() * vehicle.price}</span>
                                    </div>
                                </div>

                                <button type="submit" disabled={status === 'loading'} className="w-full py-4 mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                                    {status === 'loading' ? 'Processing...' : 'Confirm Booking'}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
