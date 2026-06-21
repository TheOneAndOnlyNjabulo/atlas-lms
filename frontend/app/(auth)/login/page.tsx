'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

const demoAccounts = [
  { label: 'Admin', email: 'admin@lms.com', password: 'Admin@123', color: 'bg-violet-500' },
  { label: 'Lecturer', email: 'lecturer@lms.com', password: 'Lecturer@123', color: 'bg-teal-500' },
  { label: 'Student', email: 'student@lms.com', password: 'Student@123', color: 'bg-indigo-500' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(acc: typeof demoAccounts[0]) {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#0e1117] p-12">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Atlas</span>
        </div>

        <div>
          <blockquote className="text-3xl font-bold text-white leading-snug mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            "Education is the<br />most powerful tool<br />you can use to change<br />the world."
          </blockquote>
          <p className="text-[#8b92a5] text-sm">— Nelson Mandela</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { n: '4', label: 'Courses' },
            { n: '6', label: 'Learners' },
            { n: '10', label: 'Assignments' },
          ].map(s => (
            <div key={s.label} className="bg-[#151c2c] rounded-xl p-4 border border-[#1e2330]">
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>{s.n}</p>
              <p className="text-xs text-[#8b92a5] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f4f5f7]">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-900 text-lg font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Atlas</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            New student?{' '}
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">Create an account</Link>
          </p>

          {/* Demo accounts */}
          <div className="border-t border-gray-200 pt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick demo access</p>
            <div className="space-y-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
                >
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full ${acc.color} text-white text-xs font-bold shrink-0`}>
                    {acc.label[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{acc.label}</p>
                    <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
