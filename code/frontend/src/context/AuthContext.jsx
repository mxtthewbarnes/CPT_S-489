import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { AuthContext } from './auth-context'

const STORAGE_KEY = 'campus_closet_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEY)))

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      if (!token) {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      try {
        const data = await apiRequest('/auth/me', { token })

        if (isMounted) {
          setUser(data.user)
          setLoading(false)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)

        if (isMounted) {
          setToken('')
          setUser(null)
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [token])

  function persistSession(session) {
    localStorage.setItem(STORAGE_KEY, session.token)
    setToken(session.token)
    setUser(session.user)
    setLoading(false)
    return session
  }

  async function login(credentials) {
    const session = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    })

    return persistSession(session)
  }

  async function register(payload) {
    const session = await apiRequest('/auth/register', {
      method: 'POST',
      body: payload,
    })

    return persistSession(session)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setUser(null)
    setLoading(false)
  }

  async function refreshUser() {
    if (!token) {
      return null
    }

    const data = await apiRequest('/auth/me', { token })
    setUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
