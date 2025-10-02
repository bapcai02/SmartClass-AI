import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, BookOpen, GraduationCap, FileText, Star, Layers3, BrainCircuit, Target, Mail, Phone, Globe, Image as ImageIcon, Send, Calculator, Atom, FlaskConical, Dna, Landmark, Globe2 } from 'lucide-react'
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
  const [visibleCount, setVisibleCount] = useState(10)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [composer, setComposer] = useState('')
  const [sending, setSending] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  // chat moved inline above Top đề thi
  const subjectTabs = [
    { key: 'toan', label: 'Toán', icon: Calculator },
    { key: 'ly', label: 'Vật lý', icon: Atom },
    { key: 'hoa', label: 'Hóa học', icon: FlaskConical },
    { key: 'sinh', label: 'Sinh học', icon: Dna },
    { key: 'su', label: 'Lịch sử', icon: Landmark },
    { key: 'dia', label: 'Địa lý', icon: Globe2 },
  ] as const
  const [activeTab, setActiveTab] = useState<(typeof subjectTabs)[number]['key']>('toan')
  
  type ChatMessage = { role: 'user' | 'assistant'; content: string }

  useEffect(() => {
    load()
    ;(async () => {
      try {
        const s = await api.get('/public/subjects').then(r => r.data as Array<{id:number; name:string}>)
        setSubjects(s)
      } catch {}
    })()
  }, [])

  const load = async (params: Record<string, any> = {}) => {
    const { data } = await api.get('/public/question-bank', { params })
    const items = (data?.data as PublicExam[]) || []
    setItems(items)
    try { } catch {}
  }

  const handleSearch = () => {
    load({ 
      search: searchTerm || undefined,
      subject_id: subjectId || undefined,
      grade: grade || undefined,
    })
  }

  async function sendChat() {
    const text = composer.trim()
    if (!text && !imageFile) return
    setSending(true)
    setMessages(prev => [...prev, { role: 'user', content: text || '[Ảnh]' }])
    try {
      const form = new FormData()
      if (text) form.append('message', text)
      else form.append('message', 'Giải thích nội dung ảnh giúp tôi bằng tiếng Việt')
      if (imageFile) form.append('image', imageFile)
      const { data } = await api.post('/public/ai/chat', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const resp = (data?.response || data?.error || 'Không có phản hồi') as string
      setMessages(prev => [...prev, { role: 'assistant', content: resp }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi ủy quyền hoặc kết nối. Vui lòng thử lại.' }])
    } finally {
      setSending(false)
      setComposer('')
      setImageFile(null)
    }
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
            <a href="#contact" className="hover:text-slate-900">Liên hệ</a>
          </nav>
          <div className="flex items-center gap-2"/>
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
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">Áp dụng lọc</Button>
              </div>
            </div>
          )}
        </Card>

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

        {/* Trò chuyện với AI (phong cách giống modal trước) */}
        <section className="mb-10">
          <div className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-[0_20px_40px_-20px_rgba(2,6,23,0.2)] ring-1 ring-slate-200/70 min-h-[30vh]">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-4 py-3 text-white shadow-inner">
              <div className="flex items-center gap-2 font-semibold tracking-tight"><BrainCircuit className="h-5 w-5"/> Trò chuyện với AI</div>
            </div>
            <div className="px-4 pt-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {subjectTabs.map(t => {
                  const Icon = t.icon as any
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border transition-shadow ${activeTab===t.key ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <Icon className="h-4 w-4" /> {t.label}
                    </button>
                  )
                })}
              </div>
              
            </div>
            <div className="h-[24vh] overflow-y-auto px-4 pb-4 bg-gradient-to-b from-white to-slate-50">
              <div className="grid gap-2">
                {messages.length === 0 ? (
                  <div className="text-sm text-slate-500">Hãy nhập câu hỏi của bạn ở bên dưới để bắt đầu trò chuyện.</div>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} className={`${m.role==='user' ? 'ml-auto' : 'mr-auto'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow ${m.role==='user' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white' : 'bg-white/90 text-slate-800 border border-slate-200 backdrop-blur'}`}>{m.content}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="border-t border-slate-200/70 bg-white/80 backdrop-blur px-4 py-3">
              <div className="relative flex items-end gap-2">
                <label className="absolute left-3 bottom-3 cursor-pointer text-slate-500 hover:text-slate-700">
                  <input type="file" accept="image/*" className="hidden" onChange={(e)=> setImageFile(e.target.files?.[0] || null)} />
                  <ImageIcon className="h-5 w-5" />
                </label>
                <textarea
                  value={composer}
                  onChange={(e)=> setComposer(e.target.value)}
                  onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendChat() } }}
                  placeholder="Nhập câu hỏi hoặc gửi ảnh bài tập vào đây…"
                  className="w-full rounded-2xl border border-slate-300 bg-white/90 backdrop-blur pl-10 pr-12 py-3 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none shadow-sm"
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
                    </div>
                  </div>
                  <div className="ml-4">
                    <a href={`/public/exam/${exam.id}/take`} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Làm bài</a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* New exams */}
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Đề thi mới</h2>
        <div className="grid gap-4">
          {items.slice(0, visibleCount).map((exam) => (
            <Card key={exam.id} className="p-5 border-slate-200 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer">{exam.title}</h3>
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
                  </div>
                </div>
                <div className="ml-4">
                  <a href={`/public/exam/${exam.id}/take`} className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Làm bài</a>
                </div>
              </div>
            </Card>
          ))}
          {items.length > visibleCount && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setVisibleCount(c => c + 10)}>Xem thêm</Button>
            </div>
          )}
          {items.length === 0 && (
            <div className="text-center py-12 text-slate-600">Không có đề phù hợp</div>
          )}
        </div>

        {/* Top người thi (dữ liệu thật) */}
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Top người thi</h2>
          <LeaderboardLive />
        </section>
      </main>

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
            <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> support@example.com</div>
            <div className="flex items-center gap-2 mt-1"><Phone className="h-4 w-4"/> 0123 456 789</div>
            <div className="flex items-center gap-2 mt-1"><Globe className="h-4 w-4"/> www.smartclass.ai</div>
          </div>
        </div>
        <div className="border-t border-slate-200/70 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} SmartClass. Đã đăng ký bản quyền.</div>
      </footer>
    </div>
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
