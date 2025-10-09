import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit3, Trash2, Filter, ArrowLeftCircle } from 'lucide-react'
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
  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])
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
    const items = (data as any)?.data || []
    const now = new Date()
    return items.map((a: any) => {
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
      <div>
        <Link
          to={`/class/${id}`}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <ArrowLeftCircle className="h-4 w-4 transition-colors group-hover:text-brand-blue"/>
          Quay lại chi tiết lớp
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bài tập của lớp</h1>
          <p className="text-slate-600">Quản lý và theo dõi bài tập của lớp</p>
        </div>
        <Modal open={open} onOpenChange={(v)=>{ setOpen(v); if (!v) { setTitle(''); setDescription(''); setDue('') } }}>
          <ModalTrigger asChild>
            <Button variant="outline" className="gap-2 text-slate-900" onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Tạo bài tập mới</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader title="Tạo bài tập" />
            <div className="grid gap-3">
              <label className="text-sm">Tiêu đề</label>
              <input value={title} onChange={(e)=>setTitle(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <label className="text-sm">Mô tả</label>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <label className="text-sm">Hạn nộp</label>
              <input type="datetime-local" value={due} onChange={(e)=>setDue(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setOpen(false)}>Hủy</Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!title || !due || createMut.isPending}
                  onClick={async ()=>{
                    try {
                      await createMut.mutateAsync({ title, description, due_date: due })
                      setOpen(false)
                      addToast({ title: 'Đã tạo', variant: 'success' })
                    } catch {
                      addToast({ title: 'Tạo thất bại', variant: 'error' })
                    }
                  }}
                >
                  {createMut.isPending ? 'Đang tạo…' : 'Tạo'}
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
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Bộ lọc</Button>
      </div>

      <div className="grid gap-4">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.title}</span>
                <span className="text-sm text-slate-600">Hạn: {r.deadline}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status==='open'?'bg-green-100 text-green-700':'bg-slate-200 text-slate-700'}`}>{r.status==='open'?'Đang mở':'Đã đóng'}</span>
                <span className="mx-1">•</span>
                Bài nộp: {r.submissions}
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

