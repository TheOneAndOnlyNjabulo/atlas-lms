'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronRight, Megaphone, BookOpen, ClipboardList, Users, Calendar, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Course, Module, Assignment, Announcement, Enrollment } from '@/types'
import api from '@/lib/api'
import { formatDate, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 'modules' | 'announcements' | 'students'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('modules')
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)

  const { data: course } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data),
  })

  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ['modules', id],
    queryFn: () => api.get(`/courses/${id}/modules`).then(r => r.data),
  })

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ['assignments-all', id, modules.map(m => m.id).join()],
    queryFn: async () => {
      const all = await Promise.all(modules.map(m => api.get(`/modules/${m.id}/assignments`).then(r => r.data)))
      return all.flat()
    },
    enabled: modules.length > 0,
  })

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['announcements', id],
    queryFn: () => api.get(`/courses/${id}/announcements`).then(r => r.data),
    enabled: tab === 'announcements',
  })

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ['enrollments', id],
    queryFn: () => api.get(`/enrollments/course/${id}`).then(r => r.data),
    enabled: tab === 'students' && (user?.role === 0 || user?.role === 1),
  })

  async function handleEnroll() {
    setEnrolling(true)
    try {
      await api.post(`/enrollments/course/${id}`)
      qc.invalidateQueries({ queryKey: ['courses'] })
      qc.invalidateQueries({ queryKey: ['course', id] })
    } catch { } finally { setEnrolling(false) }
  }

  const assignmentsByModule = (moduleId: string) => assignments.filter(a => a.moduleId === moduleId)

  const tabs: { key: Tab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'modules', label: 'Modules', icon: <BookOpen className="h-3.5 w-3.5" />, show: true },
    { key: 'announcements', label: 'Announcements', icon: <Megaphone className="h-3.5 w-3.5" />, show: true },
    { key: 'students', label: 'Students', icon: <Users className="h-3.5 w-3.5" />, show: user?.role !== 2 },
  ]

  return (
    <div className="p-8 max-w-4xl space-y-6">
      {/* Back */}
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
      </Link>

      {/* Course hero */}
      {course && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="default" className="font-mono">{course.code}</Badge>
                <Badge variant="secondary">{course.credits} credits</Badge>
                {!course.isActive && <Badge variant="warning">Inactive</Badge>}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-syne)' }}>{course.title}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">{course.description}</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-xs font-bold">
                  {course.lecturerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'L'}
                </div>
                <span className="text-sm text-gray-600 font-medium">{course.lecturerName || 'No lecturer'}</span>
              </div>
            </div>
            {user?.role === 2 && (
              <Button onClick={handleEnroll} disabled={enrolling} className="shrink-0">
                {enrolling ? 'Enrolling…' : 'Enrol in course'}
              </Button>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: 'Modules', value: modules.length, icon: BookOpen },
              { label: 'Assignments', value: assignments.length, icon: ClipboardList },
              { label: 'Students', value: course.enrollmentCount, icon: Users },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2.5">
                <s.icon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.filter(t => t.show).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
              tab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Modules */}
      {tab === 'modules' && (
        <div className="space-y-2">
          {modules.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No modules yet</p>
            </div>
          ) : modules.map(module => (
            <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0" style={{ fontFamily: 'var(--font-syne)' }}>
                    {module.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-syne)' }}>{module.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-[11px]">
                      {assignmentsByModule(module.id).length} assignment{assignmentsByModule(module.id).length !== 1 ? 's' : ''}
                    </Badge>
                    {expandedModule === module.id
                      ? <ChevronDown className="h-4 w-4 text-gray-400" />
                      : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
              </button>

              {expandedModule === module.id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
                  {module.content && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {module.content}
                    </div>
                  )}
                  {assignmentsByModule(module.id).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignments</p>
                      {assignmentsByModule(module.id).map(a => (
                        <Link key={a.id} href={`/courses/${id}/assignments/${a.id}`}>
                          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50">
                                <ClipboardList className="h-3.5 w-3.5 text-indigo-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-3 w-3" /> Due {formatDate(a.dueDate)}
                                  <span className="text-gray-300">·</span>
                                  <Award className="h-3 w-3" /> {a.maxGrade} marks
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {a.isOverdue ? <Badge variant="destructive">Overdue</Badge> : <Badge variant="success">Open</Badge>}
                              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Announcements */}
      {tab === 'announcements' && (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              <Megaphone className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No announcements yet</p>
            </div>
          ) : announcements.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">
                  {a.authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-syne)' }}>{a.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.authorName} · {formatDateTime(a.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Students */}
      {tab === 'students' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {enrollments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No students enrolled</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>
                  {enrollments.length} student{enrollments.length !== 1 ? 's' : ''} enrolled
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Student', 'Email', 'Enrolled', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enrollments.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {e.studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-medium text-gray-900">{e.studentName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{e.studentEmail}</td>
                      <td className="px-5 py-3.5 text-gray-500">{formatDate(e.enrolledAt)}</td>
                      <td className="px-5 py-3.5"><Badge variant="success">Active</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  )
}
