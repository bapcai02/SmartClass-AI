import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'
import { classes } from '@/data/dummy'
import { Link } from 'react-router-dom'
import { Plus, Users, UserRound } from 'lucide-react'
import { useState } from 'react'

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

export default function ClassesPage() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
          <p className="text-slate-600">Browse your classes or create a new one</p>
        </div>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4"/> Create Class</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader title="Create a Class" description="Set up a new class to invite students" />
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium">Class name</label>
                <input className="mt-1 w-full rounded-2xl border px-3 py-2" placeholder="e.g., Algebra I" />
              </div>
              <div>
                <label className="text-sm font-medium">Teacher</label>
                <input className="mt-1 w-full rounded-2xl border px-3 py-2" placeholder="Your name" />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setOpen(false)}>Create</Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {classes.map((c, idx) => {
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
                </div>
                <ProgressBar value={progress} />
                <div className="flex justify-between">
                  <Link to={`/class/${c.id}`}>
                    <Button variant="outline">Open</Button>
                  </Link>
                  <Button variant="ghost">Manage</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

