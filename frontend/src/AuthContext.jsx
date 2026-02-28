import React, { createContext, useContext, useState } from 'react'
import { Navigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    // Simple auth state for demo purposes
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('zk_admin_auth') === 'true'
    })

    const login = (password) => {
        // Hardcoded password for this simple demo scenario
        if (password === 'admin123') {
            setIsAuthenticated(true)
            localStorage.setItem('zk_admin_auth', 'true')
            return true
        }
        return false
    }

    const logout = () => {
        setIsAuthenticated(false)
        localStorage.removeItem('zk_admin_auth')
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}

export function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    return children
}
