import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { demoAuth, setAuthToken } from '../api'

const TOKEN_KEY = 'wavefront_token'

interface AuthContextValue {
  ready: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextValue>({ ready: false, token: null })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [token, setTok] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let t = localStorage.getItem(TOKEN_KEY)
      if (!t) {
        const d = await demoAuth()
        t = d.token
        localStorage.setItem(TOKEN_KEY, t)
      }
      if (cancelled) return
      setAuthToken(t)
      setTok(t)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return <AuthContext.Provider value={{ ready, token }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
