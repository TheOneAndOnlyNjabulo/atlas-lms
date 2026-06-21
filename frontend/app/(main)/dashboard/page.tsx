'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { BookOpen, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Course } from '@/types'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const courseAccentColors = [
  'border-l-indigo-500',
  'border-l-teal-500',
  'border-l-amber-500',
  'border-l-violet-500',
  'border-l-rose-500',
  'border-l-sky-500',
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
    enabled: !!user,
  })

  if (!user) return null

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const roleLabel = user.role === 2 ? 'enrolled courses' : user.role === 1 ? 'courses taught' : 'total courses'

  const stats = [
    { label: roleLabel, value: courses.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'total enrollments', value: courses.reduce((s, c) => s + c.enrollmentCount, 0), icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'active courses', value: courses.filter(c => c.isActive).length, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-0.5">{new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>
            {greeting()}, {user.fullName.split(' ')[0]}
          </h1>
        </div>
        <Link href="/courses">
          <Button variant="outline" size="sm" className="gap-1.5">
            Browse courses <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className={cn('rounded-xl p-3', s.bg)}>
              <s.icon className={cn('h-5 w-5', s.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>
            {user.role === 2 ? 'My Courses' : user.role === 1 ? 'Courses I Teach' : 'All Courses'}
          </h2>
          <Link href="/courses">
            <button className="text-xs text-indigo-600 hover:underline font-medium">View all</button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <BookOpen className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No courses yet</p>
            <Link href="/courses" className="mt-3">
              <Button size="sm" variant="subtle">Browse available courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {courses.map((course, i) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className={cn(
                  'bg-white rounded-xl border border-gray-200 border-l-4 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group',
                  courseAccentColors[i % courseAccentColors.length]
                )}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[11px]">{course.code}</Badge>
                      {!course.isActive && <Badge variant="warning">Inactive</Badge>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{course.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{course.lecturerName || 'No lecturer'}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="h-3 w-3" /> {course.enrollmentCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
