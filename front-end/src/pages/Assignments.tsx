import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import { Eye, Edit3, Send, Filter, ChevronLeft, ChevronRight, Copy, Printer, Trash2, MoreHorizontal } from 'lucide-react'

type Assignment = {
  id: string
  title: string
  subject: string
  due: string
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue'
  score?: number
}

const data: Assignment[] = [
  { id: 'a1', title: 'Linear Equations', subject: 'Math', due: '2025-09-30', status: 'Not Started' },
  { id: 'a2', title: 'Cell Structure', subject: 'Biology', due: '2025-10-02', status: 'In Progress' },
  { id: 'a3', title: 'World War II Essay', subject: 'History', due: '2025-10-05', status: 'Completed', score: 92 },
]

function StatusTag({ status }: { status: Assignment['status'] }) {
  const map = {
    'Not Started': 'bg-amber-100 text-amber-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Overdue': 'bg-red-100 text-red-700',
  } as const
  const label = status === 'Not Started' ? 'Pending' : status
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}>{label}</span>
}

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(1)
  const pageSize = 9
  const today = new Date().toISOString().slice(0,10)
  const normalized = data.map((d) => {
    const isOverdue = d.status !== 'Completed' && d.due < today
    return { ...d, status: isOverdue ? 'Overdue' as const : d.status }
  })
  const filtered = normalized.filter((d) => {
    if (filter === 'All') return true
    if (filter === 'Completed') return d.status === 'Completed'
    if (filter === 'Overdue') return d.status === 'Overdue'
    return d.status !== 'Completed'
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const allOnPageSelected = current.length > 0 && current.every((a) => selected[a.id])
  const toggleSelectAll = () => {
    const next = { ...selected }
    current.forEach((a) => (next[a.id] = !allOnPageSelected))
    setSelected(next)
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
          <p className="text-slate-600">Track your tasks, due dates, and scores</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline">Export</Button>
          <Button>Add Assignment</Button>
        </div>
      </div>

      {/* Top summary chips */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Total</div><div className="text-2xl font-semibold">{normalized.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Pending</div><div className="text-2xl font-semibold">{normalized.filter(a=>a.status==='Not Started' || a.status==='In Progress').length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Overdue</div><div className="text-2xl font-semibold">{normalized.filter(a=>a.status==='Overdue').length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-600">Completed</div><div className="text-2xl font-semibold">{normalized.filter(a=>a.status==='Completed').length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          {/* Segmented filters (Prodex-style) */}
          <div className="m-3 flex items-center justify-between">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
              {(['All','Pending','Overdue','Completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-xl px-3 py-1.5 ${filter===f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}
                >{f}</button>
              ))}
            </div>
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Filters</Button>
          </div>

          {/* Bulk toolbar */}
          {Object.values(selected).some(Boolean) && (
            <div className="m-3 flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm shadow-sm">
              <div>{Object.values(selected).filter(Boolean).length} Selected</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-1"><Copy className="h-4 w-4"/> Duplicate</Button>
                <Button variant="outline" className="gap-1"><Printer className="h-4 w-4"/> Print</Button>
                <Button variant="outline" className="gap-1 text-red-600"><Trash2 className="h-4 w-4"/> Delete</Button>
              </div>
            </div>
          )}

          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left"><input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} /></th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Score</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.map((a, idx) => (
                <tr key={a.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={!!selected[a.id]} onChange={() => setSelected({ ...selected, [a.id]: !selected[a.id] })} /></td>
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3">{a.subject}</td>
                  <td className="px-4 py-3">{a.due}</td>
                  <td className="px-4 py-3"><StatusTag status={a.status} /></td>
                  <td className="px-4 py-3">{a.score ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-full bg-white shadow p-2 hover:shadow-md border border-slate-200" aria-label="View">
                        <Eye className="h-4 w-4 text-slate-700" />
                      </button>
                      <button className="rounded-full bg-white shadow p-2 hover:shadow-md border border-slate-200" aria-label="Edit">
                        <Edit3 className="h-4 w-4 text-slate-700" />
                      </button>
                      <button className="rounded-full bg-white shadow p-2 hover:shadow-md border border-slate-200" aria-label="Submit">
                        <Send className="h-4 w-4 text-slate-700" />
                      </button>
                      <button className="rounded-full bg-white shadow p-2 hover:shadow-md border border-slate-200" aria-label="More">
                        <MoreHorizontal className="h-4 w-4 text-slate-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-3 text-sm text-slate-600">
            <div>
              Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, total)} of {total} entries
            </div>
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button
                onClick={()=>setPage(Math.max(1,page-1))}
                disabled={page===1}
                className={`h-9 rounded-full px-3 shadow-sm border bg-white text-slate-700 flex items-center gap-1 ${page===1?'opacity-60 cursor-not-allowed':''}`}
              >
                <ChevronLeft className="h-4 w-4"/> Previous
              </button>
              {(() => {
                const items: JSX.Element[] = []
                const makeBtn = (p:number,label?:string) => (
                  <button
                    key={`p-${p}-${label??''}`}
                    onClick={()=>setPage(p)}
                    className={`h-9 min-w-9 rounded-full px-3 text-sm shadow-sm border ${p===page?'bg-brand-blue text-white border-transparent':'bg-white text-slate-700'} `}
                  >{label ?? p}</button>
                )
                if (totalPages <= 6) {
                  for (let p=1;p<=totalPages;p++) items.push(makeBtn(p))
                } else {
                  items.push(makeBtn(1))
                  if (page > 3) items.push(<span key="el-1" className="px-1">…</span>)
                  const start = Math.max(2, page-1)
                  const end = Math.min(totalPages-1, page+1)
                  for (let p=start;p<=end;p++) items.push(makeBtn(p))
                  if (page < totalPages-2) items.push(<span key="el-2" className="px-1">…</span>)
                  items.push(makeBtn(totalPages))
                }
                return items
              })()}
              <button
                onClick={()=>setPage(Math.min(totalPages,page+1))}
                disabled={page===totalPages}
                className={`h-9 rounded-full px-3 shadow-sm border bg-white text-slate-700 flex items-center gap-1 ${page===totalPages?'opacity-60 cursor-not-allowed':''}`}
              >
                Next <ChevronRight className="h-4 w-4"/>
              </button>
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

