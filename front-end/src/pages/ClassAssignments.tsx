import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit3, Trash2, Filter } from 'lucide-react'

type Row = { id: string; title: string; deadline: string; status: 'open'|'closed'; submissions: number; rate: number }
const base: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: `A${100+i}`,
  title: `Assignment ${i+1}`,
  deadline: `2025-10-${String((i%28)+1).padStart(2,'0')}`,
  status: i % 3 === 0 ? 'closed' : 'open',
  submissions: 10 + (i*3)%20,
  rate: 40 + (i*5)%60,
}))

export default function ClassAssignmentsPage() {
  const { id } = useParams()
  const [status, setStatus] = useState<'all'|'open'|'closed'>('all')
  const rows = useMemo(()=> base.filter(r => status==='all' ? true : r.status===status), [status])
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Class Assignments</h1>
          <p className="text-slate-600">Manage and track class assignments</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4"/> Create New Assignment</Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
          {(['all','open','closed'] as const).map(s => (
            <button key={s} onClick={()=>setStatus(s)} className={`rounded-xl px-3 py-1.5 ${status===s?'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:bg-white/60'}`}>{s}</button>
          ))}
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Filters</Button>
      </div>

      <div className="grid gap-4">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.title}</span>
                <span className="text-sm text-slate-600">Deadline: {r.deadline}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status==='open'?'bg-green-100 text-green-700':'bg-slate-200 text-slate-700'}`}>{r.status}</span>
                <span className="mx-1">•</span>
                Submissions: {r.submissions}
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-brand-blue" style={{ width: `${r.rate}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-8 px-2"><Eye className="h-4 w-4"/></Button>
                <Button variant="outline" className="h-8 px-2"><Edit3 className="h-4 w-4"/></Button>
                <Button variant="outline" className="h-8 px-2 text-red-600"><Trash2 className="h-4 w-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

