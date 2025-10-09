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
          <h1 className="text-2xl font-semibold tracking-tight">{isLoading ? 'Đang tải…' : (data?.name || 'Lớp')}</h1>
          <p className="text-slate-600">
            {isLoading ? 'Loading…' : (
              <>Môn: {data?.subject?.name || '-'} • Giáo viên: {data?.teacher?.name || '-'}{data?.teacher?.email ? ` (${data.teacher.email})` : ''}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Modal open={open} onOpenChange={setOpen}>
            <ModalTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}><Edit3 className="h-4 w-4"/> Sửa</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader title={'Sửa lớp'} />
              <div className="grid gap-3">
                {isLoading ? (
                  <div className="p-3 text-sm text-slate-600">Đang tải chi tiết lớp...</div>
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
              <Button variant="outline" className="gap-2 text-red-600" onClick={() => setConfirmOpen(true)}><Trash2 className="h-4 w-4"/> Xóa</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader title={'Xóa lớp'} description={'Bạn có chắc muốn xóa lớp này?'} />
              <div className="grid gap-3">
                <div className="text-sm text-slate-700">{data?.name}</div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>Hủy</Button>
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
                    {deleteMut.isPending ? 'Đang xóa...' : 'Xóa'}
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
            <div className="text-xs text-slate-600">Tổng số học sinh</div>
            <div className="text-3xl font-semibold">{isLoading ? '—' : (data?.students_count ?? '—')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Tỉ lệ chuyên cần</div>
            <div className="text-3xl font-semibold">{isLoading ? '—' : (data?.attendance_rate != null ? `${data.attendance_rate}%` : '—')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Điểm trung bình</div>
            <div className="text-3xl font-semibold">{isLoading ? '—' : (data?.average_grade != null ? data.average_grade : '—')}</div>
          </CardContent>
        </Card>
      </section>

      {/* Upcoming lessons + Progress chart */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiết học sắp tới</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {isLoading ? (
              <div className="text-sm text-slate-600">Đang tải…</div>
            ) : (
              (data as any)?.timetables?.length ? (data as any).timetables.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <div className="font-medium">{data?.subject?.name || 'Tiết học'}</div>
                    <div className="text-sm text-slate-600">Thứ {l.day_of_week} • {l.start_time} - {l.end_time} {l.room ? `• ${l.room}` : ''}</div>
                  </div>
                  <Button variant="outline">Xem</Button>
                </div>
              )) : (
                <div className="text-sm text-slate-600">Không có tiết học sắp tới</div>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiến độ theo thời gian</CardTitle>
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
        <CardHeader><CardTitle>Điều hướng lớp</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { to: `/class/${id}`, label: 'Tổng quan', icon: LayoutDashboard },
            { to: `/class/${id}/students`, label: 'Học sinh', icon: UsersIcon },
            { to: `/class/${id}/attendance`, label: 'Điểm danh', icon: CalendarDays },
            { to: `/class/${id}/resources`, label: 'Tài nguyên', icon: FolderOpen },
            { to: `/class/${id}/assignments`, label: 'Bài tập', icon: NotebookTabs },
            { to: `/class/${id}/exams`, label: 'Bài kiểm tra', icon: FileBarChart },
            { to: `/class/${id}/grades`, label: 'Điểm số', icon: BarChart3 },
            { to: `/class/${id}/announcements`, label: 'Thông báo', icon: Megaphone },
            { to: `/class/${id}/discussion`, label: 'Thảo luận', icon: MessageSquare },
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
        <CardHeader><CardTitle>Thống kê lớp</CardTitle></CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Chỉ số</th>
                <th className="px-4 py-2 text-left">Giá trị</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Tổng số học sinh</td><td className="px-4 py-3">{isLoading ? '—' : (data?.students_count ?? '—')}</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Tỉ lệ chuyên cần</td><td className="px-4 py-3">94%</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Điểm trung bình</td><td className="px-4 py-3">B+</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Bài tập</td><td className="px-4 py-3">{isLoading ? '—' : (data?.assignments_count ?? '—')}</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Bài kiểm tra</td><td className="px-4 py-3">{isLoading ? '—' : (data?.exams_count ?? '—')}</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Tài nguyên</td><td className="px-4 py-3">{isLoading ? '—' : (data?.resources_count ?? '—')}</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Thông báo</td><td className="px-4 py-3">16</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  )
}

