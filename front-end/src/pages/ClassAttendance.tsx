import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Search } from 'lucide-react'
import { useClassAttendance } from '@/hooks/useClasses'
import type { AttendanceResponse } from '@/api/classApi'
import * as XLSX from 'xlsx'

 

function generateDates(from: string, to: string) {
  const out: string[] = []
  const start = new Date(from)
  const end = new Date(to)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d).toISOString().slice(0, 10))
  }
  return out
}

export default function ClassAttendancePage() {
  const { id } = useParams()
  const [query, setQuery] = useState('')
  const today = new Date()
  const tenDaysAgo = new Date(); tenDaysAgo.setDate(today.getDate() - 9)
  const defaultFrom = tenDaysAgo.toISOString().slice(0,10)
  const defaultTo = today.toISOString().slice(0,10)
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  

  const { data, isLoading } = useClassAttendance(id as any, from, to)
  const attendance = data as AttendanceResponse | undefined
  const rows: Array<{ name: string; marks: Record<string, 'present'|'absent'|'late'> }> = (attendance?.rows || []).map((r) => ({ name: r.name, marks: r.marks }))

  const dateRange = useMemo(() => generateDates(from, to), [from, to])
  const filteredRows = useMemo(() => {
    const q = query.toLowerCase()
    return rows.filter((r) => !q || r.name.toLowerCase().includes(q))
  }, [query, rows])

  const summary = useMemo(() => {
    if (attendance?.summary) return { pct: attendance.summary.pct, absent: attendance.summary.absent, late: attendance.summary.late }
    return { pct: 0, absent: 0, late: 0 }
  }, [attendance])

  const [format, setFormat] = useState<'csv'|'xlsx'>('csv')

  const buildTabular = () => {
    const header = ['Student Name', ...dateRange]
    const body = filteredRows.map((r) => [
      r.name,
      ...dateRange.map((d) => {
        const m = r.marks[d] as ('present'|'absent'|'late') | undefined
        if (!m) return ''
        return m === 'present' ? 'P' : m === 'absent' ? 'A' : 'L'
      })
    ])
    return { header, body }
  }

  const handleExport = () => {
    const { header, body } = buildTabular()
    if (format === 'csv') {
      const rowsCsv = body.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      const csv = [header.join(','), ...rowsCsv].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `class_${id}_attendance_${from}_to_${to}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      const ws = XLSX.utils.aoa_to_sheet([header, ...body])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance')
      XLSX.writeFile(wb, `class_${id}_attendance_${from}_to_${to}.xlsx`)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Class Attendance</h1>
          <p className="text-slate-600">Review attendance over time and export reports</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={format} onChange={(e)=>setFormat(e.target.value as 'csv'|'xlsx')} className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600">
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
          <Button variant="outline" className="gap-2" onClick={handleExport}><Download className="h-4 w-4"/> Export</Button>
        </div>
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
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-72 rounded-2xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600" placeholder="Search student" />
        </div>
        {/* removed per request: student select filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">From</label>
          <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="rounded-2xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600" />
          <label className="text-sm text-slate-600">To</label>
          <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="rounded-2xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600" />
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
              {isLoading ? (
                <tr><td colSpan={1 + dateRange.length} className="px-4 py-6 text-center text-sm text-slate-600">Loading…</td></tr>
              ) : filteredRows.map((r, idx) => (
                <tr key={r.name} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{r.name}</td>
                  {dateRange.map((d) => {
                    const m = r.marks[d] as ('present'|'absent'|'late') | undefined
                    const map: Record<'present'|'absent'|'late', string> = { present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700', late: 'bg-amber-100 text-amber-700' }
                    const label: Record<'present'|'absent'|'late', string> = { present: 'P', absent: 'A', late: 'L' }
                    return (
                      <td key={d} className="px-2 py-2 text-center">
                        {m ? <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${map[m]}`}>{label[m]}</span> : <span className="text-slate-400">—</span>}
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

