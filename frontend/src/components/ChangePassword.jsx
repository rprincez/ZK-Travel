import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function ChangePassword() {
    const { changePassword, logout } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ new_username: '', new_password: '', confirm: '' })
    const [status, setStatus] = useState(null)   // null | 'loading' | 'success' | {error}
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.new_password !== form.confirm) {
            setError('Passwords do not match.')
            return
        }
        setStatus('loading')
        const result = await changePassword(form.new_username, form.new_password)
        if (result.success) {
            setStatus('success')
            setTimeout(() => { logout(); navigate('/admin/login') }, 2000)
        } else {
            setError(result.error)
            setStatus(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
            >
                <div className="bg-gray-900 px-8 py-6 flex items-center gap-4">
                    <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-blue-400" /> Change Credentials
                        </h2>
                        <p className="text-gray-400 text-sm">Update your admin username &amp; password</p>
                    </div>
                </div>

                <div className="px-8 py-8">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">Credentials Updated!</h3>
                            <p className="text-gray-500 mt-2 text-sm">Signing you out to re-login with your new credentials…</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm border border-red-100">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Username <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="admin"
                                    value={form.new_username}
                                    onChange={e => { setForm({ ...form, new_username: e.target.value }); setError('') }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={6}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="At least 6 characters"
                                    value={form.new_password}
                                    onChange={e => { setForm({ ...form, new_password: e.target.value }); setError('') }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Repeat new password"
                                    value={form.confirm}
                                    onChange={e => { setForm({ ...form, confirm: e.target.value }); setError('') }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 mt-2"
                            >
                                {status === 'loading'
                                    ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</span>
                                    : 'Save Changes'
                                }
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
