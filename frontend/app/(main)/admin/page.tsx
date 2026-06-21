'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Users, BookOpen, Plus, X, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { Course, ROLE_LABELS, UserRole } from '@/types'
import api from '@/lib/api'

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [showForm, setShowForm] = useState(false)
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: '1' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && user.role !== 0) router.replace('/dashboard')
  }, [user, router])

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
    enabled: user?.role === 0,
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setUserForm(f => ({ ...f, [field]: e.target.value }))

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/users', { ...userForm, role: Number(userForm.role) })
      setSuccess(`${data.fullName} created as ${ROLE_LABELS[data.role as UserRole]}`)
      setUserForm({ firstName: '', lastName: '', email: '', password: '', role: '1' })
      setShowForm(false)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user || user.role !== 0) return null

  const stats = [
    { label: 'Courses', value: courses.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total enrollments', value: courses.reduce((s, c) => s + c.enrollmentCount, 0), icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform management and configuration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className={`rounded-xl p-3 ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User management */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-syne)' }}>User Management</h2>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}>
            {showForm ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Plus className="h-3.5 w-3.5" /> Create user</>}
          </Button>
        </div>

        {success && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreateUser} className="p-5 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-4" style={{ fontFamily: 'var(--font-syne)' }}>New user details</p>
            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">First name</label>
                <Input className="bg-white" placeholder="Jane" value={userForm.firstName} onChange={set('firstName')} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Last name</label>
                <Input className="bg-white" placeholder="Doe" value={userForm.lastName} onChange={set('lastName')} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Email</label>
                <Input className="bg-white" type="email" placeholder="jane@lms.com" value={userForm.email} onChange={set('email')} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <Input className="bg-white" type="password" placeholder="Min 6 characters" value={userForm.password} onChange={set('password')} required minLength={6} />
              </div>
            </div>
            <div className="space-y-1 mb-4 max-w-xs">
              <label className="text-xs font-medium text-gray-600">Role</label>
              <select value={userForm.role} onChange={set('role')} className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="1">Lecturer</option>
                <option value="0">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Creating…' : 'Create user'}</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>

      {/* Course overview table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-syne)' }}>Course Overview</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Course', 'Code', 'Lecturer', 'Students', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[200px] truncate">{c.title}</td>
                <td className="px-5 py-3.5"><Badge variant="secondary" className="font-mono">{c.code}</Badge></td>
                <td className="px-5 py-3.5 text-gray-500">{c.lecturerName || '—'}</td>
                <td className="px-5 py-3.5 text-gray-700 font-medium">{c.enrollmentCount}</td>
                <td className="px-5 py-3.5">
                  {c.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="warning">Inactive</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
