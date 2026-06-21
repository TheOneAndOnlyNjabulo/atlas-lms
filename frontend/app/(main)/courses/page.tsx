'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Search, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { Course } from '@/types'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const accentColors = [
  { border: 'border-t-indigo-500', icon: 'bg-indigo-100 text-indigo-600' },
  { border: 'border-t-teal-500', icon: 'bg-teal-100 text-teal-600' },
  { border: 'border-t-amber-500', icon: 'bg-amber-100 text-amber-600' },
  { border: 'border-t-violet-500', icon: 'bg-violet-100 text-violet-600' },
  { border: 'border-t-rose-500', icon: 'bg-rose-100 text-rose-600' },
  { border: 'border-t-sky-500', icon: 'bg-sky-100 text-sky-600' },
]

export default function CoursesPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
    enabled: !!user,
  })

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.lecturerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search courses…"
            className="pl-9 bg-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <Search className="h-8 w-8 mb-3" />
          <p className="font-medium text-gray-500">No courses found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course, i) => {
            const accent = accentColors[i % accentColors.length]
            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className={cn(
                  'bg-white rounded-xl border border-gray-200 border-t-4 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group h-full flex flex-col',
                  accent.border
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="font-mono text-[11px]">{course.code}</Badge>
                    <span className="text-xs text-gray-400">{course.credits} cr</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5 flex-1" style={{ fontFamily: 'var(--font-syne)' }}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-600 truncate">{course.lecturerName || '—'}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <Users className="h-3 w-3" />{course.enrollmentCount}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
