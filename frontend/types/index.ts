export type UserRole = 0 | 1 | 2 // Admin | Lecturer | Student

export interface AuthUser {
  token: string
  userId: string
  fullName: string
  email: string
  role: UserRole
}

export interface Course {
  id: string
  title: string
  description: string
  code: string
  credits: number
  isActive: boolean
  lecturerName: string
  lecturerId: string
  enrollmentCount: number
  createdAt: string
}

export interface Module {
  id: string
  title: string
  description: string
  content: string
  order: number
  courseId: string
  assignmentCount: number
  createdAt: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxGrade: number
  moduleId: string
  isOverdue: boolean
  createdAt: string
}

export interface Grade {
  grade: number
  feedback: string
  gradedAt: string
}

export interface Submission {
  id: string
  studentName: string
  content: string
  filePath: string
  status: string // 'Submitted' | 'Late' | 'Graded'
  submittedAt: string
  grade?: Grade
  assignmentId: string
}

export interface Enrollment {
  id: string
  studentName: string
  studentEmail: string
  courseTitle: string
  courseCode: string
  enrolledAt: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
}

export const ROLES = { Admin: 0, Lecturer: 1, Student: 2 } as const
export const ROLE_LABELS: Record<UserRole, string> = { 0: 'Admin', 1: 'Lecturer', 2: 'Student' }
export const SUBMISSION_STATUS = { SUBMITTED: 'Submitted', LATE: 'Late', GRADED: 'Graded' } as const
