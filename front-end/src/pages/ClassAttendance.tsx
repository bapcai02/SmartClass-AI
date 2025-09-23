import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Search } from 'lucide-react'

type Mark = 'P' | 'A' | 'L'
type Row = { name: string; marks: Record<string, Mark> }

const STUDENTS = Array.from({ length: 20 }, (_, i) => `Student ${i + 1}`)

function generateDates(days: number) {
  const out: string[] = []
  const d = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    out.push(x.toISOString().slice(0, 10))
  }
  return out
}

const DATES = generateDates(10)

function randomMark(i: number): Mark {
  return (['P', 'P', 'P', 'L', 'A'][i % 5] as Mark)
}

const BASE_ROWS: Row[] = STUDENTS.map((name, idx) => ({
  name,
  marks: Object.fromEntries(DATES.map((d, i) => [d, randomMark(i + idx)])),
}))

export default function ClassAttendancePage() {
  const { id } = useParams()
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState(DATES[0])
  const [to, setTo] = useState(DATES[DATES.length - 1])
  const [student, setStudent] = useState<'All' | string>('All')

  const dateRange = useMemo(() => DATES.filter((d) => d >= from && d <= to), [from, to])
  const filteredRows = useMemo(() => {
    const q = query.toLowerCase()
    return BASE_ROWS.filter((r) => {
      const matchesName = !q || r.name.toLowerCase().includes(q)
      const matchesStudent = student === 'All' || r.name === student
      return matchesName && matchesStudent
    })
  }, [query, student])

  const summary = useMemo(() => {
    let present = 0, absent = 0, late = 0, total = 0
    filteredRows.forEach((r) => {
      dateRange.forEach((d) => {
        total++
        const m = r.marks[d]
        if (m === 'P') present++
        else if (m === 'A') absent++
        else late++
      })
    })
    const pct = total ? Math.round((present / total) * 100) : 0
    return { pct, absent, late }
  }, [filteredRows, dateRange])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Class Attendance</h1>
          <p className="text-slate-600">Review attendance over time and export reports</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4"/> Export</Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Attendance %</div><div className="text-3xl font-semibold">{summary.pct}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Absences</div><div className="text-3xl font-semibold">{summary.absent}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Late Arrivals</div><div className="text-3xl font-semibold">{summary.late}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-72 rounded-2xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:border-brand-blue" placeholder="Search student" />
        </div>
        <select value={student} onChange={(e)=>setStudent(e.target.value as any)} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue">
          <option>All</option>
          {STUDENTS.map((s)=> <option key={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">From</label>
          <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue" />
          <label className="text-sm text-slate-600">To</label>
          <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue" />
        </div>
      </div>

      {/* Timeline strip */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-4 py-2">
            {dateRange.map((d) => (
              <div key={d} className="text-center">
                <div className="text-xs text-slate-600">{d.slice(5)}</div>
                <div className="mt-1 h-2 w-10 rounded-full bg-slate-200">
                  <div className="h-2 w-6 rounded-full bg-green-500"/>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Student Name</th>
                {dateRange.map((d) => (
                  <th key={d} className="px-2 py-2 text-center text-xs">{d.slice(5)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <tr key={r.name} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{r.name}</td>
                  {dateRange.map((d) => {
                    const m = r.marks[d]
                    const map: Record<Mark, string> = { P: 'bg-green-100 text-green-700', A: 'bg-red-100 text-red-700', L: 'bg-amber-100 text-amber-700' }
                    const label: Record<Mark, string> = { P: 'P', A: 'A', L: 'L' }
                    return (
                      <td key={d} className="px-2 py-2 text-center">
                        <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${map[m]}`}>{label[m]}</span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

