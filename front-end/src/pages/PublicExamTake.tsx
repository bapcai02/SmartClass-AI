import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Sparkles, X } from 'lucide-react'
import api from '@/utils/api'

type PublicExamDetail = {
  id: number
  title: string
  description?: string | null
  class_id: number
  start_time?: string
  end_time?: string | null
}

export default function PublicExamTakePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState<PublicExamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [remaining, setRemaining] = useState<number>(0)
  const [aiQ, setAiQ] = useState('')
  const [aiA, setAiA] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAi, setShowAi] = useState(false)
  type ChatMessage = { role: 'user' | 'assistant'; content: string }
  const [messages, setMessages] = useState<ChatMessage[]>([])

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
    if (exam?.start_time && exam?.end_time) {
      const s = new Date(exam.start_time).getTime()
      const e = new Date(exam.end_time).getTime()
      if (!isNaN(s) && !isNaN(e) && e > s) return Math.round((e - s) / 1000)
    }
    return 90 * 60
  }

  function formatHMS(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return (h ? `${String(h).padStart(2, '0')}:` : '') + `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  async function askPublicAi(msg: string) {
    try {
      setAiLoading(true)
      setAiA('')
      setMessages(prev => [...prev, { role: 'user', content: msg }])
      const form = new FormData()
      form.append('message', msg)
      const { data } = await api.post('/public/ai/chat', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const resp = data?.response || data?.error || 'Không có phản hồi'
      setAiA(resp)
      setMessages(prev => [...prev, { role: 'assistant', content: resp }])
    } catch (e) {
      setAiA('Đã xảy ra lỗi, vui lòng thử lại.')
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
            <div className="absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-r border-slate-200 flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <div className="font-semibold text-slate-900">Trợ lý AI</div>
                <button aria-label="Đóng" className="p-2 rounded hover:bg-slate-100" onClick={() => setShowAi(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                <div className="text-xs text-slate-500">Hỏi AI về cách tiếp cận, mẹo làm bài, gợi ý ôn tập…</div>
                <div className="grid gap-2 max-h-64 overflow-y-auto border border-slate-100 rounded-md p-2 bg-slate-50">
                  {messages?.length ? messages.map((m, idx) => (
                    <div key={idx} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='user' ? 'self-end bg-indigo-600 text-white ml-auto' : 'self-start bg-slate-100 text-slate-800'}`}>
                      {m.content}
                    </div>
                  )) : (
                    <div className="text-xs text-slate-500">Chưa có tin nhắn.</div>
                  )}
                </div>
                <textarea
                  value={aiQ}
                  onChange={(e)=>setAiQ(e.target.value)}
                  placeholder="Ví dụ: Chiến lược làm bài ĐGNL phần lập luận logic"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-y min-h-[64px]"
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">Nhấn Enter để gửi, Shift+Enter để xuống dòng</div>
                  <Button className="px-4 bg-indigo-600 text-white hover:bg-indigo-700" disabled={aiLoading || !aiQ.trim()} onClick={()=> aiQ.trim() && askPublicAi(aiQ.trim())}>
                    {aiLoading ? 'Đang hỏi…' : 'Hỏi AI'}
                  </Button>
                </div>
                {!!aiA && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 whitespace-pre-wrap">
                    {aiA}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Card className="p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-slate-700 text-sm">Bài thi demo (chưa có dữ liệu câu hỏi). Bạn có thể tích hợp ngân hàng câu hỏi sau.</div>
            <div className={`rounded-md px-3 py-1 text-sm ${remaining > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
              Còn: {formatHMS(remaining)}
            </div>
          </div>

          {!started && (
            <div className="mb-6 rounded-xl border border-slate-200 p-4 bg-white">
              <div className="text-sm text-slate-600 mb-3">Thời lượng dự kiến: {formatHMS(getPlannedDurationSeconds())}</div>
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => { setRemaining(getPlannedDurationSeconds()); setStarted(true) }}>Bắt đầu làm bài</Button>
            </div>
          )}

          <div className="grid gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="rounded-xl border border-slate-200 p-4 bg-white">
                <div className="font-medium mb-3">Câu {i}. Nội dung câu hỏi mẫu</div>
                <div className="grid gap-2 text-sm">
                  {['A','B','C','D'].map(opt => (
                    <label key={opt} className={`flex items-center gap-2 rounded-md border p-2 ${started ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-60'} border-slate-200`}>
                      <input type="radio" name={`q${i}`} value={opt} disabled={!started}/> <span className="font-medium mr-1">{opt}.</span> Lựa chọn {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sticky bottom actions */}
        <div className="sticky bottom-0 z-20 mt-6 border-t border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">Thời lượng demo, chưa chấm điểm.</div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>Thoát</Button>
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={!started || remaining===0} onClick={() => { alert('Đã nộp bài (demo)'); setStarted(false) }}>Nộp bài</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


