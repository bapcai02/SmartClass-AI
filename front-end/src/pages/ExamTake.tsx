import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeftCircle, Play, Clock } from 'lucide-react'
import { submitExam, getClassExam, type ExamDto } from '@/api/exams'
import { useUser } from '@/hooks/auth'

const MOCK_QUESTIONS = [
  { id: 1, type: 'single', text: 'What is 2 + 2?', options: ['3','4','5','6'] },
  { id: 2, type: 'single', text: 'Capital of France?', options: ['Berlin','Paris','Madrid','Rome'] },
  { id: 3, type: 'text', text: 'Briefly explain polymorphism.' },
]

export default function ExamTakePage() {
  const { id, eid } = useParams()
  const navigate = useNavigate()
  const { data: me } = useUser() as any
  const [running, setRunning] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(45 * 60)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [examData, setExamData] = useState<ExamDto | null>(null)
  const [expired, setExpired] = useState(false)
  const q = MOCK_QUESTIONS[currentIdx]

  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  useEffect(() => {
    (async () => {
      try {
        const data = await getClassExam(id as string, eid as string)
        setExamData(data)
        if (data?.end_time) {
          const end = new Date(data.end_time)
          if (new Date() > end) setExpired(true)
        }
      } catch {}
    })()
  }, [id, eid])

  useEffect(() => {
    if (!running || expired) return
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t as any)
  }, [running, expired])

  useEffect(() => {
    if (secondsLeft === 0) {
      handleSubmit()
    }
  }, [secondsLeft])

  const timeText = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [secondsLeft])

  const answeredCount = useMemo(() => Object.keys(answers).filter(k => answers[Number(k)] != null && String(answers[Number(k)]).length > 0).length, [answers])
  const progressPct = useMemo(() => Math.round(100 * answeredCount / MOCK_QUESTIONS.length), [answeredCount])

  const setAnswer = (qid: number, val: any) => setAnswers((prev) => ({ ...prev, [qid]: val }))

  const next = () => setCurrentIdx((i) => Math.min(MOCK_QUESTIONS.length - 1, i + 1))
  const prev = () => setCurrentIdx((i) => Math.max(0, i - 1))

  const handleSubmit = async () => {
    if (!me?.id || expired) return
    try {
      await submitExam(id as string, eid as string, { student_id: me.id, answers })
      navigate(`/class/${id}/exam/${eid}`, { replace: true })
    } catch {}
  }

  const timerClass = secondsLeft <= 60 ? 'animate-pulse text-red-600' : 'text-slate-700'

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            to={`/class/${id}/exam/${eid}`}
            className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:shadow hover:bg-slate-100"
          >
            <ArrowLeftCircle className="h-4 w-4 transition-colors group-hover:text-brand-blue"/>
            Back to Exam Detail{examData?.title ? ` • ${examData.title}` : ''}
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-slate-600 sm:block">Answered {answeredCount}/{MOCK_QUESTIONS.length}</div>
            <div className={`inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm ${timerClass} transition-colors`}>
              <Clock className="h-4 w-4"/>
              <span className="tabular-nums">{timeText}</span>
              {!expired && (running ? (
                <button className="text-slate-700 hover:text-slate-900" onClick={()=>setRunning(false)} aria-label="Pause"><Play className="h-4 w-4 rotate-90"/></button>
              ) : (
                <button className="text-slate-700 hover:text-slate-900" onClick={()=>setRunning(true)} aria-label="Resume"><Play className="h-4 w-4"/></button>
              ))}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-slate-200">
          <div className="h-full bg-gradient-to-r from-brand-blue to-indigo-500 transition-[width] duration-500 ease-out" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 grid gap-4">
          {expired ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-800 shadow-sm">
              This exam has ended. You can no longer take or submit it.
            </div>
          ) : (
            <>
              <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-300 will-change-transform">
                <div className="mb-3 text-sm text-slate-600">Question {currentIdx + 1} of {MOCK_QUESTIONS.length}</div>
                <div className="mb-4 text-base font-medium text-slate-900">{q.text}</div>
                {q.type === 'single' ? (
                  <div className="grid gap-2">
                    {q.options!.map((opt, i) => {
                      const selected = answers[q.id] === opt
                      return (
                        <label
                          key={i}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-slate-800 shadow-sm transition-all duration-200 ${selected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 hover:bg-slate-50 hover:translate-y-0.5'}`}
                        >
                          <input type="radio" name={`q-${q.id}`} checked={selected} onChange={()=>setAnswer(q.id, opt)} disabled={expired} />
                          <span>{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <textarea
                    value={answers[q.id] ?? ''}
                    onChange={(e)=>setAnswer(q.id, e.target.value)}
                    rows={10}
                    className="w-full rounded-2xl border border-slate-300 p-3 shadow-sm focus:border-brand-blue focus:outline-none"
                    placeholder="Type your answer"
                    disabled={expired}
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" className="rounded-xl transition" onClick={prev} disabled={currentIdx===0 || expired}>Previous</Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-xl transition" onClick={handleSubmit} disabled={expired}>Save Progress</Button>
                  {currentIdx < MOCK_QUESTIONS.length - 1 ? (
                    <Button className="rounded-xl text-black transition hover:scale-[1.02] hover:bg-black hover:text-white" onClick={next} disabled={expired}>Next</Button>
                  ) : (
                    <Button className="rounded-xl text-black transition hover:scale-[1.02] hover:bg-black hover:text-white" onClick={handleSubmit} disabled={expired}>Submit</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium text-slate-700">Question Navigator</div>
            <div className="flex flex-wrap gap-2">
              {MOCK_QUESTIONS.map((qq, i) => {
                const isActive = i===currentIdx
                const isAnswered = answers[qq.id] != null && String(answers[qq.id]).length > 0
                return (
                  <button
                    key={qq.id}
                    onClick={()=>setCurrentIdx(i)}
                    className={`h-9 w-9 rounded-full border text-sm transition-transform duration-150 ${isActive ? 'bg-black text-white border-black' : isAnswered ? 'bg-brand-blue text-white border-brand-blue' : 'border-slate-300 hover:bg-slate-100'} hover:scale-105`}
                    aria-label={`Go to question ${i+1}`}
                    disabled={expired}
                  >
                    {i+1}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            <div className="mb-1 font-medium">Tips</div>
            <ul className="list-disc pl-5">
              <li>Use the navigator to jump between questions.</li>
              <li>Your progress autosaves when you press Save or Submit.</li>
              <li>Timer will auto-submit at 00:00.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


