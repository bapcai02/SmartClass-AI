import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, BookOpen, Users, Clock, FileText, Search, Filter, BarChart3, CheckCircle, Play } from 'lucide-react'
import { getAllExams, getExamStats, type ExamFilters } from '@/api/exams'
import { getClasses, type ClassroomDto } from '@/api/classApi'
import { searchSubjects } from '@/api/lookup'
import { useQuery } from '@tanstack/react-query'

export default function AllExamsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ExamFilters>({
    page: 1,
    perPage: 15,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['all-exams', filters],
    queryFn: () => getAllExams(filters),
  })

  const { data: stats } = useQuery({
    queryKey: ['exam-stats'],
    queryFn: getExamStats,
  })

  const { data: classesData } = useQuery({
    queryKey: ['classes-for-filter'],
    queryFn: () => getClasses({ perPage: 100 }),
  })

  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectsData = await searchSubjects('', 100)
        setSubjects(subjectsData)
      } catch (error) {
        console.error('Failed to load subjects:', error)
      }
    }
    loadSubjects()
  }, [])

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1,
    }))
    setPage(1)
  }

  const handleFilterChange = (key: keyof ExamFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ page: 1, perPage: 15 })
    setSearchTerm('')
    setPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (startTime: string, endTime?: string | null) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : null

    if (end && now > end) return 'text-gray-600 bg-gray-50 border-gray-200'
    if (now >= start && (!end || now <= end)) return 'text-green-600 bg-green-50 border-green-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getStatusText = (startTime: string, endTime?: string | null) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : null

    if (end && now > end) return 'Completed'
    if (now >= start && (!end || now <= end)) return 'Ongoing'
    return 'Upcoming'
  }

  const getStatusIcon = (startTime: string, endTime?: string | null) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : null

    if (end && now > end) return <CheckCircle className="h-4 w-4" />
    if (now >= start && (!end || now <= end)) return <Play className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-slate-200"></div>
          </div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-center">
            <div className="text-red-600">Error loading exams</div>
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tất cả bài kiểm tra</h1>
              <p className="text-slate-600">Xem và quản lý bài kiểm tra từ tất cả lớp học của bạn</p>
            </div>
            <div className="text-sm text-slate-600">
              Tổng {data?.total || 0} bài kiểm tra
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-600">Tổng</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                    <div className="text-sm text-slate-600">Sắp tới</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Play className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.ongoing}</div>
                    <div className="text-sm text-slate-600">Đang diễn ra</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <CheckCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
                    <div className="text-sm text-slate-600">Đã kết thúc</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                  placeholder="Tìm kiếm bài kiểm tra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
                <Button onClick={handleSearch} className="px-6 text-black hover:bg-black hover:text-white">
                  Tìm kiếm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} size="sm">
                  Xóa lọc
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Lớp</label>
                  <select
                    value={filters.class_id || ''}
                    onChange={(e) => handleFilterChange('class_id', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="">Tất cả lớp</option>
                    {(
                      (classesData as any)?.data || (classesData as any)?.items || []
                    ).map((cls: ClassroomDto) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Môn học</label>
                  <select
                    value={filters.subject_id || ''}
                    onChange={(e) => handleFilterChange('subject_id', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="">Tất cả môn</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="">Tất cả</option>
                    <option value="upcoming">Sắp tới</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Từ ngày</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Exams List */}
        <div className="grid gap-4">
          {data?.data?.map((exam) => (
            <Card key={exam.id} className="group overflow-hidden border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-blue transition-colors">
                      {exam.title}
                    </h3>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(exam.start_time, exam.end_time)}`}>
                      {getStatusIcon(exam.start_time, exam.end_time)}
                      {getStatusText(exam.start_time, exam.end_time)}
                    </span>
                  </div>
                  
                  {exam.description && (
                    <p className="mb-3 text-slate-600 line-clamp-2">{exam.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{exam.class_room.subject.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{exam.class_room.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Created by {exam.creator.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Starts {formatDate(exam.start_time)}</span>
                    </div>
                    {exam.end_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Ends {formatDate(exam.end_time)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{exam.submissions.length} submissions</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    to={`/class/${exam.class_id}/exam/${exam.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
                  >
                    Xem chi tiết
                  </Link>
                  <div className="text-right text-xs text-slate-500">
                    ID: {exam.id}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg"
            >
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`rounded-lg ${page === pageNum ? 'bg-brand-blue text-white' : ''}`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
              disabled={page === data.last_page}
              className="rounded-lg"
            >
              Sau
            </Button>
          </div>
        )}

        {/* Empty State */}
        {data?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Không có bài kiểm tra</h3>
            <p className="text-slate-600">Hãy thử điều chỉnh từ khóa hoặc bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  )
}
