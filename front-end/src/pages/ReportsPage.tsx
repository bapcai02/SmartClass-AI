import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  FileText,
  Clock,
  Award,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react'
import { 
  getOverallStats, 
  getClassPerformance, 
  getStudentPerformance, 
  getAttendanceStats, 
  getGradeDistribution, 
  getRecentActivity, 
  getMonthlyStats,
  type OverallStats,
  type ClassPerformance,
  type StudentPerformance,
  type AttendanceStats,
  type GradeDistribution,
  type RecentActivity,
  type MonthlyStats
} from '@/api/reports'
import { useQuery } from '@tanstack/react-query'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAll, setShowAll] = useState({
    classes: false,
    students: false,
    attendance: false,
    activity: false,
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const { data: overallStats, isLoading: overallLoading } = useQuery({
    queryKey: ['overall-stats'],
    queryFn: getOverallStats,
  })

  const { data: classPerformance, isLoading: classLoading } = useQuery({
    queryKey: ['class-performance'],
    queryFn: getClassPerformance,
  })

  const { data: studentPerformance, isLoading: studentLoading } = useQuery({
    queryKey: ['student-performance'],
    queryFn: getStudentPerformance,
  })

  const { data: attendanceStats, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: getAttendanceStats,
  })

  const { data: gradeDistribution, isLoading: gradeLoading } = useQuery({
    queryKey: ['grade-distribution'],
    queryFn: getGradeDistribution,
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: getRecentActivity,
  })

  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-stats'],
    queryFn: getMonthlyStats,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (grade >= 80) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (grade >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (rate >= 80) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'grades', label: 'Grades', icon: Award },
    { id: 'activity', label: 'Activity', icon: Activity },
  ]

  if (overallLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200"></div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600">Comprehensive insights into your educational platform</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg ${
                    activeTab === tab.id 
                      ? 'bg-brand-blue text-white' 
                      : 'text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overall Stats */}
            {overallStats && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{overallStats.total_classes}</div>
                      <div className="text-sm text-slate-600">Classes</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{overallStats.total_students}</div>
                      <div className="text-sm text-slate-600">Students</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{overallStats.total_teachers}</div>
                      <div className="text-sm text-slate-600">Teachers</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{overallStats.total_assignments}</div>
                      <div className="text-sm text-slate-600">Assignments</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-100 p-2">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{overallStats.total_exams}</div>
                      <div className="text-sm text-slate-600">Exams</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Monthly Stats Chart */}
            {monthlyStats && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Monthly Activity</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {monthlyStats.slice(-6).map((month, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 p-4">
                      <div className="text-sm font-medium text-slate-600">{month.month}</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Assignments</span>
                          <span className="font-medium">{month.assignments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Exams</span>
                          <span className="font-medium">{month.exams}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Submissions</span>
                          <span className="font-medium">{month.submissions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            {recentActivity && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                      <div className={`rounded-full p-2 ${
                        activity.type === 'assignment' 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {activity.type === 'assignment' ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{activity.title}</div>
                        <div className="text-sm text-slate-600">
                          {activity.class_name} • {activity.subject} • by {activity.created_by}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatDate(activity.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Class Performance</h2>
              <Button
                variant="outline"
                onClick={() => setShowAll(prev => ({ ...prev, classes: !prev.classes }))}
                className="text-black hover:bg-black hover:text-white"
              >
                {showAll.classes ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            {classLoading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {(showAll.classes ? classPerformance : classPerformance?.slice(0, 10))?.map((classData) => (
                  <Card key={classData.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{classData.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span>Subject: {classData.subject}</span>
                          <span>Teacher: {classData.teacher}</span>
                          <span>Students: {classData.student_count}</span>
                          <span>Assignments: {classData.assignment_count}</span>
                          <span>Exams: {classData.exam_count}</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${getGradeColor(classData.average_grade)}`}>
                          <Award className="h-4 w-4" />
                          {classData.average_grade.toFixed(1)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Average Grade</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Student Performance</h2>
              <Button
                variant="outline"
                onClick={() => setShowAll(prev => ({ ...prev, students: !prev.students }))}
                className="text-black hover:bg-black hover:text-white"
              >
                {showAll.students ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            {studentLoading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {(showAll.students ? studentPerformance : studentPerformance?.slice(0, 15))?.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{student.name}</h3>
                        <div className="text-sm text-slate-600">{student.email}</div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                          <span>Submissions: {student.total_submissions}</span>
                          <span>Graded: {student.graded_submissions}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${getGradeColor(student.average_grade)}`}>
                          <Award className="h-4 w-4" />
                          {student.average_grade.toFixed(1)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Average Grade</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Attendance Statistics</h2>
              <Button
                variant="outline"
                onClick={() => setShowAll(prev => ({ ...prev, attendance: !prev.attendance }))}
                className="text-black hover:bg-black hover:text-white"
              >
                {showAll.attendance ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            {attendanceLoading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {(showAll.attendance ? attendanceStats : attendanceStats?.slice(0, 15))?.map((attendance, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{attendance.student_name}</h3>
                        <div className="text-sm text-slate-600">{attendance.class_name}</div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                          <span>Present: {attendance.present_count}</span>
                          <span>Total: {attendance.total_attendance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${getAttendanceColor(attendance.attendance_rate)}`}>
                          <Calendar className="h-4 w-4" />
                          {attendance.attendance_rate.toFixed(1)}%
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Attendance Rate</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            {gradeLoading ? (
              <div className="h-64 animate-pulse rounded-xl bg-slate-200"></div>
            ) : (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Grade Distribution</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(gradeDistribution || {}).map(([gradeRange, count]) => (
                    <div key={gradeRange} className="rounded-lg border border-slate-200 p-4">
                      <div className="text-sm font-medium text-slate-600">{gradeRange}</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">{count}</div>
                      <div className="text-xs text-slate-500">submissions</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
              <Button
                variant="outline"
                onClick={() => setShowAll(prev => ({ ...prev, activity: !prev.activity }))}
                className="text-black hover:bg-black hover:text-white"
              >
                {showAll.activity ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200"></div>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {(showAll.activity ? recentActivity : recentActivity?.slice(0, 20))?.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                      <div className={`rounded-full p-2 ${
                        activity.type === 'assignment' 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {activity.type === 'assignment' ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{activity.title}</div>
                        <div className="text-sm text-slate-600">
                          {activity.class_name} • {activity.subject} • by {activity.created_by}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatDate(activity.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
