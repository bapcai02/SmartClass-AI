import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftCircle, CalendarClock, Timer, Users } from 'lucide-react'
import { getClassExam, type ExamDto } from '@/api/exams'

export default function ExamDetailPage() {
  const { id, eid } = useParams()
  const [exam, setExam] = useState<ExamDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getClassExam(id as string, eid as string)
        setExam(data)
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load exam')
      } finally { setLoading(false) }
    })()
  }, [id, eid])

  const duration = useMemo(() => {
    if (!exam?.start_time) return null
    const s = new Date(exam.start_time)
    const e = exam.end_time ? new Date(exam.end_time) : null
    if (!e) return null
    const mins = Math.max(1, Math.round((e.getTime() - s.getTime()) / 60000))
    return `${mins} mins`
  }, [exam])

  return (
    <div className="grid gap-6">
      <div>
        <Link
          to={`/class/${id}/exams`}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <ArrowLeftCircle className="h-4 w-4 transition-colors group-hover:text-brand-blue"/>
          Back to Exams
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{exam?.title || 'Exam'}</span>
            {!loading && !error && (
              <div className="text-sm text-slate-600">#{exam?.id}</div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          {loading ? (
            <div className="text-sm text-slate-600">Loading…</div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-slate-700"><CalendarClock className="h-4 w-4"/> <span>Start: {exam?.start_time?.replace('T',' ').slice(0,16) || '—'}</span></div>
                <div className="flex items-center gap-2 text-slate-700"><Timer className="h-4 w-4"/> <span>End: {exam?.end_time?.replace('T',' ').slice(0,16) || '—'}</span></div>
                <div className="flex items-center gap-2 text-slate-700"><Users className="h-4 w-4"/> <span>Duration: {duration || '—'}</span></div>
              </div>
              {exam?.description && (
                <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700 whitespace-pre-wrap">{exam.description}</div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


