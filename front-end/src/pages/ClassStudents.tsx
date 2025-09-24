import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, ChevronLeft, ChevronRight, Trash2, MessageSquareText, UserPlus } from 'lucide-react'
// @ts-ignore
import { useClassStudents } from '@/hooks/useClasses'

type Student = {
  id: string
  name: string
  email: string
  status: 'Active' | 'Inactive'
  attendance: number
  grade: string
}

const base: Student[] = []

export default function ClassStudentsPage() {
  const { id } = useParams()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const { data: api, isLoading } = useClassStudents(id as any, page, pageSize, query)
  const apiItems = (api?.data || []) as Array<{ id: number; name: string; email: string; attendance_percent?: number | null; avg_grade?: number | null; is_active?: number | boolean }>
  const total = api?.total || 0
  const totalPages = api?.last_page || 1

  const current = useMemo(() => apiItems.map((u) => ({
    id: String(u.id),
    name: u.name,
    email: u.email,
    status: (u.is_active ? 'Active' : 'Inactive') as const,
    attendance: typeof u.attendance_percent === 'number' ? Math.max(0, Math.min(100, Math.round(u.attendance_percent))) : 0,
    grade: typeof u.avg_grade === 'number' ? u.avg_grade.toFixed(2) : '-',
  })), [apiItems])

  const allSelected = current.length > 0 && current.every((s) => selected[s.id])
  const toggleAll = () => {
    const next = { ...selected }
    current.forEach((s) => (next[s.id] = !allSelected))
    setSelected(next)
  }

  const activeCount = useMemo(() => current.filter(s => s.status === 'Active').length, [current])
  const inactiveCount = useMemo(() => current.filter(s => s.status === 'Inactive').length, [current])
  const avgGrade = useMemo(() => {
    const numeric = apiItems.map(u => typeof u.avg_grade === 'number' ? u.avg_grade : null).filter((v): v is number => v != null)
    if (numeric.length === 0) return '—'
    const avg = numeric.reduce((a,b)=>a+b,0)/numeric.length
    return avg.toFixed(2)
  }, [apiItems])

  return (
    <div className="grid gap-6">
      {/* Back */}
      <div>
        <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
      </div>

      {/* Top summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Total Students</div><div className="text-2xl font-semibold">{total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Active</div><div className="text-2xl font-semibold">{activeCount}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Inactive</div><div className="text-2xl font-semibold">{inactiveCount}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Average Grade</div><div className="text-2xl font-semibold">{avgGrade}</div></CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e)=>{setQuery(e.target.value); setPage(1)}} className="w-72 rounded-2xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:border-brand-blue" placeholder="Search students" />
          </div>
          <select value={status} onChange={(e)=>{setStatus(e.target.value as any); setPage(1)}} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue">
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Filters</Button>
        </div>
        <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4"/> Add Student</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Students</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          {/* Bulk actions */}
          {Object.values(selected).some(Boolean) && (
            <div className="m-3 flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm shadow-sm">
              <div>{Object.values(selected).filter(Boolean).length} Selected</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-1 text-red-600"><Trash2 className="h-4 w-4"/> Remove</Button>
                <Button variant="outline" className="gap-1"><MessageSquareText className="h-4 w-4"/> Send Message</Button>
              </div>
            </div>
          )}

          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Attendance %</th>
                <th className="px-4 py-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-600">Loading…</td></tr>
              ) : current.map((s, idx) => (
                <tr key={s.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={!!selected[s.id]} onChange={()=>setSelected({...selected, [s.id]: !selected[s.id]})} /></td>
                  <td className="px-4 py-3 font-medium">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${s.status==='Active'?'bg-green-100 text-green-700':'bg-slate-200 text-slate-700'}`}>{s.status}</span></td>
                  <td className="px-4 py-3">{s.attendance}%</td>
                  <td className="px-4 py-3">{s.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-3 text-sm text-slate-600">
            <div>Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, total)} of {total} students</div>
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1} className={`h-9 rounded-full px-3 shadow-sm border bg-white text-slate-700 flex items-center gap-1 ${page===1?'opacity-60 cursor-not-allowed':''}`}>
                <ChevronLeft className="h-4 w-4"/> Previous
              </button>
              {Array.from({length: Math.min(totalPages, 6)}).map((_,i)=>{
                const p=i+1; return (
                  <button key={p} onClick={()=>setPage(p)} className={`h-9 min-w-9 rounded-full px-3 text-sm shadow-sm border ${p===page?'bg-brand-blue text-white border-transparent':'bg-white text-slate-700'}`}>{p}</button>
                )})}
              <button onClick={()=>setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} className={`h-9 rounded-full px-3 shadow-sm border bg-white text-slate-700 flex items-center gap-1 ${page===totalPages?'opacity-60 cursor-not-allowed':''}`}>
                Next <ChevronRight className="h-4 w-4"/>
              </button>
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

