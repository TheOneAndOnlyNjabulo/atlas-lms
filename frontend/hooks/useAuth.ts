'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/types'
import { getUser, saveUser, clearUser } from '@/lib/auth'
import api from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setUser(getUser())
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthUser>('/auth/login', { email, password })
    saveUser(data)
    setUser(data)
    router.push('/dashboard')
  }, [router])

  const register = useCallback(async (firstName: string, lastName: string, email: string, password: string) => {
    const { data } = await api.post<AuthUser>('/auth/register', { firstName, lastName, email, password, role: 2 })
    saveUser(data)
    setUser(data)
    router.push('/dashboard')
  }, [router])

  const logout = useCallback(() => {
    clearUser()
    setUser(null)
    router.push('/login')
  }, [router])

  return { user, loading, login, register, logout }
}
