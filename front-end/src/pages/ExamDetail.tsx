import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftCircle, CalendarClock, Timer, Users, Play } from 'lucide-react'
import { getClassExam, getClassExamStats, type ExamDto, type ExamStatsResponse } from '@/api/exams'

export default function ExamDetailPage() {
  const { id, eid } = useParams()
  const [exam, setExam] = useState<ExamDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ExamStatsResponse | null>(null)

  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getClassExam(id as string, eid as string)
        setExam(data)
        try {
          const st = await getClassExamStats(id as string, eid as string)
          setStats(st)
        } catch {}
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
          Quay lại danh sách bài kiểm tra
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{exam?.title || 'Bài kiểm tra'}</span>
            {!loading && !error && (
              <div className="text-sm text-slate-600">#{exam?.id}</div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          {loading ? (
            <div className="text-sm text-slate-600">Đang tải…</div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-slate-700"><CalendarClock className="h-4 w-4"/> <span>Bắt đầu: {exam?.start_time?.replace('T',' ').slice(0,16) || '—'}</span></div>
                <div className="flex items-center gap-2 text-slate-700"><Timer className="h-4 w-4"/> <span>Kết thúc: {exam?.end_time?.replace('T',' ').slice(0,16) || '—'}</span></div>
                <div className="flex items-center gap-2 text-slate-700"><Users className="h-4 w-4"/> <span>Thời lượng: {duration || '—'}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/class/${id}/exam/${eid}/take`}>
                  <Button className="gap-2 text-black hover:bg-black hover:text-white"><Play className="h-4 w-4"/> Mở màn hình làm bài</Button>
                </Link>
              </div>
              {exam?.description && (
                <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700 whitespace-pre-wrap">{exam.description}</div>
              )}

              {stats && (
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-600">Tổng</div><div className="text-2xl font-semibold">{stats.counts.total}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-600">Đang làm</div><div className="text-2xl font-semibold">{stats.counts.taking}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-600">Hoàn thành</div><div className="text-2xl font-semibold">{stats.counts.completed}</div></div>
                    <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-600">Bỏ lỡ</div><div className="text-2xl font-semibold">{stats.counts.missed}</div></div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur">
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Học sinh</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Trạng thái</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Điểm</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Nộp lúc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.rows.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{r.name}</td>
                            <td className="px-4 py-3 text-slate-700">{r.email}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${r.status==='completed'?'bg-green-50 text-green-700 ring-green-200':r.status==='taking'?'bg-blue-50 text-blue-700 ring-blue-200':r.status==='missed'?'bg-red-50 text-red-700 ring-red-200':'bg-slate-100 text-slate-700 ring-slate-200'}`}>
                                {r.status==='completed'?'hoàn thành':r.status==='taking'?'đang làm':r.status==='missed'?'bỏ lỡ':r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 tabular-nums">{r.grade != null ? r.grade.toFixed(2) : '—'}</td>
                            <td className="px-4 py-3 tabular-nums text-slate-700">{r.submitted_at ? r.submitted_at.replace('T',' ').slice(0,16) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


