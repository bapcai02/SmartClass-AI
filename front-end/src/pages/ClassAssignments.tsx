import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit3, Trash2, Filter } from 'lucide-react'
import { useListAssignments, useCreateAssignment } from '@/hooks/useAssignments'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'

type Row = { id: string; title: string; deadline: string; status: 'open'|'closed'; submissions: number; rate: number }
// const base: Row[] = Array.from({ length: 12 }, (_, i) => ({
//   id: `A${100+i}`,
//   title: `Assignment ${i+1}`,
//   deadline: `2025-10-${String((i%28)+1).padStart(2,'0')}`,
//   status: i % 3 === 0 ? 'closed' : 'open',
//   submissions: 10 + (i*3)%20,
//   rate: 40 + (i*5)%60,
// }))

export default function ClassAssignmentsPage() {
  const { id } = useParams()
  const [status, setStatus] = useState<'all'|'open'|'closed'>('all')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [due, setDue] = useState('')
  const createMut = useCreateAssignment(id as any)
  const { addToast } = useToast()
  // Fetch first page with a generous page size to match current single-page UI
  const { data } = useListAssignments(id as any, 1, 50)
  const rowsAll: Row[] = useMemo(() => {
    const items = data?.data || []
    const now = new Date()
    return items.map(a => {
      const due = a.due_date
      const dueDate = new Date(due)
      const isOpen = isNaN(dueDate.getTime()) ? true : dueDate >= now
      return {
        id: String(a.id),
        title: a.title,
        deadline: a.due_date,
        status: isOpen ? 'open' : 'closed',
        // Placeholders to keep UI unchanged until backend provides these stats
        submissions: 0,
        rate: 0,
      }
    })
  }, [data])
  const rows = useMemo(()=> rowsAll.filter(r => status==='all' ? true : r.status===status), [rowsAll, status])
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Class Assignments</h1>
          <p className="text-slate-600">Manage and track class assignments</p>
        </div>
        <Modal open={open} onOpenChange={(v)=>{ setOpen(v); if (!v) { setTitle(''); setDescription(''); setDue('') } }}>
          <ModalTrigger asChild>
            <Button variant="outline" className="gap-2 text-slate-900" onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Create New Assignment</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader title="Create Assignment" />
            <div className="grid gap-3">
              <label className="text-sm">Title</label>
              <input value={title} onChange={(e)=>setTitle(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <label className="text-sm">Description</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <label className="text-sm">Due date</label>
              <input type="datetime-local" value={due} onChange={(e)=>setDue(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!title || !due || createMut.isPending}
                  onClick={async ()=>{
                    try {
                      await createMut.mutateAsync({ title, description, due_date: due })
                      setOpen(false)
                      addToast({ title: 'Created', variant: 'success' })
                    } catch {
                      addToast({ title: 'Create failed', variant: 'error' })
                    }
                  }}
                >
                  {createMut.isPending ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
          {(['all','open','closed'] as const).map(s => (
            <button key={s} onClick={()=>setStatus(s)} className={`rounded-xl px-3 py-1.5 ${status===s?'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:bg-white/60'}`}>{s}</button>
          ))}
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Filters</Button>
      </div>

      <div className="grid gap-4">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.title}</span>
                <span className="text-sm text-slate-600">Deadline: {r.deadline}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status==='open'?'bg-green-100 text-green-700':'bg-slate-200 text-slate-700'}`}>{r.status}</span>
                <span className="mx-1">•</span>
                Submissions: {r.submissions}
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-brand-blue" style={{ width: `${r.rate}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-8 px-2"><Eye className="h-4 w-4"/></Button>
                <Button variant="outline" className="h-8 px-2"><Edit3 className="h-4 w-4"/></Button>
                <Button variant="outline" className="h-8 px-2 text-red-600"><Trash2 className="h-4 w-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

