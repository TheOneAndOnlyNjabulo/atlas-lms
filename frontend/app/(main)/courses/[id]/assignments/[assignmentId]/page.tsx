'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, Calendar, Award, ClipboardCheck, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { Assignment, Submission, SUBMISSION_STATUS } from '@/types'
import api from '@/lib/api'
import { formatDate, formatDateTime, cn } from '@/lib/utils'

export default function AssignmentPage() {
  const { id, assignmentId } = useParams<{ id: string; assignmentId: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()

  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [gradeInputs, setGradeInputs] = useState<Record<string, { grade: string; feedback: string }>>({})
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeError, setGradeError] = useState('')

  const { data: assignment } = useQuery<Assignment>({
    queryKey: ['assignment', assignmentId],
    queryFn: () => api.get(`/assignments/${assignmentId}`).then(r => r.data),
  })

  const { data: mySubmission } = useQuery<Submission>({
    queryKey: ['my-submission', assignmentId],
    queryFn: () => api.get(`/submissions/my/${assignmentId}`).then(r => r.data),
    enabled: user?.role === 2,
    retry: false,
  })

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ['submissions', assignmentId],
    queryFn: () => api.get(`/submissions/assignment/${assignmentId}`).then(r => r.data),
    enabled: user?.role !== 2,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await api.post('/submissions', { assignmentId, content, filePath: '' })
      qc.invalidateQueries({ queryKey: ['my-submission', assignmentId] })
      setContent('')
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error ?? 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGrade(submissionId: string) {
    const vals = gradeInputs[submissionId]
    if (!vals?.grade) return
    setGradeError('')
    setGradingId(submissionId)
    try {
      await api.post('/submissions/grade', {
        submissionId,
        grade: Number(vals.grade),
        feedback: vals.feedback,
      })
      qc.invalidateQueries({ queryKey: ['submissions', assignmentId] })
    } catch (err: any) {
      setGradeError(err?.response?.data?.error ?? 'Grading failed.')
    } finally {
      setGradingId(null)
    }
  }

  const statusVariant: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
    [SUBMISSION_STATUS.SUBMITTED]: 'warning',
    [SUBMISSION_STATUS.GRADED]: 'success',
    [SUBMISSION_STATUS.LATE]: 'destructive',
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <Link href={`/courses/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to course
      </Link>

      {/* Assignment header */}
      {assignment && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Assignment</Badge>
                {assignment.isOverdue
                  ? <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Overdue</Badge>
                  : <Badge variant="success" className="gap-1"><Clock className="h-3 w-3" />Open</Badge>}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-syne)' }}>{assignment.title}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">{assignment.description}</p>
            </div>
            <div className="shrink-0 text-right space-y-1.5">
              <div className="flex items-center justify-end gap-1.5 text-sm text-gray-700">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">{assignment.maxGrade}</span>
                <span className="text-gray-400">marks</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Due {formatDate(assignment.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student: submit or view result */}
      {user?.role === 2 && (
        <>
          {mySubmission ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>Your submission</h2>
                <Badge variant={statusVariant[mySubmission.status] ?? 'secondary'}>{mySubmission.status}</Badge>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {mySubmission.content}
              </div>
              <p className="text-xs text-gray-400">Submitted {formatDateTime(mySubmission.submittedAt)}</p>

              {mySubmission.status === SUBMISSION_STATUS.GRADED && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Grade</p>
                      <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>
                        {mySubmission.grade?.grade} <span className="text-base font-normal text-gray-400">/ {assignment?.maxGrade}</span>
                      </p>
                    </div>
                  </div>
                  {mySubmission.grade?.feedback && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900">
                      <p className="font-semibold text-indigo-700 mb-1 text-xs uppercase tracking-wider">Feedback</p>
                      {mySubmission.grade.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'var(--font-syne)' }}>Submit your work</h2>
              {submitError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{submitError}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Your answer</label>
                <Textarea
                  placeholder="Write your submission here…"
                  className="min-h-[160px]"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? 'Submitting…' : <><Send className="h-4 w-4" />Submit</>}
              </Button>
            </form>
          )}
        </>
      )}

      {/* Lecturer/Admin: grade submissions */}
      {user?.role !== 2 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <ClipboardCheck className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-syne)' }}>Student Submissions</h2>
            <Badge variant="secondary" className="ml-auto">{submissions.length}</Badge>
          </div>

          {gradeError && (
            <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{gradeError}</div>
          )}

          {submissions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardCheck className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {submissions.map(sub => {
                const gi = gradeInputs[sub.id] ?? { grade: sub.grade?.grade?.toString() ?? '', feedback: sub.grade?.feedback ?? '' }
                return (
                  <div key={sub.id} className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          {sub.studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{sub.studentName}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(sub.submittedAt)}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[sub.status] ?? 'secondary'}>{sub.status}</Badge>
                    </div>

                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {sub.content}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="w-28 shrink-0 space-y-1">
                        <label className="text-xs font-medium text-gray-500">Grade / {assignment?.maxGrade}</label>
                        <Input
                          type="number"
                          min={0}
                          max={assignment?.maxGrade}
                          placeholder="0"
                          value={gi.grade}
                          onChange={e => setGradeInputs(p => ({ ...p, [sub.id]: { ...gi, grade: e.target.value } }))}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-gray-500">Feedback (optional)</label>
                        <Input
                          placeholder="Leave feedback for the student…"
                          value={gi.feedback}
                          onChange={e => setGradeInputs(p => ({ ...p, [sub.id]: { ...gi, feedback: e.target.value } }))}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          size="sm"
                          variant={sub.status === SUBMISSION_STATUS.GRADED ? 'outline' : 'default'}
                          disabled={gradingId === sub.id || !gi.grade}
                          onClick={() => handleGrade(sub.id)}
                        >
                          {gradingId === sub.id ? 'Saving…' : sub.status === SUBMISSION_STATUS.GRADED ? 'Update' : 'Grade'}
                        </Button>
                      </div>
                    </div>

                    {sub.status === SUBMISSION_STATUS.GRADED && sub.grade && (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Graded {sub.grade.grade}/{assignment?.maxGrade}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
