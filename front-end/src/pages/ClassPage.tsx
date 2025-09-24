import { useState } from 'react'
import ClassTable from '@/components/classes/ClassTable'
import ClassForm from '@/components/classes/ClassForm'
import { Button } from '@/components/ui/button'

export default function ClassPage() {
  const [page, setPage] = useState<number>(1)
  const [perPage] = useState<number>(10)
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState<boolean>(false)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>New Class</Button>
      </div>

      {showForm ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-medium mb-3">{editing ? 'Edit Class' : 'Create Class'}</h2>
          <ClassForm
            editing={editing}
            onSuccess={() => { setShowForm(false); setEditing(null) }}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      ) : null}

      <ClassTable
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onEdit={(c) => { setEditing(c); setShowForm(true) }}
      />
    </div>
  )
}
