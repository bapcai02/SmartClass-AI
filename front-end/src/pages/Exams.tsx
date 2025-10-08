import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'
import { useAuthStore } from '@/store/auth'
import { Upload, Sparkles, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useMemo, useState } from 'react'

type Exam = {
  id: string
  title: string
  subject: string
  durationMins: number
  due: string
  status: 'Not Started' | 'In Progress' | 'Completed'
}

const exams: Exam[] = [
  { id: 'e1', title: 'Algebra Midterm', subject: 'Math', durationMins: 60, due: '2025-10-01', status: 'Not Started' },
  { id: 'e2', title: 'Biology Quiz', subject: 'Biology', durationMins: 30, due: '2025-10-03', status: 'In Progress' },
  { id: 'e3', title: 'History Final', subject: 'History', durationMins: 90, due: '2025-10-10', status: 'Completed' },
]

function StatusTag({ status }: { status: Exam['status'] }) {
  const map = {
    'Not Started': 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
  } as const
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status]}`}>{status}</span>
}

export default function ExamsPage() {
  const role = useAuthStore((s) => s.user?.role)
  const [openUpload, setOpenUpload] = useState(false)
  const [openGenerate, setOpenGenerate] = useState(false)
  const [filter, setFilter] = useState<'All'|'In Progress'|'Completed'|'Not Started'>('All')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const filtered = useMemo(() => {
    return exams.filter(e => filter==='All' ? true : e.status === filter)
  }, [filter])
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = useMemo(() => {
    const start = (page-1)*pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exams</h1>
          <p className="text-slate-600">Manage and participate in exams</p>
        </div>
        {role === 'Teacher' && (
          <div className="flex gap-2">
            <Modal open={openUpload} onOpenChange={setOpenUpload}>
              <ModalTrigger asChild>
                <Button variant="outline" className="gap-2"><Upload className="h-4 w-4"/> Upload Exam</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader title="Upload Exam" description="Upload a PDF/CSV/JSON to create an exam" />
                <div className="grid gap-3">
                  <input type="file" className="rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue" />
                  <div className="flex justify-end">
                    <Button onClick={() => setOpenUpload(false)}>Save</Button>
                  </div>
                </div>
              </ModalContent>
            </Modal>
            <Modal open={openGenerate} onOpenChange={setOpenGenerate}>
              <ModalTrigger asChild>
                <Button className="gap-2"><Sparkles className="h-4 w-4"/> Generate with AI</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader title="Generate Exam with AI" description="Provide topic and difficulty to auto-generate" />
                <div className="grid gap-3">
                  <div>
                    <label className="text-sm font-medium">Topic</label>
                    <input className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue" placeholder="e.g., Quadratic Equations" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <select className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setOpenGenerate(false)}>Generate</Button>
                  </div>
                </div>
              </ModalContent>
            </Modal>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Exams</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          {/* Segmented filters (match Assignments style) */}
          <div className="m-3 flex items-center justify-between">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
              {(['All','Not Started','In Progress','Completed'] as const).map((f) => (
                <button key={f} onClick={()=>{setFilter(f); setPage(1)}} className={`rounded-xl px-3 py-1.5 ${filter===f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}>{f}</button>
              ))}
            </div>
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Filters</Button>
          </div>

          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {current.map((e, idx) => (
                <tr key={e.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3">{e.subject}</td>
                  <td className="px-4 py-3">{e.durationMins} mins</td>
                  <td className="px-4 py-3">{e.due}</td>
                  <td className="px-4 py-3"><StatusTag status={e.status} /></td>
                  <td className="px-4 py-3">
                    {e.status === 'Completed' ? (
                      <Button variant="outline">View Results</Button>
                    ) : (
                      <Button>Start Exam</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination (match Assignments) */}
          <div className="flex items-center justify-between p-3 text-sm text-slate-600">
            <div>
              Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, total)} of {total} entries
            </div>
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1} className={`h-9 rounded-full px-3 shadow-sm border bg-white flex items-center gap-1 ${page===1?'opacity-60 cursor-not-allowed':''}`}>
                <ChevronLeft className="h-4 w-4"/> Previous
              </button>
              {(() => {
                const items: React.ReactElement[] = []
                const makeBtn = (p:number) => (
                  <button key={`p-${p}`} onClick={()=>setPage(p)} className={`h-9 min-w-9 rounded-full px-3 text-sm shadow-sm border ${p===page?'bg-brand-blue text-white border-transparent':'bg-white'}`}>{p}</button>
                )
                const shown = Math.min(totalPages, 6)
                for (let p=1;p<=shown;p++) items.push(makeBtn(p))
                return items
              })()}
              <button onClick={()=>setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} className={`h-9 rounded-full px-3 shadow-sm border bg-white flex items-center gap-1 ${page===totalPages?'opacity-60 cursor-not-allowed':''}`}>
                Next <ChevronRight className="h-4 w-4"/>
              </button>
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

