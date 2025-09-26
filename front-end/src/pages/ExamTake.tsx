import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeftCircle, Play, Pause, Clock } from 'lucide-react'
import { submitExam } from '@/api/exams'
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
  const q = MOCK_QUESTIONS[currentIdx]

  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t as any)
  }, [running])

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

  const setAnswer = (qid: number, val: any) => setAnswers((prev) => ({ ...prev, [qid]: val }))

  const next = () => setCurrentIdx((i) => Math.min(MOCK_QUESTIONS.length - 1, i + 1))
  const prev = () => setCurrentIdx((i) => Math.max(0, i - 1))

  const handleSubmit = async () => {
    if (!me?.id) return
    try {
      await submitExam(id as string, eid as string, { student_id: me.id, answers })
      navigate(`/class/${id}/exam/${eid}`, { replace: true })
    } catch {}
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/class/${id}/exam/${eid}`}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <ArrowLeftCircle className="h-4 w-4 transition-colors group-hover:text-brand-blue"/>
          Back to Exam Detail
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
          <Clock className="h-4 w-4"/>
          <span>{timeText}</span>
          {running ? (
            <button className="text-slate-700 hover:text-slate-900" onClick={()=>setRunning(false)}><Pause className="h-4 w-4"/></button>
          ) : (
            <button className="text-slate-700 hover:text-slate-900" onClick={()=>setRunning(true)}><Play className="h-4 w-4"/></button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 text-sm text-slate-600">Question {currentIdx + 1} of {MOCK_QUESTIONS.length}</div>
            <div className="mb-4 text-base font-medium text-slate-800">{q.text}</div>
            {q.type === 'single' ? (
              <div className="grid gap-2">
                {q.options!.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 hover:bg-slate-50">
                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === opt} onChange={()=>setAnswer(q.id, opt)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[q.id] ?? ''}
                onChange={(e)=>setAnswer(q.id, e.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-slate-300 p-3"
                placeholder="Type your answer"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prev} disabled={currentIdx===0}>Previous</Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSubmit}>Save Progress</Button>
              {currentIdx < MOCK_QUESTIONS.length - 1 ? (
                <Button className="text-black hover:bg-black hover:text-white" onClick={next}>Next</Button>
              ) : (
                <Button className="text-black hover:bg-black hover:text-white" onClick={handleSubmit}>Submit</Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-slate-200 p-3">
            <div className="mb-2 text-sm font-medium text-slate-700">Question Navigator</div>
            <div className="flex flex-wrap gap-2">
              {MOCK_QUESTIONS.map((qq, i) => (
                <button
                  key={qq.id}
                  onClick={()=>setCurrentIdx(i)}
                  className={`h-9 w-9 rounded-full border text-sm ${i===currentIdx?'bg-black text-white border-black':'border-slate-300 hover:bg-slate-100'}`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


