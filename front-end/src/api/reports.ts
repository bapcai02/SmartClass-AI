import api from '@/utils/api'

export type OverallStats = {
  total_classes: number
  total_students: number
  total_teachers: number
  total_assignments: number
  total_exams: number
}

export type ClassPerformance = {
  id: number
  name: string
  subject: string
  teacher: string
  student_count: number
  assignment_count: number
  exam_count: number
  average_grade: number
}

export type StudentPerformance = {
  id: number
  name: string
  email: string
  total_submissions: number
  graded_submissions: number
  average_grade: number
}

export type AttendanceStats = {
  student_id: number
  student_name: string
  class_id: number
  class_name: string
  total_attendance: number
  present_count: number
  attendance_rate: number
}

export type GradeDistribution = Record<string, number>

export type RecentActivity = {
  type: 'assignment' | 'exam'
  id: number
  title: string
  class_name: string
  subject: string
  created_by: string
  created_at: string
}

export type MonthlyStats = {
  month: string
  assignments: number
  exams: number
  submissions: number
}

export async function getOverallStats() {
  const { data } = await api.get<OverallStats>('/reports/overall-stats')
  return data
}

export async function getClassPerformance() {
  const { data } = await api.get<ClassPerformance[]>('/reports/class-performance')
  return data
}

export async function getStudentPerformance() {
  const { data } = await api.get<StudentPerformance[]>('/reports/student-performance')
  return data
}

export async function getAttendanceStats() {
  const { data } = await api.get<AttendanceStats[]>('/reports/attendance-stats')
  return data
}

export async function getGradeDistribution() {
  const { data } = await api.get<GradeDistribution>('/reports/grade-distribution')
  return data
}

export async function getRecentActivity() {
  const { data } = await api.get<RecentActivity[]>('/reports/recent-activity')
  return data
}

export async function getMonthlyStats() {
  const { data } = await api.get<MonthlyStats[]>('/reports/monthly-stats')
  return data
}
