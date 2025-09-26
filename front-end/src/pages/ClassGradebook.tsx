import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Calculator, ArrowLeftCircle } from 'lucide-react'
import { getClassGrades, type GradebookItem, type GradebookResponse } from '@/api/classApi'

type Student = { id: number; name: string }

export default function ClassGradebookPage() {
  const { id } = useParams()
  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])
  const [students, setStudents] = useState<Student[]>([])
  const [items, setItems] = useState<GradebookItem[]>([])
  const [grades, setGrades] = useState<Record<string, Record<string, number | null>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const data = await getClassGrades(id as string)
        if (!mounted) return
        setStudents(data.students)
        setItems(data.items)
        setGrades(data.grades)
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load gradebook')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (id) load()
    return () => { mounted = false }
  }, [id])

  const stats = useMemo(() => {
    const values: number[] = []
    students.forEach((s) => {
      items.forEach((it) => {
        const v = grades[String(s.id)]?.[it.key]
        if (typeof v === 'number') values.push(v)
      })
    })
    if (values.length === 0) return { avg: 0, max: 0, min: 0 }
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    return { avg, max: Math.max(...values), min: Math.min(...values) }
  }, [grades, students, items])

  const update = (studentId: number, key: string, val: string) => {
    const v = Math.max(0, Math.min(100, Number(val)))
    setGrades((old) => ({ ...old, [studentId]: { ...(old as any)[studentId], [key]: v } }))
  }

  return (
    <div className="grid gap-6">
      <div>
        <Link
          to={`/class/${id}`}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <ArrowLeftCircle className="h-4 w-4 transition-colors group-hover:text-brand-blue"/>
          Back to Class Detail
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Class Gradebook</h1>
          <p className="text-slate-600">Edit scores inline and export reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Upload className="h-4 w-4"/> Import Grades</Button>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4"/> Export Grades</Button>
          <Button className="gap-2"><Calculator className="h-4 w-4"/> Calculate Average</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Class Average</div><div className="text-3xl font-semibold">{stats.avg}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Highest Score</div><div className="text-3xl font-semibold">{stats.max}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Lowest Score</div><div className="text-3xl font-semibold">{stats.min}%</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Gradebook</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto rounded-2xl">
          {error && <div className="p-3 text-sm text-red-600">{error}</div>}
          {loading ? (
            <div className="p-4 text-sm text-slate-600">Loading…</div>
          ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Student</th>
                {items.map((it) => (
                  <th key={it.key} className="px-2 py-2 text-center">{it.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{s.name}</td>
                  {items.map((it) => (
                    <td key={it.key} className="px-2 py-2 text-center">
                      <input
                        type="number"
                        value={grades[String(s.id)]?.[it.key] ?? ''}
                        onChange={(e) => update(s.id, it.key, e.target.value)}
                        className="w-16 rounded-xl border border-slate-300 px-2 py-1 text-center focus:border-brand-blue"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

