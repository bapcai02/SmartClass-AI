import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, BookOpen, GraduationCap, FileText, Star, Layers3, BrainCircuit, Target, Mail, Phone, Globe } from 'lucide-react'
import api from '@/utils/api'
import { searchSubjects } from '@/api/lookup'
import { getClasses, type ClassroomDto } from '@/api/classApi'

type PublicExam = {
  id: number
  class_id: number
  title: string
  description?: string | null
  start_time: string
  end_time?: string | null
  class_room?: { name: string; subject: { name: string } }
}

export default function PublicQuestionBankPage() {
  const [items, setItems] = useState<PublicExam[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classId, setClassId] = useState<number | ''>('')
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([])
  const [classes, setClasses] = useState<ClassroomDto[]>([])

  useEffect(() => {
    load()
    ;(async () => {
      try {
        const s = await searchSubjects('', 200)
        setSubjects(s)
      } catch {}
      try {
        const res = await getClasses({ perPage: 200 })
        const list = (res as any).data || (res as any).items || []
        setClasses(list)
      } catch {}
    })()
  }, [])

  const load = async (params: Record<string, any> = {}) => {
    const { data } = await api.get('/public/question-bank', { params })
    setItems((data?.data as PublicExam[]) || [])
  }

  const handleSearch = () => {
    load({ 
      search: searchTerm || undefined,
      subject_id: subjectId || undefined,
      class_id: classId || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-sky-50">
      {/* Top nav minimal like reference */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <a href="/public/question-bank" className="flex items-center gap-2 text-slate-800 font-semibold">
            <div className="h-8 w-8 rounded-md bg-indigo-600 grid place-items-center text-white">QB</div>
            Ngân hàng đề thi
          </a>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
            <a href="#explore" className="hover:text-slate-900">Đề thi</a>
            <a href="#featured" className="hover:text-slate-900">Kỳ thi nổi bật</a>
            <a href="#contact" className="hover:text-slate-900">Liên hệ</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login" className="text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">Đăng nhập</a>
            <a href="/auth" className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Đăng ký</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 hero-bg">
        <div className="mx-auto max-w-7xl px-4 py-12 text-white relative">
          {/* floating study icons */}
          <div className="edu-icon animate-float" style={{left:'6%', top:'18%'}}><BookOpen className="h-4 w-4 text-white"/></div>
          <div className="edu-icon animate-float" style={{right:'12%', top:'12%', animationDelay:'-1s'}}><GraduationCap className="h-4 w-4 text-white"/></div>
          <div className="edu-icon animate-float" style={{right:'20%', bottom:'12%', animationDelay:'-2s'}}><FileText className="h-4 w-4 text-white"/></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">Ngân hàng đề thi miễn phí cho học sinh THPT</h1>
              <p className="mt-3 text-indigo-100">Làm đề trực tuyến, luyện thi hiệu quả. Lọc theo môn học, lớp và từ khóa.</p>
              <div className="mt-5 flex gap-3">
                <a href="#explore" className="rounded-lg bg-white/95 px-4 py-2 text-indigo-700 font-medium hover:bg-white transition-transform hover:-translate-y-0.5">Khám phá ngay</a>
                <a href="/login" className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors">Đăng nhập</a>
              </div>
            </div>
            {/* Illustration with student imagery */}
            <div className="hidden md:flex justify-end relative">
              <div className="relative">
                <img src="/public/assets/students-hero.png" alt="students" className="h-44 w-auto rounded-xl shadow-xl ring-1 ring-white/30 animate-float-sway" onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
                <img src="/public/assets/study-desk.png" alt="study" className="absolute -bottom-6 -left-10 h-24 w-auto rounded-lg shadow-lg ring-1 ring-white/30 animate-gentle-tilt" onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="explore" className="mx-auto max-w-7xl px-4 py-8">
        {/* Search */}
        <Card className="p-4 mb-6 shadow-sm">
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
          </div>
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Môn học</label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : ''
                    setSubjectId(val as any)
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Tất cả môn</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Lớp</label>
                <select
                  value={classId}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : ''
                    setClassId(val as any)
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Tất cả lớp</option>
                  {classes
                    .filter(c => !subjectId || c.subject_id === subjectId)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">Áp dụng lọc</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Featured categories */}
        <div id="featured" className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{icon:Layers3,label:'THPT Quốc gia',color:'from-amber-100 to-amber-50 text-amber-700'},
            {icon:BrainCircuit,label:'ĐGNL HSA',color:'from-emerald-100 to-emerald-50 text-emerald-700'},
            {icon:Target,label:'ĐGNL V-ACT',color:'from-sky-100 to-sky-50 text-sky-700'},
            {icon:Star,label:'TSA',color:'from-rose-100 to-rose-50 text-rose-700'}].map((c,i)=>{
              const Icon = c.icon as any
              return (
                <div key={i} className={`rounded-xl border border-slate-200 bg-gradient-to-b ${c.color} p-4 flex items-center gap-3 hover:shadow-md transition-transform hover:-translate-y-0.5`}> 
                  <div className="rounded-lg bg-white/70 p-2"><Icon className="h-5 w-5"/></div>
                  <div className="font-medium">{c.label}</div>
                </div>
              )
            })}
        </div>

        {/* Top exams */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Top đề thi</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items.slice(0, 4).map((exam) => (
              <Card key={`top-${exam.id}`} className="p-5 border-slate-200 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer">{exam.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1"><BookOpen className="h-4 w-4" /><span>{exam.class_room?.subject?.name || '—'}</span></div>
                      <div className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /><span>{exam.class_room?.name || '—'}</span></div>
                      <div className="flex items-center gap-1"><FileText className="h-4 w-4" /><span>ID: {exam.id}</span></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* New exams */}
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Đề thi mới</h2>
        <div className="grid gap-4">
          {items.map((exam) => (
            <Card key={exam.id} className="p-5 border-slate-200 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer">{exam.title}</h3>
                  </div>
                  {exam.description && (
                    <p className="mb-3 text-slate-600 line-clamp-2">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><BookOpen className="h-4 w-4" /><span>{exam.class_room?.subject?.name || '—'}</span></div>
                    <div className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /><span>{exam.class_room?.name || '—'}</span></div>
                    <div className="flex items-center gap-1"><FileText className="h-4 w-4" /><span>ID: {exam.id}</span></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-center py-12 text-slate-600">Không có đề phù hợp</div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer id="contact" className="mt-10 border-t border-slate-200/70 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-slate-600">
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <div className="h-7 w-7 rounded-md bg-indigo-600 grid place-items-center text-white">QB</div>
              Ngân hàng đề thi
            </div>
            <p className="mb-3">Nền tảng làm đề thi trực tuyến miễn phí, phù hợp học sinh THCS/THPT.</p>
            <div className="flex gap-2">
              <a className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50" href="#featured">Khám phá</a>
              <a className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" href="/login">Đăng nhập</a>
            </div>
          </div>
          <div>
            <div className="font-medium text-slate-800 mb-2">Liên kết nhanh</div>
            <ul className="space-y-2">
              <li><a href="#featured" className="hover:text-slate-800">Kỳ thi nổi bật</a></li>
              <li><a href="#explore" className="hover:text-slate-800">Đề thi</a></li>
              <li><a href="/public/question-bank" className="hover:text-slate-800">Trang chủ</a></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-slate-800 mb-2">Liên hệ</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> support@example.com</div>
            <div className="flex items-center gap-2 mt-1"><Phone className="h-4 w-4"/> 0123 456 789</div>
            <div className="flex items-center gap-2 mt-1"><Globe className="h-4 w-4"/> www.smartclass.ai</div>
          </div>
        </div>
        <div className="border-t border-slate-200/70 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} SmartClass. All rights reserved.</div>
      </footer>
    </div>
  )
}


