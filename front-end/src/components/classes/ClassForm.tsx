import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateClass, useUpdateClass } from '@/hooks/useClasses'

type FormState = { name: string; subject_id: string | number | ''; teacher_id: string | number | ''; description: string }

const initialState: FormState = { name: '', subject_id: '', teacher_id: '', description: '' }

export default function ClassForm({ editing, onSuccess, onCancel }: { editing?: any; onSuccess?: () => void; onCancel?: () => void }) {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const createMut = useCreateClass()
  const updateMut = useUpdateClass()

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        subject_id: editing.subject_id || '',
        teacher_id: editing.teacher_id || '',
        description: editing.description || '',
      })
    } else {
      setForm(initialState)
    }
  }, [editing])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name?.trim()) e.name = 'Name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const normalize = (payload: FormState) => ({
    name: payload.name,
    subject_id: payload.subject_id ? Number(payload.subject_id) : null,
    teacher_id: payload.teacher_id ? Number(payload.teacher_id) : null,
    description: payload.description || null,
  })

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      if (editing?.id) {
        await updateMut.mutateAsync({ id: editing.id, payload: normalize(form) })
      } else {
        await createMut.mutateAsync(normalize(form))
      }
      onSuccess?.()
    } catch (err) {
      alert('Save failed')
    }
  }

  const onChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((s) => ({ ...s, [key]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.name}
          onChange={onChange('name')}
          placeholder="Class name"
          required
        />
        {errors.name ? <div className="text-xs text-red-600 mt-1">{errors.name}</div> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Subject ID</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.subject_id}
            onChange={onChange('subject_id')}
            placeholder="e.g. 1"
            type="number"
            min={1}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Teacher ID</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.teacher_id}
            onChange={onChange('teacher_id')}
            placeholder="e.g. 5"
            type="number"
            min={1}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={form.description}
          onChange={onChange('description')}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
          {editing?.id ? (updateMut.isPending ? 'Saving...' : 'Save') : (createMut.isPending ? 'Creating...' : 'Create')}
        </Button>
      </div>
    </form>
  )
}



