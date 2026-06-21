import { AuthUser } from '@/types'

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function saveUser(user: AuthUser) {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('token', user.token)
}

export function clearUser() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

export function isAdmin(user: AuthUser | null) { return user?.role === 0 }
export function isLecturer(user: AuthUser | null) { return user?.role === 1 }
export function isStudent(user: AuthUser | null) { return user?.role === 2 }
