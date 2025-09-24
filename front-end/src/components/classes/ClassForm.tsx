import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateClass, useUpdateClass } from '@/hooks/useClasses'
import { useSubjectSearch, useUserSearch } from '@/hooks/useLookup'
import { type SubjectDto, type UserDto } from '@/api/lookup'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject_id: z.union([z.number(), z.string()]).refine((v) => String(v).length > 0, 'Subject is required'),
  teacher_id: z.union([z.number(), z.string()]).refine((v) => String(v).length > 0, 'Teacher is required'),
  description: z.string().min(1, 'Description is required'),
})

type FormState = z.infer<typeof schema>

const initialState: FormState = { name: '', subject_id: '', teacher_id: '', description: '' }

export default function ClassForm({ editing, onSuccess, onCancel }: { editing?: any; onSuccess?: () => void; onCancel?: () => void }) {
  const [form, setForm] = useState<FormState>(initialState)
  const createMut = useCreateClass()
  const updateMut = useUpdateClass()
  const [subjectQuery, setSubjectQuery] = useState('')
  const [teacherQuery, setTeacherQuery] = useState('')
  const [subjectOpen, setSubjectOpen] = useState(false)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [studentQuery, setStudentQuery] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const { data: subjectOpts = [] } = useSubjectSearch(subjectQuery)
  const { data: teacherOpts = [] } = useUserSearch(teacherQuery, 'teacher')
  const { data: studentOpts = [] } = useUserSearch(studentQuery, 'student')
  const subjects: SubjectDto[] = subjectOpts as SubjectDto[]
  const teachers: UserDto[] = teacherOpts as UserDto[]
  const students: UserDto[] = studentOpts as UserDto[]

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        subject_id: editing.subject_id || '',
        teacher_id: editing.teacher_id || '',
        description: editing.description || '',
      })
      setSelectedStudentIds(Array.isArray(editing.students) ? editing.students.map((s: any) => Number(s.id)) : [])
    } else {
      setForm(initialState)
      setSelectedStudentIds([])
    }
  }, [editing])

  const { register, handleSubmit, formState: { errors, isSubmitted }, setValue, trigger } = useForm<FormState>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialState,
    values: form,
  })

  const normalize = (payload: FormState) => ({
    name: payload.name,
    subject_id: payload.subject_id ? Number(payload.subject_id) : null,
    teacher_id: payload.teacher_id ? Number(payload.teacher_id) : null,
    description: payload.description || null,
    student_ids: selectedStudentIds,
  })

  const onSubmit = async (data: FormState) => {
    try {
      const payload = normalize(data)
      if (selectedStudentIds.length === 0) throw new Error('At least one student is required')
      if (editing?.id) {
        await updateMut.mutateAsync({ id: editing.id, payload })
      } else {
        await createMut.mutateAsync(payload)
      }
      onSuccess?.()
    } catch (err) {
      alert((err as Error).message || 'Save failed')
    }
  }

  const onChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value
    setForm((s) => ({ ...s, [key]: v }))
    setValue(key, v as any)
    trigger(key)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.name}
          onChange={onChange('name')}
          placeholder="Class name"
        />
        {errors.name?.message ? <div className="text-xs text-red-600 mt-1">{errors.name.message}</div> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="text-sm font-medium">Subject</label>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm"
            onClick={() => setSubjectOpen((v) => !v)}
          >
            <span>
              {form.subject_id ? subjects.find((s: SubjectDto) => String(s.id) === String(form.subject_id))?.name || `#${form.subject_id}` : 'Select subject'}
            </span>
            <span className="text-slate-500">▾</span>
          </button>
          {subjectOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
              <div className="p-2">
                <input
                  autoFocus
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Search subject..."
                  value={subjectQuery}
                  onChange={(e) => setSubjectQuery(e.target.value)}
                />
              </div>
              <div className="max-h-56 overflow-auto">
                {subjects.map((s: SubjectDto) => (
                  <button
                    type="button"
                    key={s.id}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${String(form.subject_id)===String(s.id)?'bg-slate-100':''}`}
                    onClick={() => { setForm((st) => ({ ...st, subject_id: s.id })); setSubjectOpen(false) }}
                  >
                    {s.name}
                  </button>
                ))}
                {(subjects.length===0) && (
                  <div className="px-3 py-2 text-sm text-slate-500">No results</div>
                )}
              </div>
            </div>
          )}
          {errors.subject_id?.message ? <div className="text-xs text-red-600 mt-1">{errors.subject_id.message}</div> : null}
        </div>

        <div className="relative">
          <label className="text-sm font-medium">Teacher</label>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm"
            onClick={() => setTeacherOpen((v) => !v)}
          >
            <span>
              {form.teacher_id ? teachers.find((u: UserDto) => String(u.id) === String(form.teacher_id))?.name || `#${form.teacher_id}` : 'Select teacher'}
            </span>
            <span className="text-slate-500">▾</span>
          </button>
          {teacherOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
              <div className="p-2">
                <input
                  autoFocus
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Search teacher..."
                  value={teacherQuery}
                  onChange={(e) => setTeacherQuery(e.target.value)}
                />
              </div>
              <div className="max-h-56 overflow-auto">
                {teachers.map((u: UserDto) => (
                  <button
                    type="button"
                    key={u.id}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${String(form.teacher_id)===String(u.id)?'bg-slate-100':''}`}
                    onClick={() => { setForm((st) => ({ ...st, teacher_id: u.id })); setTeacherOpen(false) }}
                  >
                    {u.name} ({u.email})
                  </button>
                ))}
                {(teachers.length===0) && (
                  <div className="px-3 py-2 text-sm text-slate-500">No results</div>
                )}
              </div>
            </div>
          )}
          {errors.teacher_id?.message ? <div className="text-xs text-red-600 mt-1">{errors.teacher_id.message}</div> : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Students</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search students..."
          value={studentQuery}
          onChange={(e) => setStudentQuery(e.target.value)}
        />
        <div className="mt-2 max-h-40 overflow-auto rounded-md border border-slate-200">
          {students.map((u: UserDto) => {
            const checked = selectedStudentIds.includes(u.id)
            return (
              <label key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={checked}
                  onChange={(e) => {
                    setSelectedStudentIds((prev) => {
                      if (e.target.checked) return Array.from(new Set([...prev, u.id]))
                      return prev.filter((id) => id !== u.id)
                    })
                  }}
                />
                <span>{u.name} ({u.email})</span>
              </label>
            )
          })}
          {(students.length === 0) && (
        <div className="px-3 py-2 text-sm text-slate-500">No results</div>
          )}
        </div>
        {Array.isArray(selectedStudentIds) && selectedStudentIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedStudentIds.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                #{id}
                <button type="button" className="ml-1 text-slate-500 hover:text-slate-700" onClick={() => setSelectedStudentIds((prev) => prev.filter((x) => x !== id))}>×</button>
              </span>
            ))}
          </div>
        )}
      {isSubmitted && selectedStudentIds.length === 0 ? <div className="text-xs text-red-600 mt-1">At least one student is required</div> : null}
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.description}
          onChange={onChange('description')}
          placeholder="Description"
          rows={3}
        />
        {errors.description?.message ? <div className="text-xs text-red-600 mt-1">{errors.description.message}</div> : null}
      </div>

      

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={createMut.isPending || updateMut.isPending}>
          {editing?.id ? (updateMut.isPending ? 'Saving...' : 'Save') : (createMut.isPending ? 'Creating...' : 'Create')}
        </Button>
      </div>
    </form>
  )
}



