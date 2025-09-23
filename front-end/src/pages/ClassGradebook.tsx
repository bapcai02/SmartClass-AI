import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Calculator } from 'lucide-react'

const STUDENTS = Array.from({ length: 12 }, (_, i) => `Student ${i + 1}`)
const ITEMS = ['A1', 'A2', 'Quiz', 'Midterm', 'A3', 'Final']

export default function ClassGradebookPage() {
  const { id } = useParams()
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>(() => {
    const g: Record<string, Record<string, number>> = {}
    STUDENTS.forEach((s, i) => {
      g[s] = {}
      ITEMS.forEach((it, j) => (g[s][it] = 70 + ((i + j) * 3) % 30))
    })
    return g
  })

  const stats = useMemo(() => {
    const all = STUDENTS.flatMap((s) => ITEMS.map((it) => grades[s][it]))
    const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length)
    return { avg, max: Math.max(...all), min: Math.min(...all) }
  }, [grades])

  const update = (s: string, it: string, val: string) => {
    const v = Math.max(0, Math.min(100, Number(val)))
    setGrades((old) => ({ ...old, [s]: { ...old[s], [it]: v } }))
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
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
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Student</th>
                {ITEMS.map((it) => (
                  <th key={it} className="px-2 py-2 text-center">{it}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s, idx) => (
                <tr key={s} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{s}</td>
                  {ITEMS.map((it) => (
                    <td key={it} className="px-2 py-2 text-center">
                      <input
                        type="number"
                        value={grades[s][it]}
                        onChange={(e) => update(s, it, e.target.value)}
                        className="w-16 rounded-xl border border-slate-300 px-2 py-1 text-center focus:border-brand-blue"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

