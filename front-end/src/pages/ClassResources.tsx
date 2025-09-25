import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, Trash2, Upload, Search, Filter, FileText, PlayCircle, Image as ImageIcon } from 'lucide-react'
import { useGetClassDetail } from '@/hooks/useClasses'

type UiResource = { id: number; title: string; type: 'PDF'|'Video'|'Image'|'Other'; url?: string; uploaded?: string; by?: string }

export default function ClassResourcesManagePage() {
  const { id } = useParams()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'All'|'Documents'|'Videos'|'Images'>('All')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { data, isLoading } = useGetClassDetail(id as any, { include: ['resources'], perPage: { resources: 200 } })
  const resources: UiResource[] = useMemo(() => {
    const list = (data as any)?.resources || []
    return list.map((r: any) => {
      const url: string | undefined = r.file_url || r.url
      const ext = (url || '').split('.').pop()?.toLowerCase() || ''
      const type: UiResource['type'] = ext === 'pdf' ? 'PDF' : ['mp4','mov','avi','mkv','webm'].includes(ext) ? 'Video' : ['png','jpg','jpeg','gif','webp','svg'].includes(ext) ? 'Image' : 'Other'
      return {
        id: r.id,
        title: r.title || r.name || (url ? url.split('/').pop() : 'Resource'),
        type,
        url,
        uploaded: r.uploaded_at || r.created_at,
        by: r.uploader?.name,
      } as UiResource
    })
  }, [data])

  const filtered = useMemo(()=>{
    const q = query.toLowerCase()
    const typeMap: Record<typeof tab, UiResource['type'][]> = { All:['PDF','Video','Image','Other'], Documents:['PDF'], Videos:['Video'], Images:['Image'] }
    return resources.filter(r=>{
      const matchQ = !q || r.title.toLowerCase().includes(q) || (r.by||'').toLowerCase().includes(q)
      const matchT = typeMap[tab].includes(r.type)
      return matchQ && matchT
    })
  },[resources, query, tab])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])
  // Clamp page when data size changes
  if (page > totalPages) {
    setPage(totalPages)
  }

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
        <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Uploaded</th>
                <th className="px-4 py-2 text-left">By</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-600">Loading…</td></tr>
              ) : current.map((r, idx) => (
                <tr key={r.id} className={`${((page-1)*pageSize + idx) % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    {r.type==='PDF'?<FileText className="h-4 w-4"/>:r.type==='Video'?<PlayCircle className="h-4 w-4"/>:r.type==='Image'?<ImageIcon className="h-4 w-4"/>:<FileText className="h-4 w-4"/>}
                    <span>{r.title}</span>
                  </td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">{r.uploaded || '—'}</td>
                  <td className="px-4 py-3">{r.by || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="gap-1"><Eye className="h-4 w-4"/> Preview</Button>
                      <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4"/> Download</Button>
                      <Button variant="outline" size="sm" className="gap-1 text-red-600"><Trash2 className="h-4 w-4"/> Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex items-center justify-between p-3 text-sm text-slate-600">
            <div>Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, total)} of {total} resources</div>
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1} className={`h-9 rounded-full px-3 shadow-sm border bg-white text-slate-700 ${page===1?'opacity-60 cursor-not-allowed':''}`}>Previous</button>
              {Array.from({length: Math.min(totalPages, 6)}).map((_,i)=>{
                const p=i+1; return (
                  <button key={p} onClick={()=>setPage(p)} className={`h-9 min-w-9 rounded-full px-3 text-sm shadow-sm border ${p===page?'bg-white text-slate-900 border-blue-600':'bg-white text-slate-700'}`}>{p}</button>
                )})}
              <button onClick={()=>setPage(Math.min(totalPages,page+1))} disabled={page===totalPages} className={`h-9 rounded-full px-3 shadow-sm border bg-white text-slate-700 ${page===totalPages?'opacity-60 cursor-not-allowed':''}`}>Next</button>
            </nav>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

