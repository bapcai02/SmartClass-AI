import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, BookOpen, GraduationCap, FileText, Clock } from 'lucide-react'
import { getAllExams, type ExamWithDetails, type ExamFilters } from '@/api/exams'
import { searchSubjects } from '@/api/lookup'

export default function QuestionBankPage() {
  const [filters, setFilters] = useState<ExamFilters>({ page: 1, perPage: 20 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([])
  const [grade, setGrade] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['question-bank', filters],
    queryFn: () => getAllExams(filters),
  })

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const s = await searchSubjects('', 200)
        setSubjects(s)
      } catch (e) {
        // no-op
      }
    }
    loadSubjects()
  }, [])

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1, search: searchTerm || undefined }))
  }

  const handleFilterChange = (key: keyof ExamFilters, value: any) => {
    setFilters(prev => ({ ...prev, page: 1, [key]: value || undefined }))
  }

  const clearFilters = () => {
    setFilters({ page: 1, perPage: 20 })
    setSearchTerm('')
    setGrade('')
  }

  const items = (data?.data as ExamWithDetails[] | undefined) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Ngân hàng đề thi</h1>
            <div className="text-sm text-slate-600">{data?.total ?? 0} đề</div>
          </div>
          <p className="text-slate-600">Tìm đề theo môn học, khối lớp (1–12), từ khóa…</p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đề thi…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <Button onClick={handleSearch} className="px-6 text-black hover:bg-black hover:text-white">Tìm</Button>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="px-4">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters} size="sm">Xóa lọc</Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Khối lớp</label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const g = e.target.value
                    setGrade(g)
                    // TODO: map grade -> class_id list when backend supports grade filter
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Tất cả</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Môn học</label>
                <select
                  value={filters.subject_id || ''}
                  onChange={(e) => handleFilterChange('subject_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Tất cả</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </Card>

        <div className="grid gap-4">
          {isLoading && <div className="h-24 animate-pulse rounded-xl bg-slate-200" />}
          {error && <div className="text-red-600">Lỗi tải dữ liệu</div>}
          {!isLoading && !error && items.map((exam) => (
            <Card key={exam.id} className="overflow-hidden border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{exam.title}</h3>
                  </div>
                  {exam.description && (
                    <p className="mb-3 text-slate-600 line-clamp-2">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><BookOpen className="h-4 w-4" /><span>{exam.class_room.subject.name}</span></div>
                    <div className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /><span>{exam.class_room.name}</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>Bắt đầu: {new Date(exam.start_time).toLocaleString('vi-VN')}</span></div>
                    <div className="flex items-center gap-1"><FileText className="h-4 w-4" /><span>{exam.submissions.length} lượt nộp</span></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {!isLoading && !error && items.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có đề phù hợp</h3>
              <p className="text-slate-600">Hãy thử đổi từ khóa hoặc bộ lọc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


