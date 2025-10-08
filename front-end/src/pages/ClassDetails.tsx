import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Edit3, Trash2, LayoutDashboard, Users as UsersIcon, CalendarDays, FolderOpen, NotebookTabs, FileBarChart, BarChart3, Megaphone, MessageSquare } from 'lucide-react'
// @ts-ignore
import { useGetClassDetail } from '@/hooks/useClasses'
// @ts-ignore
import { useDeleteClass } from '@/hooks/useClasses'
import { useState } from 'react'
import ClassForm from '@/components/classes/ClassForm'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'

export default function ClassDetailsPage() {
  const { id } = useParams()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteMut = useDeleteClass()
  const navigate = useNavigate()
  const { data, isLoading } = useGetClassDetail(id as any, { include: ['students','timetables'], perPage: { students: 50, } })
  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isLoading ? 'Loading…' : (data?.name || 'Class')}</h1>
          <p className="text-slate-600">
            {isLoading ? 'Loading…' : (
              <>Subject: {data?.subject?.name || '-'} • Teacher: {data?.teacher?.name || '-'}{data?.teacher?.email ? ` (${data.teacher.email})` : ''}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Modal open={open} onOpenChange={setOpen}>
            <ModalTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}><Edit3 className="h-4 w-4"/> Edit</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader title={'Edit Class'} />
              <div className="grid gap-3">
                {isLoading ? (
                  <div className="p-3 text-sm text-slate-600">Loading class details...</div>
                ) : (
                  <ClassForm
                    editing={data as any}
                    onSuccess={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                  />
                )}
              </div>
            </ModalContent>
          </Modal>
          <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
            <ModalTrigger asChild>
              <Button variant="outline" className="gap-2 text-red-600" onClick={() => setConfirmOpen(true)}><Trash2 className="h-4 w-4"/> Delete</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader title={'Delete Class'} description={'Are you sure you want to delete this class?'} />
              <div className="grid gap-3">
                <div className="text-sm text-slate-700">{data?.name}</div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                  <Button
                    variant="outline"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={async () => {
                      if (!id) return
                      await deleteMut.mutateAsync(Number(id))
                      setConfirmOpen(false)
                      navigate('/classes', { replace: true })
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
      </div>

      {/* Overview cards */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Total Students</div>
            <div className="text-3xl font-semibold">{isLoading ? '—' : (data?.students_count ?? '—')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Attendance Rate</div>
            <div className="text-3xl font-semibold">{isLoading ? '—' : (data?.attendance_rate != null ? `${data.attendance_rate}%` : '—')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Average Grade</div>
            <div className="text-3xl font-semibold">{isLoading ? '—' : (data?.average_grade != null ? data.average_grade : '—')}</div>
          </CardContent>
        </Card>
      </section>

      {/* Upcoming lessons + Progress chart */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Lessons</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {isLoading ? (
              <div className="text-sm text-slate-600">Loading…</div>
            ) : (
              (data as any)?.timetables?.length ? (data as any).timetables.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <div className="font-medium">{data?.subject?.name || 'Lesson'}</div>
                    <div className="text-sm text-slate-600">Day {l.day_of_week} • {l.start_time} - {l.end_time} {l.room ? `• ${l.room}` : ''}</div>
                  </div>
                  <Button variant="outline">View</Button>
                </div>
              )) : (
                <div className="text-sm text-slate-600">No upcoming lessons</div>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(data?.performance_over_time || []).map((p)=>({ w: p.week, score: p.score }))} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="w" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      {/* Class navigation moved here: */}
      <Card>
        <CardHeader><CardTitle>Class Navigation</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { to: `/class/${id}`, label: 'Overview', icon: LayoutDashboard },
            { to: `/class/${id}/students`, label: 'Students', icon: UsersIcon },
            { to: `/class/${id}/attendance`, label: 'Attendance', icon: CalendarDays },
            { to: `/class/${id}/resources`, label: 'Resources', icon: FolderOpen },
            { to: `/class/${id}/assignments`, label: 'Assignments', icon: NotebookTabs },
            { to: `/class/${id}/exams`, label: 'Exams / Competitions', icon: FileBarChart },
            { to: `/class/${id}/grades`, label: 'Grades', icon: BarChart3 },
            { to: `/class/${id}/announcements`, label: 'Announcements', icon: Megaphone },
            { to: `/class/${id}/discussion`, label: 'Discussion', icon: MessageSquare },
          ].map((l) => {
            const Ico = l.icon
            return (
              <NavLink key={l.to} to={l.to} className={({isActive})=>`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm ${isActive?'border-brand-blue text-brand-blue':'border-slate-300 text-slate-800 hover:border-slate-400'}`}>
                <Ico className="h-4 w-4" /> {l.label}
              </NavLink>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Class Statistics</CardTitle></CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Metric</th>
                <th className="px-4 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Total Students</td><td className="px-4 py-3">{isLoading ? '—' : (data?.students_count ?? '—')}</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Attendance Rate</td><td className="px-4 py-3">94%</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Average Grade</td><td className="px-4 py-3">B+</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Assignments</td><td className="px-4 py-3">{isLoading ? '—' : (data?.assignments_count ?? '—')}</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Exams</td><td className="px-4 py-3">{isLoading ? '—' : (data?.exams_count ?? '—')}</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Resources</td><td className="px-4 py-3">{isLoading ? '—' : (data?.resources_count ?? '—')}</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Announcements</td><td className="px-4 py-3">16</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  )
}

