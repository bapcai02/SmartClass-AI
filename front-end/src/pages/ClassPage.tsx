import { useState } from 'react'
import ClassTable from '@/components/classes/ClassTable'
import ClassForm from '@/components/classes/ClassForm'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'

export default function ClassPage() {
  const [page, setPage] = useState<number>(1)
  const [perPage] = useState<number>(10)
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState<boolean>(false)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
        <Modal open={showForm} onOpenChange={setShowForm}>
          <ModalTrigger asChild>
            <Button onClick={() => { setEditing(null); setShowForm(true) }}>Create a Class</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader title={editing ? 'Edit Class' : 'Create a Class'} description={editing ? undefined : 'Set up a new class to invite students'} />
            <div className="grid gap-3">
              <ClassForm
                editing={editing}
                onSuccess={() => { setShowForm(false); setEditing(null) }}
                onCancel={() => { setShowForm(false); setEditing(null) }}
              />
            </div>
          </ModalContent>
        </Modal>
      </div>

      <ClassTable
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onEdit={(c) => { setEditing(c); setShowForm(true) }}
      />
    </div>
  )
}
