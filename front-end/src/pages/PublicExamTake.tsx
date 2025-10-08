import { useEffect, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Sparkles, X, Image as ImageIcon } from 'lucide-react'
import api from '@/utils/api'

type PublicChoice = { id: number; label: string; content: string; is_correct?: boolean }
type PublicQuestion = { id: number; content: string; choices: PublicChoice[] }
type PublicExamDetail = {
  id: number
  title: string
  description?: string | null
  public_subject_id?: number
  public_class_id?: number
  duration_minutes?: number
  questions?: PublicQuestion[]
}

export default function PublicExamTakePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState<PublicExamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [remaining, setRemaining] = useState<number>(0)
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [aiQ, setAiQ] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAi, setShowAi] = useState(false)
  type ChatMessage = { role: 'user' | 'assistant'; content: string; imageUrl?: string }
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [aiImage, setAiImage] = useState<File | null>(null)
  const [answers, setAnswers] = useState<Record<number, string | null>>({})
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/public/exams/${id}`)
        setExam(data as any)
      } catch (e: any) {
        setError(e?.message || 'Lỗi tải đề thi')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  useEffect(() => {
    if (!started) return
    const timer = setInterval(() => {
      setRemaining((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [started])

  useEffect(() => {
    if (remaining === 0 && started) {
      alert('Hết thời gian! Bài thi sẽ được nộp (demo).')
      setStarted(false)
    }
  }, [remaining, started])

  function getPlannedDurationSeconds(): number {
    if (typeof exam?.duration_minutes === 'number' && exam.duration_minutes > 0) {
      return exam.duration_minutes * 60
    }
    return 90 * 60
  }

  function isValidEmail(v: string) {
    return /.+@.+\..+/.test(v)
  }

  function formatHMS(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return (h ? `${String(h).padStart(2, '0')}:` : '') + `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function renderMath(text: string) {
    try {
      const escapeHtml = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

      if (!text) return ''

      // Case 1: has explicit $...$ segments → render inline parts
      if (text.includes('$')) {
        const parts = text.split('$')
        const fragments = parts.map((p, idx) => {
          if (idx % 2 === 1) {
            try { return katex.renderToString(p, { throwOnError: false }) } catch { return escapeHtml(p) }
          }
          return escapeHtml(p)
        })
        return fragments.join('')
      }

      // Case 2: no $, but looks like TeX → try render whole string
      const looksLikeTex = /\\[a-zA-Z]+|\\frac|\\sqrt|\\pi|\\cdot|\^|_|\{|\}/.test(text)
      if (looksLikeTex) {
        try {
          return katex.renderToString(text, { throwOnError: false })
        } catch {
          return escapeHtml(text)
        }
      }

      // Plain text
      return escapeHtml(text)
    } catch {
      return text
    }
  }

  async function askPublicAi(msg: string) {
    try {
      setAiLoading(true)
      const optimistic: ChatMessage = { role: 'user', content: msg || (aiImage ? '[Ảnh]' : '') }
      if (aiImage) {
        try { optimistic.imageUrl = URL.createObjectURL(aiImage) } catch {}
      }
      setMessages(prev => [...prev, optimistic])
      // Clear composer and preview immediately so they don't stay above the reply
      setAiQ('')
      setAiImage(null)
      const form = new FormData()
      form.append('message', msg || 'Phân tích nội dung ảnh (đề/bài tập). Nêu rõ dữ kiện, yêu cầu; giải từng bước bằng tiếng Việt; dùng LaTeX cho công thức; nếu nhiều câu thì đánh số và trả lời lần lượt.')
      // Note: use the original File reference captured before clearing
      if (optimistic.imageUrl) {
        // If we had an image, it was present in the optimistic message;
        // Use the last selected file from the event (kept in closure) if available
      }
      if (aiImage) form.append('image', aiImage)
      const { data } = await api.post('/public/ai/chat', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const resp = data?.response || data?.error || 'Không có phản hồi'
      setMessages(prev => [...prev, { role: 'assistant', content: resp }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Đã xảy ra lỗi, vui lòng thử lại.' }])
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return <div className="mx-auto max-w-3xl p-6">Đang tải đề thi…</div>
  if (error) return <div className="mx-auto max-w-3xl p-6 text-red-600">{error}</div>
  if (!exam) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Sticky header with timer and progress */}
      <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">Bài thi công khai</div>
            <h1 className="text-lg font-semibold text-slate-900 truncate">{exam.title}</h1>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm ${started ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
            <Clock className="h-4 w-4" /> {formatHMS(remaining)}
          </div>
        </div>
        <div className="h-1 w-full bg-slate-100">
          <div
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${Math.max(0, Math.min(100, started ? (100 * remaining) / getPlannedDurationSeconds() : 0))}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {exam.description && <p className="mb-4 text-slate-600 leading-relaxed">{exam.description}</p>}

        {/* Nút mở trợ lý AI (bên trái) */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
          <button
            aria-label="Mở trợ lý AI"
            onClick={() => setShowAi(true)}
            className="h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 px-5 inline-flex items-center gap-2 animate-pulse-glow"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Hỏi AI</span>
          </button>
        </div>

        {/* Panel trợ lý AI */}
        {showAi && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAi(false)}></div>
            <div className="absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-r border-slate-200 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <div className="font-semibold text-slate-900">Trợ lý AI</div>
                <button aria-label="Đóng" className="p-2 rounded hover:bg-slate-100" onClick={() => setShowAi(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3 space-y-3 flex-1 flex flex-col min-h-0">
                <div className="text-xs text-slate-500">Hỏi AI về cách tiếp cận, mẹo làm bài, gợi ý ôn tập…</div>
                <div className="flex-1 overflow-y-auto border border-slate-100 rounded-md p-2 bg-slate-50 flex flex-col gap-2 min-h-0">
                  {messages?.length ? messages.map((m, idx) => (
                    <div key={idx} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='user' ? 'self-end bg-indigo-600 text-white ml-auto' : 'self-start bg-slate-100 text-slate-800'}`}>
                      {m.imageUrl ? (
                        <div className="mb-2">
                          <img src={m.imageUrl} alt="attached" className={`max-h-48 rounded ${m.role==='user' ? 'ring-1 ring-indigo-300' : 'ring-1 ring-slate-200'}`} />
                        </div>
                      ) : null}
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  )) : (
                    <div className="text-xs text-slate-500">Chưa có tin nhắn.</div>
                  )}
                </div>
                {aiImage ? (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded border">
                      <img src={URL.createObjectURL(aiImage)} alt="preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="text-xs text-slate-600 truncate max-w-[60%]">{aiImage.name}</div>
                    <button className="ml-auto grid place-items-center h-8 w-8 rounded-full text-red-600 hover:bg-red-50 border border-red-200" aria-label="Xóa ảnh" title="Xóa ảnh" onClick={()=> setAiImage(null)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <div className="flex items-end gap-2">
                  <label className="cursor-pointer grid place-items-center p-2 rounded text-slate-600 hover:bg-slate-100" title="Đính kèm ảnh" aria-label="Đính kèm ảnh">
                    <ImageIcon className="h-5 w-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e)=> setAiImage(e.target.files?.[0] || null)} />
                  </label>
                  <textarea
                    value={aiQ}
                    onChange={(e)=>setAiQ(e.target.value)}
                    onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if (aiQ.trim() || aiImage) askPublicAi(aiQ.trim()) }} }
                    placeholder="Đặt câu hỏi cho AI (có thể đính kèm ảnh đề/bài tập)"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-y min-h-[48px]"
                  />
                  <Button className="px-4 bg-indigo-600 text-white hover:bg-indigo-700" disabled={aiLoading || (!aiQ.trim() && !aiImage)} onClick={()=> askPublicAi(aiQ.trim())}>
                    {aiLoading ? 'Đang hỏi…' : 'Gửi'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card className="p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-slate-700 text-sm">Bài thi công khai. Chọn đáp án cho từng câu hỏi bên dưới.</div>
            <div className={`rounded-md px-3 py-1 text-sm ${remaining > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
              Còn: {formatHMS(remaining)}
            </div>
          </div>

          {!started && (
            <div className="mb-6 rounded-xl border border-slate-200 p-4 bg-white">
              <div className="text-sm text-slate-600 mb-3">Thời lượng dự kiến: {formatHMS(getPlannedDurationSeconds())}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Họ và tên</label>
                  <input
                    value={candidateName}
                    onChange={(e)=>setCandidateName(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Email</label>
                  <input
                    value={candidateEmail}
                    onChange={(e)=>setCandidateEmail(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="abc@example.com"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  disabled={!candidateName.trim() || !isValidEmail(candidateEmail)}
                  onClick={() => { setRemaining(getPlannedDurationSeconds()); setStarted(true); setStartedAt(new Date().toISOString()) }}
                >
                  Bắt đầu làm bài
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {(exam?.questions || []).map((q, idx) => {
              const sortedChoices = [...(q.choices || [])].sort((a,b)=> a.label.localeCompare(b.label))
              return (
                <div key={q.id} ref={(el) => { questionRefs.current[q.id] = el }} id={`question-${q.id}`} className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="font-medium mb-3">Câu {idx+1}. <span className="font-normal" dangerouslySetInnerHTML={{ __html: renderMath(q.content) }} /></div>
                  <div className="grid gap-2 text-sm">
                    {sortedChoices.map(opt => (
                      <label key={opt.id} className={`flex items-center gap-2 rounded-md border p-2 ${started ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-60'} border-slate-200`}>
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          value={opt.label}
                          disabled={!started}
                          checked={answers[q.id] === opt.label}
                          onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                        />
                        <span className="font-medium mr-1">{opt.label}.</span> <span dangerouslySetInnerHTML={{ __html: renderMath(opt.content) }} />
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Điều hướng câu hỏi bên phải */}
        <div className="fixed right-4 top-24 z-30 w-72">
          <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-lg">
            <div className="px-3 py-2 border-b border-slate-200 text-sm font-semibold text-slate-800">Danh sách câu</div>
            <div className="p-3 grid grid-cols-5 gap-3">
              {(exam?.questions || []).map((q, idx) => {
                const answered = !!answers[q.id]
                return (
                  <button
                    key={q.id}
                    onClick={() => questionRefs.current[q.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${answered ? 'bg-red-50 text-red-700 border-red-500 hover:bg-red-100 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                    aria-label={`Đi tới câu ${idx+1}`}
                  >
                    {idx+1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sticky bottom actions */}
        <div className="sticky bottom-0 z-20 mt-6 border-t border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">Thời lượng demo, chưa chấm điểm.</div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>Thoát</Button>
              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={!started || remaining===0}
                onClick={async () => {
                  try {
                    const elapsed = startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime())/1000)) : 0
                    const payload: any = {
                      name: candidateName,
                      email: candidateEmail,
                      attempt_no: 1,
                      duration_seconds: elapsed,
                      started_at: startedAt,
                      answers: Object.fromEntries(Object.entries(answers).filter(([_, v]) => !!v) as [string,string][]) ,
                    }
                    const { data } = await api.post(`/public/exams/${id}/submit`, payload)
                    alert(`Đã nộp bài. Điểm: ${data?.score ?? 0}`)
                  } catch (e: any) {
                    alert(e?.message || 'Nộp bài thất bại')
                  } finally {
                    setStarted(false)
                  }
                }}
              >
                Nộp bài
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
