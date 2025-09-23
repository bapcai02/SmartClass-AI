import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, Trash2, Upload, Search, Filter } from 'lucide-react'

type FileRow = { name: string; type: 'PDF'|'Video'|'Image'; uploaded: string; by: string }
const base: FileRow[] = Array.from({ length: 18 }, (_, i) => ({
  name: `Resource_${i+1}.${i%3===0?'pdf':i%3===1?'mp4':'png'}`,
  type: (['PDF','Video','Image'] as const)[i%3],
  uploaded: `2025-10-${String((i%28)+1).padStart(2,'0')}`,
  by: ['Ms. Johnson', 'Mr. Patel', 'Dr. Lee'][i%3],
}))

export default function ClassResourcesManagePage() {
  const { id } = useParams()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'All'|'Documents'|'Videos'|'Images'>('All')
  const filtered = useMemo(()=>{
    const q = query.toLowerCase()
    return base.filter(r=>{
      const matchQ = !q || r.name.toLowerCase().includes(q) || r.by.toLowerCase().includes(q)
      const map: Record<typeof tab, FileRow['type'][]> = { All:['PDF','Video','Image'], Documents:['PDF'], Videos:['Video'], Images:['Image'] }
      const matchT = map[tab].includes(r.type)
      return matchQ && matchT
    })
  },[query, tab])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/class/${id}`} className="text-sm text-brand-blue">← Back to Class Detail</Link>
          <h1 className="text-2xl font-semibold tracking-tight">Class Resources</h1>
          <p className="text-slate-600">Manage course documents, videos, and images</p>
        </div>
        <Button variant="outline" className="gap-2"><Upload className="h-4 w-4"/> Upload</Button>
      </div>

      {/* Drag & drop */}
      <Card>
        <CardContent className="p-6">
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 py-10 text-center text-slate-600">
            Drag and drop files here, or click Upload
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm">
          {(['All','Documents','Videos','Images'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`rounded-xl px-3 py-1.5 ${tab===t?'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:bg-white/60'}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-72 rounded-2xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:border-brand-blue" placeholder="Search files" />
          </div>
          <Button variant="outline" className="gap-2"><Filter className="h-4 w-4"/> Filters</Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Files</CardTitle></CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">File Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Upload Date</th>
                <th className="px-4 py-2 text-left">Uploaded By</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.name} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">{r.uploaded}</td>
                  <td className="px-4 py-3">{r.by}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-8 px-2"><Eye className="h-4 w-4"/></Button>
                      <Button variant="outline" className="h-8 px-2"><Download className="h-4 w-4"/></Button>
                      <Button variant="outline" className="h-8 px-2 text-red-600"><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

