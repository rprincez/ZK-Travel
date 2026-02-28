import React, { createContext, useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

const AuthContext = createContext()

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('zk_admin_token') || null)
    const [username, setUsername] = useState(() => localStorage.getItem('zk_admin_user') || null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isChecking, setIsChecking] = useState(true)   // verifying token with backend

    // On mount (or token change), verify the token with the backend
    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setIsAuthenticated(false)
                setIsChecking(false)
                return
            }
            try {
                const res = await axios.get(`${apiUrl}/api/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.data.valid) {
                    setIsAuthenticated(true)
                    setUsername(res.data.username)
                } else {
                    clearAuth()
                }
            } catch {
                clearAuth()
            } finally {
                setIsChecking(false)
            }
        }
        verify()
    }, [token])

    const clearAuth = () => {
        setIsAuthenticated(false)
        setToken(null)
        setUsername(null)
        localStorage.removeItem('zk_admin_token')
        localStorage.removeItem('zk_admin_user')
    }

    /**
     * login(username, password) → { success: true } | { success: false, error: string }
     */
    const login = async (usernameInput, password) => {
        try {
            const res = await axios.post(`${apiUrl}/api/auth/login`, {
                username: usernameInput,
                password
            })
            const { token: newToken, username: user } = res.data
            localStorage.setItem('zk_admin_token', newToken)
            localStorage.setItem('zk_admin_user', user)
            setToken(newToken)
            setUsername(user)
            setIsAuthenticated(true)
            return { success: true }
        } catch (err) {
            const msg = err.response?.data?.error || 'Login failed. Please try again.'
            return { success: false, error: msg }
        }
    }

    /**
     * changePassword(newUsername, newPassword) → { success, error? }
     */
    const changePassword = async (newUsername, newPassword) => {
        try {
            await axios.post(
                `${apiUrl}/api/auth/change-password`,
                { new_username: newUsername, new_password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return { success: true }
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Update failed.' }
        }
    }

    const logout = () => clearAuth()

    return (
        <AuthContext.Provider value={{ isAuthenticated, isChecking, username, token, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}

export function ProtectedRoute({ children }) {
    const { isAuthenticated, isChecking } = useAuth()

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        )
    }

    return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}
