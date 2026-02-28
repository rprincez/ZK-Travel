import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-white/50 z-10" />
                <div className="absolute inset-y-0 right-1/2 w-[100vw] translate-x-1/2 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-60 mix-blend-multiply" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.h1
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Travel in Style with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">ZK Travels</span>
                </motion.h1>

                <motion.p
                    className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Experience luxury and reliability. We provide top-tier vehicles for any occasion with zero hassle.
                </motion.p>

                <motion.div
                    className="flex justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <a href="#fleet" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-full hover:bg-primary-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                        Book a Ride
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        </div>
    )
}
