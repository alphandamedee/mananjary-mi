import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, userType = null) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        user_type: userType,
      })

      const { access_token, user_data, user_type } = response.data

      // Store token and user data
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify({ ...user_data, user_type }))
      
      setUser({ ...user_data, user_type })

      return { success: true }
    } catch (error) {
      const errorMsg = error.response?.data?.detail;
      let errorText = 'Erreur de connexion';
      
      if (typeof errorMsg === 'string') {
        errorText = errorMsg;
      } else if (Array.isArray(errorMsg)) {
        errorText = errorMsg.map(e => e.msg || e).join(', ');
      }
      
      return {
        success: false,
        error: errorText,
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.detail;
      let errorText = 'Erreur d\'inscription';
      
      if (typeof errorMsg === 'string') {
        errorText = errorMsg;
      } else if (Array.isArray(errorMsg)) {
        errorText = errorMsg.map(e => e.msg || e).join(', ');
      }
      
      return {
        success: false,
        error: errorText,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
