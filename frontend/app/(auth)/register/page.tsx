'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.firstName, form.lastName, form.email, form.password)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] px-6 py-12">
      <div className="w-full max-w-sm space-y-7">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-gray-900 text-lg font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Atlas</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Atlas as a student and start learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">First name</label>
              <Input placeholder="John" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Last name</label>
              <Input placeholder="Smith" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
