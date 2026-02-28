import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Users, IndianRupee } from 'lucide-react'
import BookingForm from './BookingForm'

export default function FleetGallery() {
    const [vehicles, setVehicles] = useState([])
    const [selectedVehicle, setSelectedVehicle] = useState(null)

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    useEffect(() => {
        axios.get(`${apiUrl}/api/vehicles`)
            .then(res => setVehicles(res.data))
            .catch(err => console.error(err))
    }, [apiUrl])

    return (
        <section id="fleet" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Premium Fleet</h2>
                    <p className="mt-4 text-xl text-gray-500">Choose the perfect vehicle for your journey</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {vehicles.map((vehicle, i) => (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="h-56 overflow-hidden">
                                <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
                                        <p className="text-sm font-medium text-primary-600 bg-blue-50 px-2 py-1 rounded w-fit mt-1">{vehicle.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold flex items-center text-gray-900">
                                            <IndianRupee className="w-5 h-5" />{vehicle.price}
                                        </p>
                                        <span className="text-sm text-gray-500">per day</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-600 mb-6">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-5 h-5" />
                                        <span>{vehicle.seats} Seats</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedVehicle(vehicle)}
                                    className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
                                >
                                    Book Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {selectedVehicle && (
                <BookingForm vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
            )}
        </section>
    )
}
