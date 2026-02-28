import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, AlertCircle, Car } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function AdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const result = await login(username, password)
        if (result.success) {
            navigate('/admin')
        } else {
            setError(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo badge */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-full shadow-lg shadow-blue-500/30">
                        <Car className="w-5 h-5 text-white" />
                        <span className="text-white font-bold text-lg">ZK Travels</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-900 px-8 py-6 text-center">
                        <div className="w-14 h-14 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-7 h-7 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Admin Sign In</h2>
                        <p className="text-gray-400 text-sm mt-1">Enter your credentials to access the dashboard</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-8">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm border border-red-100"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        autoComplete="username"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="admin"
                                        value={username}
                                        onChange={e => { setUsername(e.target.value); setError('') }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError('') }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying…
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-400">
                            Return to <a href="/" className="text-blue-600 hover:underline font-medium">ZK Travels</a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
