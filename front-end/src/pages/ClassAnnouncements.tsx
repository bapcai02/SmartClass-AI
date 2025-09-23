import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pin } from 'lucide-react'

type Row = { id: string; title: string; author: string; date: string; content: string; pinned?: boolean }
const base: Row[] = Array.from({ length: 8 }, (_, i) => ({
  id: `N${i+1}`,
  title: `Announcement ${i+1}`,
  author: ['Ms. Johnson','Mr. Patel','Dr. Lee'][i%3],
  date: `2025-10-${String((i%28)+1).padStart(2,'0')}`,
  content: 'Short announcement content goes here. Click to expand for full text.',
  pinned: i===0,
}))

export default function ClassAnnouncementsPage() {
  const { id } = useParams()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const sorted = useMemo(()=> [...base].sort((a,b)=> (b.pinned?1:0) - (a.pinned?1:0)), [])
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Class Announcements</h1>
          <p className="text-slate-600">Share updates and pin important messages</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4"/> New Announcement</Button>
      </div>

      <div className="grid gap-3">
        {sorted.map((n)=> (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{n.title}</span>
                <span className="text-sm text-slate-600">{n.author} • {n.date} {n.pinned && <Pin className="ml-1 inline h-4 w-4 text-amber-600"/>}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-700">
                {expanded[n.id] ? (
                  <>
                    {n.content} Full details of the announcement would be shown here...
                    <button className="ml-2 text-brand-blue" onClick={()=>setExpanded({...expanded,[n.id]:false})}>Collapse</button>
                  </>
                ) : (
                  <>
                    {n.content}
                    <button className="ml-2 text-brand-blue" onClick={()=>setExpanded({...expanded,[n.id]:true})}>Read more</button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

