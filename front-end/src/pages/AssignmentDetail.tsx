import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AssignmentDetailPage() {
  const [view, setView] = useState<'student'|'teacher'>('student')
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button variant={view==='student'?'default':'outline'} onClick={()=>setView('student')}>Student View</Button>
        <Button variant={view==='teacher'?'default':'outline'} onClick={()=>setView('teacher')}>Teacher View</Button>
      </div>

      {view === 'student' ? <StudentView /> : <TeacherView />}
    </div>
  )
}

function StudentView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algebra Assignment</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <div className="text-sm text-slate-600">Timer: 00:30:00</div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border p-3">
            <div className="font-medium">1) What is 2 + 2?</div>
            <div className="mt-2 grid gap-2">
              {['3','4','5','6'].map((o)=> (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="q1" /> {o}
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-3">
            <div className="font-medium">2) Explain the distributive property.</div>
            <textarea className="mt-2 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue" rows={4} />
          </div>
        </div>
        <Button className="justify-self-start">Submit</Button>
      </CardContent>
    </Card>
  )
}

function TeacherView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create / Configure Assignment</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Title</label>
          <input className="rounded-2xl border px-3 py-2" placeholder="Assignment title" />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Upload Questions (CSV / JSON)</label>
          <input type="file" className="rounded-2xl border px-3 py-2" />
        </div>
        <div className="grid gap-1 sm:grid-cols-3 sm:items-end sm:gap-3">
          <div>
            <label className="text-sm font-medium">Time Limit (mins)</label>
            <input type="number" className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue" defaultValue={30} />
          </div>
          <div>
            <label className="text-sm font-medium">Attempts</label>
            <input type="number" className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue" defaultValue={1} />
          </div>
          <div>
            <Button className="w-full">Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

