import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit3, Trash2, ArrowLeftCircle, Loader2 } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'
import { listClassExams, createClassExam, updateClassExam, deleteClassExam, type ExamDto } from '@/api/exams'

type Row = { id: string; title: string; date: string; duration: string; status: 'upcoming'|'ongoing'|'finished' }
const base: Row[] = Array.from({ length: 8 }, (_, i) => ({
  id: `E${100+i}`,
  title: `Exam ${i+1}`,
  date: `2025-11-${String((i%28)+1).padStart(2,'0')}`,
  duration: `${60 + (i*15)%120} mins`,
  status: (['upcoming','ongoing','finished'] as const)[i%3],
}))

export default function ClassExamsPage() {
  const { id } = useParams()
  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])
  const [status, setStatus] = useState<'all'|'upcoming'|'ongoing'|'finished'>('all')
  const [rows, setRows] = useState<Row[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [durationMin, setDurationMin] = useState<number>(60)
  const [creating, setCreating] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editExam, setEditExam] = useState<Row | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editDurationMin, setEditDurationMin] = useState<number>(60)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    (async () => {
      const data = await listClassExams(id as string, 1, 50)
      const now = new Date()
      const mapped: Row[] = (data.data || []).map((e: ExamDto) => {
        const start = new Date(e.start_time)
        const end = e.end_time ? new Date(e.end_time) : null
        const st = isNaN(start.getTime()) ? 'upcoming' : (end && now > end) ? 'finished' : (now >= start && (!end || now <= end)) ? 'ongoing' : 'upcoming'
        const dur = end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)) : durationMin
        return { id: String(e.id), title: e.title, date: e.start_time.slice(0,16).replace('T',' '), duration: `${dur} mins`, status: st as Row['status'] }
      })
      setRows(mapped)
    })()
  }, [id])

  const filtered = useMemo(()=> rows.filter(r => status==='all' ? true : r.status===status), [rows, status])
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
          <h1 className="text-2xl font-semibold tracking-tight">Class Exams</h1>
          <p className="text-slate-600">Manage exams and track results</p>
        </div>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalTrigger asChild>
            <Button className="gap-2 text-black hover:bg-black hover:text-white" onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Create New Exam</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader title="Create Exam" />
            <div className="grid gap-3">
              <label className="text-sm">Title</label>
              <input value={title} onChange={(e)=>setTitle(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <label className="text-sm">Start time</label>
              <input type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
              <label className="text-sm">Duration (minutes)</label>
              <input type="number" value={durationMin} onChange={(e)=>setDurationMin(Number(e.target.value)||60)} className="w-32 rounded-md border border-slate-300 px-3 py-2" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button
                  className="rounded-xl border border-black px-4 text-black bg-white hover:bg-black hover:text-white shadow-sm disabled:opacity-60"
                  disabled={!title || !date || creating}
                  onClick={async ()=>{
                    try {
                      setCreating(true)
                      const start = new Date(date)
                      const end = new Date(start.getTime() + durationMin*60000)
                      await createClassExam(id as string, { title, start_time: start.toISOString(), end_time: end.toISOString() })
                      setOpen(false); setTitle(''); setDate('')
                      const data = await listClassExams(id as string, 1, 50)
                      const now = new Date()
                      const mapped: Row[] = (data.data || []).map((e: ExamDto) => {
                        const start = new Date(e.start_time)
                        const end = e.end_time ? new Date(e.end_time) : null
                        const st = isNaN(start.getTime()) ? 'upcoming' : (end && now > end) ? 'finished' : (now >= start && (!end || now <= end)) ? 'ongoing' : 'upcoming'
                        const dur = end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)) : durationMin
                        return { id: String(e.id), title: e.title, date: e.start_time.slice(0,16).replace('T',' '), duration: `${dur} mins`, status: st as Row['status'] }
                      })
                      setRows(mapped)
                    } finally { setCreating(false) }
                  }}
                >
                  {creating ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
          {(['all','upcoming','ongoing','finished'] as const).map(s => (
            <button key={s} onClick={()=>setStatus(s)} className={`rounded-xl px-3 py-1.5 ${status===s?'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:bg-white/60'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{r.title}</span>
                  <span className="text-sm text-slate-600">{r.date} • {r.duration}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status==='upcoming'?'bg-amber-100 text-amber-700':r.status==='ongoing'?'bg-blue-100 text-blue-700':'bg-slate-200 text-slate-700'}`}>{r.status}</span>
                <div className="flex items-center gap-2">
                  <Link to={`/class/${id}/exam/${r.id}`}><Button variant="outline" className="h-8 px-2"><Eye className="h-4 w-4"/></Button></Link>
                  <Button
                    variant="outline"
                    className="h-8 px-2"
                    onClick={()=>{
                      setEditExam(r)
                      setEditTitle(r.title)
                      setEditDate(r.date.replace(' ', 'T'))
                      const parts = r.duration.split(' ')[0]
                      setEditDurationMin(Number(parts)||60)
                      setEditOpen(true)
                    }}
                  ><Edit3 className="h-4 w-4"/></Button>
                  <Button
                    variant="outline"
                    className="h-8 px-2 text-red-600"
                    onClick={()=>{ setDeleteId(r.id); setDeleteOpen(true) }}
                  ><Trash2 className="h-4 w-4"/></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {[{name:'Alice',score:98},{name:'Bob',score:95},{name:'Charlie',score:92}].map((s,i)=> (
              <div key={s.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div className="font-medium">{i+1}. {s.name}</div>
                <div className="text-sm text-slate-600">{s.score} pts</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <ModalContent>
          <ModalHeader title="Edit Exam" />
          <div className="grid gap-3">
            <label className="text-sm">Title</label>
            <input value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
            <label className="text-sm">Start time</label>
            <input type="datetime-local" value={editDate} onChange={(e)=>setEditDate(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
            <label className="text-sm">Duration (minutes)</label>
            <input type="number" value={editDurationMin} onChange={(e)=>setEditDurationMin(Number(e.target.value)||60)} className="w-32 rounded-md border border-slate-300 px-3 py-2" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button>
              <Button
                className="rounded-xl border border-black px-4 text-black bg-white hover:bg-black hover:text-white shadow-sm disabled:opacity-60"
                disabled={!editExam || !editTitle || !editDate || saving}
                onClick={async ()=>{
                  if (!editExam) return
                  try {
                    setSaving(true)
                    const start = new Date(editDate)
                    const end = new Date(start.getTime() + editDurationMin*60000)
                    await updateClassExam(id as string, editExam.id, { title: editTitle, start_time: start.toISOString(), end_time: end.toISOString() })
                    setEditOpen(false)
                    const data = await listClassExams(id as string, 1, 50)
                    const now = new Date()
                    const mapped: Row[] = (data.data || []).map((e: ExamDto) => {
                      const start = new Date(e.start_time)
                      const end = e.end_time ? new Date(e.end_time) : null
                      const st = isNaN(start.getTime()) ? 'upcoming' : (end && now > end) ? 'finished' : (now >= start && (!end || now <= end)) ? 'ongoing' : 'upcoming'
                      const dur = end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)) : editDurationMin
                      return { id: String(e.id), title: e.title, date: e.start_time.slice(0,16).replace('T',' '), duration: `${dur} mins`, status: st as Row['status'] }
                    })
                    setRows(mapped)
                  } finally { setSaving(false) }
                }}
              >
                {saving ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Saving…</span>) : 'Save'}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ModalContent>
          <ModalHeader title="Delete Exam" description="This action cannot be undone." />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setDeleteOpen(false)}>Cancel</Button>
            <Button
              className="text-red-600"
              disabled={!deleteId || deleting}
              onClick={async ()=>{
                if (!deleteId) return
                try {
                  setDeleting(true)
                  await deleteClassExam(id as string, deleteId)
                  setDeleteOpen(false)
                  const data = await listClassExams(id as string, 1, 50)
                  const now = new Date()
                  const mapped: Row[] = (data.data || []).map((e: ExamDto) => {
                    const start = new Date(e.start_time)
                    const end = e.end_time ? new Date(e.end_time) : null
                    const st = isNaN(start.getTime()) ? 'upcoming' : (end && now > end) ? 'finished' : (now >= start && (!end || now <= end)) ? 'ongoing' : 'upcoming'
                    const dur = end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)) : 60
                    return { id: String(e.id), title: e.title, date: e.start_time.slice(0,16).replace('T',' '), duration: `${dur} mins`, status: st as Row['status'] }
                  })
                  setRows(mapped)
                } finally { setDeleting(false); setDeleteId(null) }
              }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  )
}

