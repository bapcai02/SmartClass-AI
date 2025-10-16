import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, BookOpen, GraduationCap, FileText, Star, Layers3, BrainCircuit, Target, Mail, Phone, Globe, Image as ImageIcon, Send, Calculator, Atom, FlaskConical, Dna, Landmark, Globe2, X } from 'lucide-react'
import api from '@/utils/api'

type PublicExam = {
  id: number
  class_id: number
  title: string
  description?: string | null
  start_time: string
  end_time?: string | null
  // old shape (private db)
  class_room?: { name: string; subject: { name: string } }
  submissions?: Array<{ id: number; student_id: number; grade?: number | null; submitted_at?: string | null }>
  // new public_* shape
  clazz?: { name: string }
  subject?: { name: string }
  attempts?: number
  duration_minutes?: number
}

function formatDuration(start?: string, end?: string | null) {
  try {
    if (!start || !end) return 'Không rõ'
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    if (isNaN(s) || isNaN(e) || e <= s) return 'Không rõ'
    const mins = Math.round((e - s) / 60000)
    if (mins < 60) return `${mins} phút`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m ? `${h} giờ ${m} phút` : `${h} giờ`
  } catch {
    return 'Không rõ'
  }
}

export default function PublicQuestionBankPage() {
  const [items, setItems] = useState<PublicExam[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([])
  const [grade, setGrade] = useState<number | ''>('')
  const [year, setYear] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState<'newest' | 'most' | 'az' | 'views' | 'questions' | 'duration'>('newest')
  const [difficultyMin, setDifficultyMin] = useState<number | ''>('')
  const [difficultyMax, setDifficultyMax] = useState<number | ''>('')
  const [chapter, setChapter] = useState<string>('')
  const [tags, setTags] = useState<string>('')
  const [durationMin, setDurationMin] = useState<number | ''>('')
  const [durationMax, setDurationMax] = useState<number | ''>('')
  const [page, setPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(12)
  const [meta, setMeta] = useState<{ current_page: number; per_page: number; total: number; last_page: number } | null>(null)
  const [visibleCount, setVisibleCount] = useState(6) // kept for backward-compatible section rendering
  const [loadingList, setLoadingList] = useState(false)
  const [quickView, setQuickView] = useState<PublicExam | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [composer, setComposer] = useState('')
  const [sending, setSending] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const chatRef = useRef<HTMLDivElement | null>(null)

  type ChatMessage = { role: 'user' | 'assistant'; content: string; imageUrl?: string }

  useEffect(() => {
    load()
    ;(async () => {
      try {
        const s = await api.get('/public/subjects').then(r => r.data as Array<{id:number; name:string}>)
        setSubjects(s)
      } catch {}
    })()
  }, [])

  useEffect(() => {
    // Always keep the chat scrolled to the latest message
    try {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
    } catch {}
  }, [messages, sending])

  const load = async (params: Record<string, any> = {}) => {
    setLoadingList(true)
    try {
      const { data } = await api.get('/public/question-bank', { params })
      let list = (data?.data as PublicExam[]) || []
      const m = data?.meta as typeof meta | undefined
      if (m && typeof m.current_page === 'number') {
        setMeta(m)
      } else {
        setMeta(null)
      }
      // Client-side year filter (simple heuristic: match year in title)
      if (year) {
        const re = new RegExp(String(year))
        list = list.filter(e => re.test(String(e.title || '')))
      }
      // Client-side sort fallback for 'az'
      if (sortBy === 'az') {
        list = list.slice().sort((a,b)=> String(a.title||'').localeCompare(String(b.title||'')))
      }
      setItems(list)
    } finally {
      setLoadingList(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    const sortMap: Record<string, string | undefined> = {
      newest: 'latest',
      most: 'attempts',
      views: 'views',
      questions: 'questions',
      duration: 'duration',
      az: undefined, // handled client-side
    }
    load({
      search: searchTerm || undefined,
      subject_id: subjectId || undefined,
      grade: grade || undefined,
      // advanced filters
      difficulty_min: difficultyMin || undefined,
      difficulty_max: difficultyMax || undefined,
      chapter: chapter || undefined,
      tag: undefined,
      tags: tags ? tags : undefined,
      duration_min: durationMin || undefined,
      duration_max: durationMax || undefined,
      // pagination & sorting
      per_page: perPage || undefined,
      page: 1,
      sort: sortMap[sortBy] || undefined,
      order: 'desc',
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSubjectId('')
    setGrade('')
    setYear('')
    setSortBy('newest')
    setDifficultyMin('')
    setDifficultyMax('')
    setChapter('')
    setTags('')
    setDurationMin('')
    setDurationMax('')
    setPerPage(12)
    setPage(1)
    setVisibleCount(6)
    setMeta(null)
    load({ per_page: 12, page: 1 })
  }

  // pagination change handler
  const goToPage = (p: number) => {
    const sortMap: Record<string, string | undefined> = {
      newest: 'latest',
      most: 'attempts',
      views: 'views',
      questions: 'questions',
      duration: 'duration',
      az: undefined,
    }
    setPage(p)
    load({
      search: searchTerm || undefined,
      subject_id: subjectId || undefined,
      grade: grade || undefined,
      difficulty_min: difficultyMin || undefined,
      difficulty_max: difficultyMax || undefined,
      chapter: chapter || undefined,
      tags: tags || undefined,
      duration_min: durationMin || undefined,
      duration_max: durationMax || undefined,
      per_page: perPage || undefined,
      page: p,
      sort: sortMap[sortBy] || undefined,
      order: 'desc',
    })
  }

  async function sendChat() {
    const text = composer.trim()
    if (!text && !imageFile) return
    setSending(true)
    // Optimistic message with image preview if available
    const optimistic: ChatMessage = { role: 'user', content: text || (imageFile ? '[Ảnh]' : '') }
    if (imageFile) {
      try { optimistic.imageUrl = URL.createObjectURL(imageFile) } catch {}
    }
    setMessages(prev => [...prev, optimistic])
    // Clear composer and local preview immediately after queueing
    setComposer('')
    setImageFile(null)
    try {
      const form = new FormData()
      if (text) form.append('message', text)
      else form.append('message', 'Phân tích nội dung ảnh (đề/bài tập). Nêu rõ dữ kiện, yêu cầu; giải theo từng bước chi tiết bằng tiếng Việt; dùng LaTeX cho công thức; nếu có nhiều câu, đánh số và trả lời lần lượt.')
      if (imageFile) form.append('image', imageFile)
      const { data } = await api.post('/public/ai/chat', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const resp = (data?.response || data?.error || 'Không có phản hồi') as string
      setMessages(prev => [...prev, { role: 'assistant', content: resp }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi ủy quyền hoặc kết nối. Vui lòng thử lại.' }])
    } finally {
      setSending(false)
    }
  }

  function copyExamLink(id: number) {
    const url = `${window.location.origin}/public/exam/${id}/take`
    navigator.clipboard.writeText(url)
      .then(() => {
        setToast({ msg: 'Đã sao chép liên kết đề thi', type: 'success' })
        setTimeout(() => setToast(null), 2000)
      })
      .catch(() => {
        setToast({ msg: 'Sao chép thất bại. Vui lòng thử lại.', type: 'error' })
        setTimeout(() => setToast(null), 2000)
      })
  }

  function isNewExam(exam: PublicExam) {
    try { return (Date.now() - new Date(exam.start_time).getTime()) < 7*24*60*60*1000 } catch { return false }
  }

  function isHotExam(exam: PublicExam) {
    const attempts = exam.attempts ?? (exam.submissions ? exam.submissions.length : 0)
    return (attempts || 0) >= 50
  }

  function Badges({ exam }: { exam: PublicExam }) {
    const hot = isHotExam(exam)
    const fresh = isNewExam(exam)
    const attempts = exam.attempts ?? (exam.submissions ? exam.submissions.length : 0)
    return (
      <div className="flex items-center gap-1">
        {fresh && <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px]">Mới</span>}
        {hot && <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px]">Hot</span>}
        <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 text-[11px]">{attempts} lượt làm</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-sky-50">
      {/* Top nav minimal like reference */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <a href="/public/question-bank" className="flex items-center gap-2 text-slate-800 font-semibold">
            <div className="h-8 w-8 rounded-md bg-indigo-600 grid place-items-center text-white"><GraduationCap className="h-5 w-5"/></div>
            Ngân hàng đề thi
          </a>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
            <a href="#explore" className="hover:text-slate-900">Đề thi</a>
            <a href="#featured" className="hover:text-slate-900">Kỳ thi nổi bật</a>
            <div className="relative group">
              <a href="/public/pdfs" className="hover:text-slate-900">Thư viện PDF</a>
              <div className="invisible absolute left-0 top-full mt-2 w-[560px] translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 transition z-50">
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div>
                    <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Môn học</div>
                    <div className="grid gap-1 text-sm">
                      <a href="/public/pdfs?subject_name=Toán" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Toán</a>
                      <a href="/public/pdfs?subject_name=Vật lý" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Vật lý</a>
                      <a href="/public/pdfs?subject_name=Hóa học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Hóa học</a>
                      <a href="/public/pdfs?subject_name=Sinh học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Sinh học</a>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Khối lớp</div>
                    <div className="grid gap-1 text-sm">
                      <a href="/public/pdfs?class_name=Lớp 10" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 10</a>
                      <a href="/public/pdfs?class_name=Lớp 11" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 11</a>
                      <a href="/public/pdfs?class_name=Lớp 12" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 12</a>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Loại</div>
                    <div className="grid gap-1 text-sm">
                      <a href="/public/pdfs?category=Thi đại học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi đại học</a>
                      <a href="/public/pdfs?category=Thi giữa kỳ" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi giữa kỳ</a>
                      <a href="/public/pdfs?category=Thi cuối kỳ" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi cuối kỳ</a>
                    </div>
                  </div>
                  <div className="col-span-3 border-t pt-2 mt-1">
                    <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Liên kết nhanh</div>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <a href="/public/pdfs" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thư viện PDF</a>
                      <a href="/public/pdfs?category=Thi đại học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">PDF · Thi đại học</a>
                      <a href="/public/pdfs?subject_name=Toán&class_name=Lớp 12" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">PDF · Toán · Lớp 12</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <a href="#contact" className="hover:text-slate-900">Liên hệ</a>
          </nav>
          <div className="flex items-center gap-2" />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 hero-bg">
        <div className="mx-auto max-w-7xl px-4 py-12 text-white relative">
          {/* floating study icons */}
          <div className="edu-icon animate-float" style={{left:'6%', top:'18%'}}><BookOpen className="h-4 w-4 text-white"/></div>
          <div className="edu-icon animate-float" style={{right:'12%', top:'12%', animationDelay:'-1s'}}><GraduationCap className="h-4 w-4 text-white"/></div>
          <div className="edu-icon animate-float" style={{right:'20%', bottom:'12%', animationDelay:'-2s'}}><FileText className="h-4 w-4 text-white"/></div>
          <div className="grid grid-cols-1 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">Ngân hàng đề thi miễn phí cho học sinh</h1>
              <p className="mt-3 text-indigo-100">Làm đề trực tuyến, luyện thi hiệu quả. Lọc theo môn học, lớp và từ khóa.</p>
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
        {/* Lưới môn học như ảnh */}
        <div className="mb-6">
          <div className="mb-3 text-slate-800 font-medium">Gia sư AI Hay hỗ trợ giải bài tập nhanh chóng chính xác</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[{
              icon: Calculator, title: 'Giải Toán', desc: 'Giải toán bằng hình ảnh, liệt kê các bước giải chi tiết', color:'text-indigo-600 bg-indigo-50'
            },{
              icon: Atom, title: 'Vật Lý', desc: 'Giải bài tập vật lý với AI Hay', color:'text-green-600 bg-green-50'
            },{
              icon: FlaskConical, title: 'Hóa Học', desc: 'Sử dụng AI giúp bài tập hóa trở nên đơn giản hơn', color:'text-orange-600 bg-orange-50'
            },{
              icon: Dna, title: 'Sinh Học', desc: 'Giải bài tập di truyền, biến dị và các câu hỏi kiến thức', color:'text-rose-600 bg-rose-50'
            },{
              icon: Landmark, title: 'Lịch Sử', desc: 'Hỗ trợ phân tích và giải đáp các câu hỏi lịch sử chi tiết', color:'text-amber-600 bg-amber-50'
            },{
              icon: Globe2, title: 'Địa Lý', desc: 'Học tốt địa lý với AI, khám phá thế giới', color:'text-sky-600 bg-sky-50'
            }].map((c, i) => {
              const Icon = c.icon as any
              return (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center ${c.color}`}>
                      <Icon className="h-5 w-5"/>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      <div className="mt-1 text-sm text-slate-600 leading-snug">{c.desc}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Search moved below to before "Đề thi mới" */}

        {/* Featured categories */}
        <div id="featured" className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{
              icon:Layers3,
              label:'Kỳ thi Trung Học Phổ Thông Quốc Gia',
              desc:'Đánh giá kiến thức các môn chính về ban Tự nhiên và Xã hội.',
              color:'from-amber-100 to-amber-50 text-amber-700',
              points:['Môn: Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, GDCD','Định dạng trắc nghiệm + tự luận','Thời lượng tùy môn (45–120 phút)']
            },
            {
              icon:BrainCircuit,
              label:'Kỳ thi đánh giá năng lực HSA',
              desc:'Đánh giá tư duy, logic và kiến thức cơ bản qua toán, ngôn ngữ và giải quyết vấn đề.',
              color:'from-emerald-100 to-emerald-50 text-emerald-700',
              points:['Tư duy định lượng, ngôn ngữ, giải quyết vấn đề','Phù hợp xét tuyển nhiều trường','Bài thi tổng hợp, thời lượng 150–180 phút']
            },
            {
              icon:Target,
              label:'Kỳ thi đánh giá năng lực V-ACT',
              desc:'Kiểm tra khả năng tư duy và giải quyết vấn đề qua các câu hỏi logic, toán và ngôn ngữ.',
              color:'from-sky-100 to-sky-50 text-sky-700',
              points:['Tích hợp logic + toán + ngôn ngữ','Chú trọng ứng dụng và phân tích','Thang điểm quy đổi theo chuẩn']
            },
            {
              icon:Star,
              label:'Kỳ thi đánh giá năng lực TSA',
              desc:'Đánh giá tư duy phản biện, giải quyết vấn đề và phân tích logic của thí sinh.',
              color:'from-rose-100 to-rose-50 text-rose-700',
              points:['Nặng về đọc hiểu và lập luận','Câu hỏi tình huống, phản biện','Phù hợp định hướng quốc tế']
            }].map((c,i)=>{
              const Icon = c.icon as any
              return (
                <div key={i} className={`rounded-xl border border-slate-200 bg-gradient-to-b ${c.color} p-4 hover:shadow-md transition-transform hover:-translate-y-0.5`}> 
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/70 p-2"><Icon className="h-5 w-5"/></div>
                    <div className="min-w-0">
                      <div className="font-semibold">{c.label}</div>
                      <p className="mt-1 text-sm opacity-90 leading-snug">{c.desc}</p>
                      {'points' in c && Array.isArray((c as any).points) && (
                        <ul className="mt-2 space-y-1 text-xs text-slate-700/90 list-disc list-inside">
                          {(c as any).points.map((p: string, idx: number) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Featured PDF Exams */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Đề PDF nổi bật</h2>
            <a href="/public/pdfs" className="text-sm text-indigo-600 hover:text-indigo-700">Xem tất cả</a>
          </div>
          <FeaturedPdfs />
        </section>

        {/* Trò chuyện với AI (phong cách giống modal trước) */}
        <section className="mb-10">
          <div className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-[0_20px_40px_-20px_rgba(2,6,23,0.2)] ring-1 ring-slate-200/70 min-h-[30vh]">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-4 py-3 text-white shadow-inner">
              <div className="flex items-center gap-2 font-semibold tracking-tight"><BrainCircuit className="h-5 w-5"/> Trò chuyện với AI</div>
            </div>
            <div ref={chatRef} className="px-4 pb-4 bg-gradient-to-b from-white to-slate-50 overflow-y-auto resize-y min-h-[24vh] max-h-[60vh]">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center text-sm text-slate-500" style={{ minHeight: '20vh' }}>
                  Chưa có tin nhắn. Hãy nhập câu hỏi để bắt đầu.
                </div>
              ) : (
                <div className="grid gap-2">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`max-w-[90%] md:max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${m.role==='user' ? 'self-end bg-indigo-600 text-white ml-auto' : 'self-start bg-white text-slate-900 border border-slate-200'}`}>
                      {m.imageUrl ? (
                        <div className="mb-2">
                          <img src={m.imageUrl} alt="attached" className={`max-h-56 rounded ${m.role==='user' ? 'ring-1 ring-indigo-300' : 'ring-1 ring-slate-200'}`} />
                        </div>
                      ) : null}
                      <div className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</div>
                    </div>
                  ))}
                  {sending && (
                    <div className="self-start bg-slate-100 text-slate-600 rounded-2xl px-3 py-2 text-sm inline-flex items-center gap-2">
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="border-t border-slate-200/70 bg-white/80 backdrop-blur px-4 py-3">
              {imageFile ? (
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded border">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-slate-600 truncate max-w-[60%]">{imageFile.name}</div>
                  <button
                    className="ml-auto grid place-items-center h-8 w-8 rounded-full text-red-600 hover:bg-red-50 border border-red-200"
                    aria-label="Xóa ảnh"
                    title="Xóa ảnh"
                    onClick={()=> setImageFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <div className="relative flex items-end gap-2">
                <label className="cursor-pointer grid place-items-center p-2 rounded text-slate-600 hover:bg-slate-100" title="Đính kèm ảnh" aria-label="Đính kèm ảnh">
                  <ImageIcon className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e)=> setImageFile(e.target.files?.[0] || null)} />
                </label>
                <textarea
                  value={composer}
                  onChange={(e)=> setComposer(e.target.value)}
                  onKeyDown={(e)=>{
                    if(e.key==='Enter' && !e.shiftKey){
                      e.preventDefault()
                      if (composer.trim() || imageFile) sendChat()
                    }
                  }}
                  placeholder="Nhập câu hỏi hoặc gửi ảnh bài tập vào đây…"
                  className="w-full rounded-2xl border border-slate-300 bg-white/90 backdrop-blur px-3 pr-12 py-3 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none shadow-sm"
                  rows={1}
                />
                <Button
                  onClick={sendChat}
                  disabled={sending || (!composer.trim() && !imageFile)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                  aria-label="Gửi"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-1 text-center text-xs text-slate-500">Phản hồi AI bằng tiếng Việt. Không cần đăng nhập.</div>
            </div>
          </div>
        </section>

        {/* Top exams (by attempts) */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Top đề thi</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items
              .slice()
              .sort((a,b)=> (b.attempts||0) - (a.attempts||0))
              .slice(0, 4)
              .map((exam) => (
              <Card key={`top-${exam.id}`} className="p-5 border-slate-200 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <a href={`/public/exam/${exam.id}/take`} className="text-base font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer">{exam.title}</a>
                    <Badges exam={exam} />
                  </div>
                    {exam.description && (
                      <p className="mb-3 text-slate-600">{exam.description}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">Môn thi:</span>
                        <span>{exam.subject?.name || exam.class_room?.subject?.name || 'Không rõ'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <GraduationCap className="h-4 w-4" />
                        <span className="font-medium">Lớp:</span>
                        <span>{exam.clazz?.name || exam.class_room?.name || 'Không rõ'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Số câu hỏi:</span>
                        <span>{(exam as any)?.questions_count ?? 'Không rõ'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Mã đề:</span>
                        <span>{exam.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="font-medium">Thời lượng:</span>
                        <span>{exam.duration_minutes ? `${exam.duration_minutes} phút` : formatDuration(exam.start_time, exam.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">Số lượt làm:</span>
                        <span>{exam.attempts ?? 0}</span>
                      </div>
                      {(() => { const d = (exam as any)?.download_count ?? (exam as any)?.downloads; return (typeof d === 'number' && d >= 0) ? (
                        <div className="flex items-center gap-2 text-slate-700">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">Lượt tải:</span>
                          <span>{d}</span>
                        </div>
                      ) : null })()}
                    </div>
                  </div>
                <div className="ml-4 flex flex-col gap-2">
                  <a href={`/public/exam/${exam.id}/take`} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Làm bài</a>
                  <button onClick={()=> copyExamLink(exam.id)} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Sao chép liên kết</button>
                  <button onClick={()=> setQuickView(exam)} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Xem nhanh</button>
                </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* New exams */}
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
            <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Khối lớp</label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : ''
                    setGrade(val as any)
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Tất cả khối</option>
                  {Array.from({length:12}, (_,i)=> i+1).map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Năm</label>
                <select
                  value={year}
                  onChange={(e)=> setYear(e.target.value? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Tất cả năm</option>
                  {[2025,2024,2023,2022].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sắp xếp</label>
                <select
                  value={sortBy}
                  onChange={(e)=> setSortBy(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="most">Làm nhiều</option>
                  <option value="az">A → Z</option>
                  <option value="views">Lượt xem</option>
                  <option value="questions">Số câu hỏi</option>
                  <option value="duration">Thời lượng</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Độ khó</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={5} value={difficultyMin as any} onChange={(e)=> setDifficultyMin(e.target.value ? Number(e.target.value) : '')} placeholder="Min"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  <span className="text-slate-500">-</span>
                  <input type="number" min={1} max={5} value={difficultyMax as any} onChange={(e)=> setDifficultyMax(e.target.value ? Number(e.target.value) : '')} placeholder="Max"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Chương</label>
                <input type="text" value={chapter} onChange={(e)=> setChapter(e.target.value)} placeholder="Ví dụ: Hình học không gian"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
                <input type="text" value={tags} onChange={(e)=> setTags(e.target.value)} placeholder="vd: đạo hàm, lượng giác"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                <div className="mt-1 text-xs text-slate-500">Phân tách bằng dấu phẩy</div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Thời lượng (phút)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} value={durationMin as any} onChange={(e)=> setDurationMin(e.target.value ? Number(e.target.value) : '')} placeholder="Từ"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  <span className="text-slate-500">-</span>
                  <input type="number" min={0} value={durationMax as any} onChange={(e)=> setDurationMax(e.target.value ? Number(e.target.value) : '')} placeholder="Đến"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Kích thước trang</label>
                <select value={perPage} onChange={(e)=> setPerPage(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  {[6,12,24,48].map(n => <option key={n} value={n}>{n} / trang</option>)}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="rounded-lg border border-slate-300 bg-white text-slate-900 px-4 py-2 text-sm hover:bg-slate-50">Áp dụng lọc</Button>
                <Button variant="outline" onClick={clearFilters} className="rounded-lg border border-slate-300 bg-white text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">Xóa lọc</Button>
              </div>
            </div>
          )}
        </Card>

        <section className="mb-5">
          <div className="mb-2 text-slate-800 font-medium">Danh mục</div>
          <div className="flex flex-wrap gap-2">
            <a href="#explore" className="rounded-full px-3 py-1.5 text-sm border border-slate-300 text-slate-700 hover:bg-slate-50">Đề thi</a>
            <a href="#featured" className="rounded-full px-3 py-1.5 text-sm border border-amber-300 text-amber-700 hover:bg-amber-50">Kỳ thi nổi bật</a>
            <a href="/public/pdfs" className="rounded-full px-3 py-1.5 text-sm border border-indigo-300 text-indigo-700 hover:bg-indigo-50">Thư viện PDF</a>
            <a href="#contact" className="rounded-full px-3 py-1.5 text-sm border border-slate-300 text-slate-700 hover:bg-slate-50">Liên hệ</a>
          </div>
        </section>

        <h2 className="mb-3 text-lg font-semibold text-slate-900">Đề thi mới</h2>
        <div className="mb-3 text-sm text-slate-600">{loadingList ? 'Đang lọc…' : `Có ${items.length} đề phù hợp`}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {loadingList ? (
            Array.from({length:6}).map((_,i)=> (
              <div key={`skeleton-${i}`} className="h-36 rounded-lg border border-slate-200 bg-white animate-pulse" />
            ))
          ) : items.slice(0, visibleCount).map((exam) => (
            <Card key={exam.id} className="p-5 border-slate-200 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer">{exam.title}</h3>
                    <Badges exam={exam} />
                  </div>
                  {exam.description && (
                    <p className="mb-3 text-slate-600">{exam.description}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">Môn thi:</span>
                      <span>{exam.subject?.name || exam.class_room?.subject?.name || 'Không rõ'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">Lớp:</span>
                      <span>{exam.clazz?.name || exam.class_room?.name || 'Không rõ'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Số câu hỏi:</span>
                      <span>{(exam as any)?.questions_count ?? 'Không rõ'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Số lượt nộp:</span>
                      <span>{exam.submissions ? exam.submissions.length : 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-medium">Thời lượng:</span>
                      <span>{exam.duration_minutes ? `${exam.duration_minutes} phút` : formatDuration(exam.start_time, exam.end_time)}</span>
                    </div>
                    {(() => { const d = (exam as any)?.download_count ?? (exam as any)?.downloads; return (typeof d === 'number' && d >= 0) ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Lượt tải:</span>
                        <span>{d}</span>
                      </div>
                    ) : null })()}
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <a href={`/public/exam/${exam.id}/take`} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Làm bài</a>
                  <button onClick={()=> copyExamLink(exam.id)} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Sao chép liên kết</button>
                  <button onClick={()=> setQuickView(exam)} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Xem nhanh</button>
                </div>
              </div>
            </Card>
          ))}
          {!loadingList && items.length === 0 && (
            <div className="text-center py-12 text-slate-600 col-span-full">
              Không có đề phù hợp. Gợi ý thử:
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
                {['Toán 2024','Vật lý Lớp 12','Hóa học Hữu cơ','Tiếng Anh THPT','Sinh học Di truyền'].map((s,i)=> (
                  <button key={`sug-${i}`} onClick={()=> { setSearchTerm(s); setShowFilters(false); handleSearch(); }} className="rounded-full border px-3 py-1 hover:bg-slate-50">{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        {meta ? (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">Trang {meta.current_page} / {meta.last_page} • Tổng {meta.total} đề</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={()=> goToPage(Math.max(1, (meta?.current_page||1) - 1))} disabled={meta.current_page <= 1}>Trước</Button>
              <Button variant="outline" onClick={()=> goToPage(Math.min(meta.last_page, meta.current_page + 1))} disabled={meta.current_page >= meta.last_page}>Sau</Button>
            </div>
          </div>
        ) : (
          !loadingList && items.length > visibleCount && (
            <div className="text-center mt-7">
              <Button variant="outline" onClick={() => setVisibleCount(c => c + 10)}>Xem thêm</Button>
            </div>
          )
        )}
        
        {/* Top người thi (dữ liệu thật) */}
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Top người thi</h2>
          <LeaderboardLive />
        </section>
      </main>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2 shadow-lg border ${toast.type==='success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'}`}>
          {toast.msg}
        </div>
      )}

      {quickView && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=> setQuickView(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold text-slate-900 truncate pr-3">{quickView.title}</div>
              <button onClick={()=> setQuickView(null)} className="rounded-md border px-3 py-1.5 hover:bg-slate-50">Đóng</button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700"><BookOpen className="h-4 w-4"/><span className="font-medium">Môn:</span><span>{quickView.subject?.name || quickView.class_room?.subject?.name || 'Không rõ'}</span></div>
              <div className="flex items-center gap-2 text-slate-700"><GraduationCap className="h-4 w-4"/><span className="font-medium">Lớp:</span><span>{quickView.clazz?.name || quickView.class_room?.name || 'Không rõ'}</span></div>
              <div className="flex items-center gap-2 text-slate-700"><FileText className="h-4 w-4"/><span className="font-medium">Số câu hỏi:</span><span>{(quickView as any)?.questions_count ?? 'Không rõ'}</span></div>
              <div className="flex items-center gap-2 text-slate-700"><Star className="h-4 w-4"/><span className="font-medium">Lượt làm:</span><span>{quickView.attempts ?? (quickView.submissions ? quickView.submissions.length : 0)}</span></div>
              <div className="flex items-center gap-2 text-slate-700"><span className="font-medium">Thời lượng:</span><span>{quickView.duration_minutes ? `${quickView.duration_minutes} phút` : formatDuration(quickView.start_time, quickView.end_time)}</span></div>
              {(() => { const y = new Date(quickView.start_time).getFullYear(); return Number.isFinite(y) ? (
                <div className="flex items-center gap-2 text-slate-700"><span className="font-medium">Năm:</span><span>{y}</span></div>
              ) : null })()}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <a href={`/public/exam/${quickView.id}/take`} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Mở đề</a>
              <button onClick={()=> copyExamLink(quickView.id)} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Sao chép liên kết</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="mt-10 border-t border-slate-200/70 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-slate-600">
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <div className="h-7 w-7 rounded-md bg-indigo-600 grid place-items-center text-white"><GraduationCap className="h-4 w-4"/></div>
              Ngân hàng đề thi
            </div>
            <p className="mb-3">Nền tảng làm đề thi trực tuyến miễn phí, phù hợp học sinh THCS/THPT.</p>
            <div className="flex gap-2">
              <a className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50" href="#featured">Khám phá</a>
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
            <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> hadv9x@gmail.com</div>
            <div className="flex items-center gap-2 mt-1"><Phone className="h-4 w-4"/> 0397368768</div>
            <div className="flex items-center gap-2 mt-1"><Globe className="h-4 w-4"/> www.smartclass.ai</div>
          </div>
        </div>
        <div className="border-t border-slate-200/70 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} SmartClass. Đã đăng ký bản quyền.</div>
      </footer>
    </div>
  )
}

function FeaturedPdfs() {
  const [items, setItems] = useState<Array<{ id:number; title:string; pdf_url:string; subject?:{name:string}; clazz?:{name:string}; category?:string; file_size_bytes?:number; download_count?:number; view_count?:number }>>([])
  const tagBase = "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border"
  const subjectTagClass = (name?: string) => {
    const n = (name || '').toLowerCase()
    if (n.includes('toán')) return `${tagBase} bg-blue-50 text-blue-700 border-blue-100`
    if (n.includes('vật') || n.includes('ly') || n.includes('lý')) return `${tagBase} bg-amber-50 text-amber-800 border-amber-200`
    if (n.includes('hóa')) return `${tagBase} bg-emerald-50 text-emerald-700 border-emerald-100`
    if (n.includes('sinh')) return `${tagBase} bg-green-50 text-green-700 border-green-100`
    return `${tagBase} bg-slate-100 text-slate-700 border-slate-200`
  }
  const classTagClass = (name?: string) => {
    const n = (name || '').toLowerCase()
    if (n.includes('12')) return `${tagBase} bg-sky-50 text-sky-700 border-sky-100`
    if (n.includes('11')) return `${tagBase} bg-cyan-50 text-cyan-700 border-cyan-100`
    if (n.includes('10')) return `${tagBase} bg-teal-50 text-teal-700 border-teal-100`
    return `${tagBase} bg-slate-100 text-slate-700 border-slate-200`
  }
  const categoryTagClass = (name?: string) => {
    const n = (name || '').toLowerCase()
    if (n.includes('đại học') || n.includes('dai hoc')) return `${tagBase} bg-indigo-50 text-indigo-700 border-indigo-100`
    if (n.includes('giữa') || n.includes('giua')) return `${tagBase} bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100`
    if (n.includes('cuối') || n.includes('cuoi')) return `${tagBase} bg-violet-50 text-violet-700 border-violet-100`
    return `${tagBase} bg-slate-100 text-slate-700 border-slate-200`
  }
  const [active, setActive] = useState<typeof items[number] | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toPublicUrl = (pdfUrl: string) => {
    if (!pdfUrl) return '#'
    if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl
    return `/storage/${pdfUrl.replace(/^\/?storage\//i, '')}`
  }
  const copyPdfLink = (url: string) => {
    const link = toPublicUrl(url)
    navigator.clipboard.writeText(`${window.location.origin}${link.startsWith('/') ? '' : '/'}${link}`)
      .then(()=> { setToast({ msg: 'Đã sao chép liên kết PDF', type: 'success' }); setTimeout(()=> setToast(null), 2000) })
      .catch(()=> { setToast({ msg: 'Sao chép thất bại. Thử lại.', type: 'error' }); setTimeout(()=> setToast(null), 2000) })
  }
  useEffect(()=>{ (async()=>{ try { const { data } = await api.get('/public/exam-pdfs'); setItems((data?.data||[]).slice(0,6)) } catch {} })() }, [])
  const incrementView = async (id: number) => {
    try {
      await api.get(`/public/exam-pdfs/${id}/view`)
    } catch {}
    // Optimistically update count locally
    setItems(prev => prev.map(it => it.id === id ? { ...it, view_count: (it.view_count || 0) + 1 } as any : it))
  }
  const downloadViaApi = (item: { id: number; pdf_url: string }) => {
    // Optimistically update count locally
    setItems(prev => prev.map(it => it.id === item.id ? { ...it, download_count: (it.download_count || 0) + 1 } as any : it))
    api.get(`/public/exam-pdfs/${item.id}/download`).finally(() => {
      const url = toPublicUrl(item.pdf_url)
      window.open(url, '_blank')
    })
  }
  if (!items?.length) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({length:6}).map((_,i)=> <div key={i} className="h-24 rounded-lg border border-slate-200 bg-white animate-pulse" />)}
    </div>
  )
  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full px-4 py-2 shadow-lg border ${toast.type==='success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'}`}>
          {toast.msg}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(it => (
          <div key={it.id} className="text-left rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition">
            <div className="font-medium line-clamp-2">{it.title}</div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
              <span className={subjectTagClass(it.subject?.name)}>{it.subject?.name || 'Môn?'}</span>
              <span className={classTagClass(it.clazz?.name)}>{it.clazz?.name || 'Khối?'}</span>
              {it.category ? (<span className={categoryTagClass(it.category)}>{it.category}</span>) : null}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {it.file_size_bytes ? `${(it.file_size_bytes/1024/1024).toFixed(2)} MB` : ''}
              {(typeof it.view_count === 'number' || typeof it.download_count === 'number') && (
                <>
                  {it.file_size_bytes ? ' · ' : ''}
                  <span>{(it.view_count ?? 0)} lượt xem</span>
                  {' · '}
                  <span>{(it.download_count ?? 0)} lượt tải</span>
                </>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={()=> { setActive(it); incrementView(it.id) }} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Xem nhanh</button>
              <button onClick={()=> copyPdfLink(it.pdf_url)} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Sao chép liên kết</button>
              <button onClick={()=> downloadViaApi(it)} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Tải về</button>
            </div>
          </div>
        ))}
      </div>
      {active && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=> setActive(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-medium text-slate-900 truncate pr-3">{active.title}</div>
              <div className="flex items-center gap-2">
                <a href={toPublicUrl(active.pdf_url)} target="_blank" rel="noreferrer" className="text-sm rounded-md border px-3 py-1.5 hover:bg-slate-50">Mở tab mới</a>
                <button onClick={()=> copyPdfLink(active.pdf_url)} className="text-sm rounded-md border px-3 py-1.5 hover:bg-slate-50">Sao chép liên kết</button>
                <button onClick={()=> setActive(null)} className="rounded-md border px-3 py-1.5 hover:bg-slate-50">Đóng</button>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 overflow-auto">
              {/* Lightweight fallback: use iframe for featured modal to keep bundle small on homepage */}
              <iframe title="PDF Preview" src={toPublicUrl(active.pdf_url)} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function LeaderboardLive() {
  const tabs = [
    { key: 'most', label: 'Nhiều bài thi nhất' },
    { key: 'score', label: 'Điểm trung bình cao nhất' },
    { key: 'recent', label: 'Hoạt động gần đây' },
  ] as const
  const [active, setActive] = useState<(typeof tabs)[number]['key']>('most')
  const [data, setData] = useState<{ most: any[]; score: any[]; recent: any[] }>({ most: [], score: [], recent: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const res = await api.get('/public/leaderboard')
        setData(res.data || { most: [], score: [], recent: [] })
      } catch {
        setData({ most: [], score: [], recent: [] })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const rows = data[active] || []

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`rounded-full px-3 py-1.5 text-sm border ${active === t.key ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-sm text-slate-500">Đang tải…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rows.map((u, i) => (
            <Card key={`${active}-${i}`} className="p-4 border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full ring-2 ring-slate-200" />
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 truncate">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.value} {u.note}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
