import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit3, Trash2, ArrowLeftCircle } from 'lucide-react'

type Row = { id: string; title: string; date: string; duration: string; status: 'upcoming'|'ongoing'|'finished' }
const base: Row[] = Array.from({ length: 8 }, (_, i) => ({
  id: `E${100+i}`,
  title: `Exam ${i+1}`,
  date: `2025-11-${String((i%28)+1).padStart(2,'0')}`,
  duration: `${60 + (i*15)%120} mins`,
  status: (['upcoming','ongoing','finished'] as const)[i%3],
}))

export default function ClassExamsPage() {
  const { id } = useParams()
  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])
  const [status, setStatus] = useState<'all'|'upcoming'|'ongoing'|'finished'>('all')
  const rows = useMemo(()=> base.filter(r => status==='all' ? true : r.status===status), [status])
  return (
    <div className="grid gap-6">
      <div>
        <Link
          to={`/class/${id}`}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
        >
          <ArrowLeftCircle className="h-4 w-4 transition-colors group-hover:text-brand-blue"/>
          Back to Class Detail
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Class Exams</h1>
          <p className="text-slate-600">Manage exams and track results</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4"/> Create New Exam</Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
          {(['all','upcoming','ongoing','finished'] as const).map(s => (
            <button key={s} onClick={()=>setStatus(s)} className={`rounded-xl px-3 py-1.5 ${status===s?'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:bg-white/60'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{r.title}</span>
                  <span className="text-sm text-slate-600">{r.date} • {r.duration}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status==='upcoming'?'bg-amber-100 text-amber-700':r.status==='ongoing'?'bg-blue-100 text-blue-700':'bg-slate-200 text-slate-700'}`}>{r.status}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-8 px-2"><Eye className="h-4 w-4"/></Button>
                  <Button variant="outline" className="h-8 px-2"><Edit3 className="h-4 w-4"/></Button>
                  <Button variant="outline" className="h-8 px-2 text-red-600"><Trash2 className="h-4 w-4"/></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {[{name:'Alice',score:98},{name:'Bob',score:95},{name:'Charlie',score:92}].map((s,i)=>(
              <div key={s.name} className="flex items-center justify-between rounded-xl border p-3">
                <div className="font-medium">{i+1}. {s.name}</div>
                <div className="text-sm text-slate-600">{s.score}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

