import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'
import { classes } from '@/data/dummy'
import { Link } from 'react-router-dom'
import { Plus, Users, UserRound, Search, Filter, Trash2, LayoutGrid, Table, Edit3 } from 'lucide-react'
import { useMemo, useState } from 'react'
// @ts-ignore - JS module, types provided via d.ts shim
import { useGetClasses } from '@/hooks/useClasses'
// @ts-ignore - JS module, types provided via d.ts shim
import { useGetClassDetail } from '@/hooks/useClasses'
// @ts-ignore - JS module, types provided via d.ts shim
import { useDeleteClass } from '@/hooks/useClasses'
import ClassForm from '@/components/classes/ClassForm'

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

type ClassItem = {
  id: string
  name: string
  teacher: string
  students: number
  subject: string
  status: 'active' | 'inactive'
}

const SUBJECTS = ['Math', 'Biology', 'History', 'Physics', 'Chemistry']

export default function ClassesPage() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all'|'active'|'inactive'>('all')
  const [view, setView] = useState<'grid'|'table'>('grid')
  const [page] = useState(1)
  const [perPage] = useState(12)
  const [editing, setEditing] = useState<any>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const { data: editingData, isLoading: isLoadingEditing } = useGetClassDetail(editingId as any, { include: ['students'], perPage: { students: 50 } })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<{ id: number | null; name: string | null }>({ id: null, name: null })
  const deleteMut = useDeleteClass()

  const { data: apiData, isSuccess } = useGetClasses({ page, perPage })

  const dataset: ClassItem[] = useMemo(() => {
    if (isSuccess) {
      const items = (apiData?.data || apiData?.items || []) as any[]
      return items.map((it: any, idx: number) => ({
        id: String(it.id),
        name: it.name,
        teacher: it.teacher?.name || '—',
        students: Array.isArray(it.students) ? it.students.length : (it.students_count || 0),
        subject: it.subject?.name || SUBJECTS[idx % SUBJECTS.length],
        status: 'active',
      })) as ClassItem[]
    }
    return classes.map((c, idx) => ({
      ...c,
      subject: SUBJECTS[idx % SUBJECTS.length],
      status: idx % 4 === 0 ? 'inactive' : 'active',
    })) as ClassItem[]
  }, [apiData, isSuccess])

  const filtered = useMemo(() => {
    return dataset.filter((c) => {
      const q = query.toLowerCase()
      const matchesQ = !q || c.name.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q)
      const matchesS = status === 'all' || c.status === status
      return matchesQ && matchesS
    })
  }, [dataset, query, status])
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
          <p className="text-slate-600">Browse your classes or create a new one</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-64 rounded-2xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:border-brand-blue" placeholder="Search classes" />
          </div>
          <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
            <button onClick={()=>setView('grid')} className={`rounded-xl px-3 py-1.5 flex items-center gap-1 ${view==='grid'?'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:bg-white/60'}`}><LayoutGrid className="h-4 w-4"/> Grid</button>
            <button onClick={()=>setView('table')} className={`rounded-xl px-3 py-1.5 flex items-center gap-1 ${view==='table'?'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:bg-white/60'}`}><Table className="h-4 w-4"/> Table</button>
          </div>
        </div>

        <Modal open={open} onOpenChange={setOpen}>
          <ModalTrigger asChild>
            <Button variant="outline" className="gap-2"><Plus className="h-4 w-4"/> Create New Class</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader title={editingId ? 'Edit Class' : 'Create a Class'} description={editingId ? undefined : 'Set up a new class to invite students'} />
            <div className="grid gap-3">
              {editingId && isLoadingEditing ? (
                <div className="p-3 text-sm text-slate-600">Loading class details...</div>
              ) : (
                <ClassForm
                  editing={editingId ? (editingData || editing) : null}
                  onSuccess={() => { setOpen(false); setEditing(null); setEditingId(null) }}
                  onCancel={() => { setOpen(false); setEditing(null); setEditingId(null) }}
                />
              )}
            </div>
          </ModalContent>
        </Modal>

        <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ModalContent>
            <ModalHeader title="Delete Class" description="Are you sure you want to delete this class?" />
            <div className="grid gap-3">
              <div className="text-sm text-slate-700">{deleting.name ? `Class: ${deleting.name}` : ''}</div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button
                  variant="outline"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={async () => {
                    if (deleting.id) {
                      await deleteMut.mutateAsync(deleting.id)
                    }
                    setConfirmOpen(false)
                    setDeleting({ id: null, name: null })
                  }}
                  disabled={deleteMut.isPending}
                >
                  {deleteMut.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>

      {view==='grid' ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((c, idx) => {
          const progress = 60 + ((idx * 13) % 35)
          return (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{c.name}</span>
                  <span className="rounded-xl bg-slate-100 px-2 py-1 text-xs text-slate-600">{progress}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <UserRound className="h-4 w-4" /> {c.teacher}
                  <span className="mx-1">•</span>
                  <Users className="h-4 w-4" /> {c.students} students
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${c.status==='active'?'bg-green-100 text-green-700':'bg-slate-200 text-slate-700'}`}>{c.status}</span>
                </div>
                <ProgressBar value={progress} />
                <div className="flex justify-between">
                  <Link to={`/class/${c.id}`}>
                    <Button variant="outline">Open</Button>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-8 px-2" onClick={() => { setEditing(c); setEditingId(Number(c.id)); setOpen(true) }}><Edit3 className="h-4 w-4"/></Button>
                    <Button variant="outline" className="h-8 px-2" onClick={() => { setDeleting({ id: Number(c.id), name: c.name }); setConfirmOpen(true) }}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          <div className="m-3 flex items-center justify-between">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
              {(['all','active','inactive'] as const).map((s) => (
                <button key={s} onClick={()=>setStatus(s)} className={`rounded-xl px-3 py-1.5 ${status===s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}>{s}</button>
              ))}
            </div>
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Filters</Button>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Class Name</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Teacher</th>
                <th className="px-4 py-2 text-left">Students</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.subject}</td>
                  <td className="px-4 py-3">{c.teacher}</td>
                  <td className="px-4 py-3">{c.students}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${c.status==='active'?'bg-green-100 text-green-700':'bg-slate-200 text-slate-700'}`}>{c.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-8 px-2" onClick={() => { setEditing(c); setEditingId(Number(c.id)); setOpen(true) }}><Edit3 className="h-4 w-4"/></Button>
                      <Button variant="outline" className="h-8 px-2" onClick={() => { setDeleting({ id: Number(c.id), name: c.name }); setConfirmOpen(true) }}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      )}
    </div>
  )
}

