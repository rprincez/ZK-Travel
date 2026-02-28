import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }) {
    const steps = ['Details', 'Verify Phone', 'Confirmed']
    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((label, i) => (
                <React.Fragment key={i}>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${i <= current ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < current ? 'bg-blue-600 text-white' : i === current ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            {i < current ? '✓' : i + 1}
                        </div>
                        <span className="hidden sm:inline">{label}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`flex-1 h-px max-w-8 ${i < current ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
            ))}
        </div>
    )
}

// ── OTP countdown timer ───────────────────────────────────────────────────────
function OtpTimer({ seconds, onExpire }) {
    const [remaining, setRemaining] = useState(seconds)
    useEffect(() => {
        if (remaining <= 0) { onExpire?.(); return }
        const t = setTimeout(() => setRemaining(r => r - 1), 1000)
        return () => clearTimeout(t)
    }, [remaining])
    const m = String(Math.floor(remaining / 60)).padStart(2, '0')
    const s = String(remaining % 60).padStart(2, '0')
    return (
        <span className={`flex items-center gap-1 text-xs ${remaining < 60 ? 'text-red-500' : 'text-gray-500'}`}>
            <Clock className="w-3 h-3" /> {m}:{s}
        </span>
    )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BookingForm({ vehicle, onClose }) {
    const [step, setStep] = useState(0)   // 0=details, 1=otp, 2=success
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', start_date: '', end_date: '' })
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [otpExpired, setOtpExpired] = useState(false)
    const otpRefs = useRef([])

    const calculateDays = () => {
        if (!formData.start_date || !formData.end_date) return 1
        const diff = Math.ceil(Math.abs(new Date(formData.end_date) - new Date(formData.start_date)) / 86400000)
        return diff || 1
    }
    const totalPrice = calculateDays() * vehicle.price

    // Focus first OTP box when entering step 1
    useEffect(() => {
        if (step === 1) setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }, [step])

    // ── Step 0 → send OTP ───────────────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            await axios.post(`${apiUrl}/api/otp/send`, { phone: formData.phone })
            setOtpExpired(false)
            setOtp(['', '', '', '', '', ''])
            setStep(1)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.')
        } finally { setLoading(false) }
    }

    // ── Step 1 → verify OTP ─────────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        const code = otp.join('')
        if (code.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return }
        setLoading(true); setError('')
        try {
            await axios.post(`${apiUrl}/api/otp/verify`, { phone: formData.phone, otp: code })
            // OTP verified → submit booking
            const res = await axios.post(`${apiUrl}/api/bookings`, {
                ...formData,
                vehicle_id: vehicle.id,
                total_price: totalPrice
            })
            if (res.status === 201) setStep(2)
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please check the OTP.')
        } finally { setLoading(false) }
    }

    // ── OTP digit input handler ──────────────────────────────────────────────────
    const handleOtpInput = (val, idx) => {
        const cleaned = val.replace(/\D/g, '').slice(-1)
        const next = [...otp]; next[idx] = cleaned; setOtp(next)
        if (cleaned && idx < 5) otpRefs.current[idx + 1]?.focus()
        setError('')
    }
    const handleOtpKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
        if (e.key === 'Enter') handleVerifyOtp()
    }

    const handleResend = async () => {
        setOtp(['', '', '', '', '', ''])
        setError('')
        setOtpExpired(false)
        await axios.post(`${apiUrl}/api/otp/send`, { phone: formData.phone })
        otpRefs.current[0]?.focus()
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Book {vehicle.name}</h3>
                            <p className="text-sm text-gray-500">₹{vehicle.price}/day &bull; {vehicle.seats} seats</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        <Steps current={step} />

                        {/* ── Step 0: Booking Details ──────────────────────────────────── */}
                        {step === 0 && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                {error && <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}</div>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input required type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input required type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input required type="tel" minLength={10} maxLength={15} className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10-digit number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input required type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input required type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-xl flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total ({calculateDays()} day{calculateDays() > 1 ? 's' : ''})</span>
                                    <span className="text-lg font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                                </div>

                                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP…</> : <><Phone className="w-4 h-4" /> Send OTP to Verify</>}
                                </button>
                            </form>
                        )}

                        {/* ── Step 1: OTP Verification ─────────────────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        We've sent a 6-digit OTP to <span className="font-semibold text-gray-900">+{formData.phone}</span>
                                    </p>
                                </div>

                                {error && <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}</div>}

                                {/* OTP digit boxes */}
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => otpRefs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            className="w-11 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={digit}
                                            onChange={e => handleOtpInput(e.target.value, i)}
                                            onKeyDown={e => handleOtpKeyDown(e, i)}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    {otpExpired ? (
                                        <span className="text-red-500 text-xs">OTP expired</span>
                                    ) : (
                                        <OtpTimer seconds={600} onExpire={() => setOtpExpired(true)} />
                                    )}
                                    <button type="button" onClick={handleResend} className="text-blue-600 hover:underline text-xs font-medium">
                                        Resend OTP
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => { setStep(0); setError('') }} className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                                        ← Back
                                    </button>
                                    <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length !== 6} className="flex-2 flex-grow py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</> : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Success ──────────────────────────────────────────── */}
                        {step === 2 && (
                            <div className="text-center py-6">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                </motion.div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h4>
                                <p className="text-gray-500 mb-1">Thank you, <span className="font-semibold">{formData.name}</span>!</p>
                                <p className="text-gray-400 text-sm">We'll contact you shortly at <span className="font-medium">{formData.phone}</span></p>
                                <button onClick={onClose} className="mt-6 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors">
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
