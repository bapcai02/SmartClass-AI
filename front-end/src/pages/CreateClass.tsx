import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Errors = Partial<Record<string, string>>

export default function CreateClassPage() {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    teacher: '',
    semester: '',
    description: '',
    maxStudents: '',
    startDate: '',
    endDate: '',
  })
  const [errors, setErrors] = useState<Errors>({})

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Class name is required'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.teacher.trim()) e.teacher = 'Please select a teacher'
    if (!form.semester.trim()) e.semester = 'Semester is required'
    if (form.maxStudents && Number(form.maxStudents) <= 0) e.maxStudents = 'Must be greater than 0'
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = 'End date must be after start date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // ready to submit to backend later
    alert('Saved')
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo lớp học</h1>
        <p className="text-slate-600">Nhập thông tin lớp và lưu khi hoàn tất</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin lớp</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6 max-w-3xl" onSubmit={onSubmit} noValidate>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Tên lớp</label>
              <input
                className={`rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue ${errors.name?'border-red-300':''}`}
                placeholder="VD: Đại số 1"
                value={form.name}
                onChange={(e)=>update('name', e.target.value)}
              />
                {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
            </div>

            <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Môn học</label>
                <input
                  className={`rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue ${errors.subject?'border-red-300':''}`}
                  placeholder="VD: Toán học"
                  value={form.subject}
                  onChange={(e)=>update('subject', e.target.value)}
                />
                {errors.subject && <span className="text-xs text-red-600">{errors.subject}</span>}
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Giáo viên</label>
                <select
                  className={`rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue ${errors.teacher?'border-red-300':''}`}
                  value={form.teacher}
                  onChange={(e)=>update('teacher', e.target.value)}
                >
                  <option value="">Chọn giáo viên</option>
                  <option>Cô Johnson</option>
                  <option>Thầy Lee</option>
                  <option>Thầy Patel</option>
                </select>
                {errors.teacher && <span className="text-xs text-red-600">{errors.teacher}</span>}
              </div>
            </div>

            <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Học kỳ</label>
                <input
                  className={`rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue ${errors.semester?'border-red-300':''}`}
                  placeholder="VD: Học kỳ I 2025"
                  value={form.semester}
                  onChange={(e)=>update('semester', e.target.value)}
                />
                {errors.semester && <span className="text-xs text-red-600">{errors.semester}</span>}
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Sĩ số tối đa</label>
                <input
                  type="number"
                  className={`rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue ${errors.maxStudents?'border-red-300':''}`}
                  placeholder="VD: 30"
                  value={form.maxStudents}
                  onChange={(e)=>update('maxStudents', e.target.value)}
                />
                {errors.maxStudents && <span className="text-xs text-red-600">{errors.maxStudents}</span>}
              </div>
            </div>

            <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue"
                  value={form.startDate}
                  onChange={(e)=>update('startDate', e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Ngày kết thúc</label>
                <input
                  type="date"
                  className={`rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue ${errors.endDate?'border-red-300':''}`}
                  value={form.endDate}
                  onChange={(e)=>update('endDate', e.target.value)}
                />
                {errors.endDate && <span className="text-xs text-red-600">{errors.endDate}</span>}
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                className="min-h-28 rounded-2xl border px-3 py-2 border-slate-300 focus:border-brand-blue"
                placeholder="Mô tả ngắn..."
                value={form.description}
                onChange={(e)=>update('description', e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit">Lưu</Button>
              <Button type="button" variant="outline">Hủy</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

