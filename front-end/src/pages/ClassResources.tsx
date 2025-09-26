import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, Trash2, Upload, Search, Filter, FileText, PlayCircle, Image as ImageIcon, ArrowLeftCircle } from 'lucide-react'
import { useGetClassDetail } from '@/hooks/useClasses'
import { useToast } from '@/components/ui/toast'
import api from '@/utils/api'
import { Modal, ModalContent, ModalHeader, ModalTrigger } from '@/components/ui/modal'
import { useQueryClient } from '@tanstack/react-query'
import * as XLSX from 'xlsx'
import { renderAsync as renderDocx } from 'docx-preview'

type UiResource = { id: number; title: string; type: 'PDF'|'Video'|'Image'|'Other'; url?: string; uploaded?: string; by?: string }

export default function ClassResourcesManagePage() {
  const { id } = useParams()
  useEffect(()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'All'|'Documents'|'Videos'|'Images'>('All')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [openUpload, setOpenUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const qc = useQueryClient()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<UiResource | null>(null)
  const [openPreview, setOpenPreview] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [previewSheet, setPreviewSheet] = useState<Array<Array<string | number>> | null>(null)
  const docxContainerRef = useRef<HTMLDivElement | null>(null)
  const [openDelete, setOpenDelete] = useState(false)
  const [deletingItem, setDeletingItem] = useState<UiResource | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data, isLoading } = useGetClassDetail(id as any, { include: ['resources'], perPage: { resources: 200 } })
  const { addToast } = useToast()
  const resources: UiResource[] = useMemo(() => {
    const list = (data as any)?.resources || []
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8081/api'
    const apiOrigin = apiBase.replace(/\/api\/?$/, '')
    return list.map((r: any) => {
      const rawUrl: string | undefined = r.file_url || r.url
      const url: string | undefined = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${apiOrigin}${rawUrl}`) : undefined
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
          <h1 className="text-2xl font-semibold tracking-tight">Class Resources</h1>
          <p className="text-slate-600">Manage course documents, videos, and images</p>
        </div>
        <Modal open={openUpload} onOpenChange={(v)=>{ setOpenUpload(v); if (!v) { if (previewUrl) { URL.revokeObjectURL(previewUrl) } setPreviewUrl(null); setSelectedFile(null); setTitle(''); if (fileInputRef.current) fileInputRef.current.value=''} }}>
          <ModalTrigger asChild>
            <Button variant="outline" className="gap-2" onClick={()=>setOpenUpload(true)}><Upload className="h-4 w-4"/> Upload</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader title="Upload Resource" description="Choose a file and optional title to upload to this class" />
            <div className="grid gap-3">
              <div
                className="grid place-items-center rounded-2xl border border-dashed border-slate-300 py-10 text-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e)=>{
                  e.preventDefault(); e.stopPropagation();
                  const file = e.dataTransfer.files?.[0]
                  if (!file) return
                  setSelectedFile(file)
                  setTitle(file.name)
                  if (previewUrl) URL.revokeObjectURL(previewUrl)
                  setPreviewUrl(URL.createObjectURL(file))
                }}
              >
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag and drop files here, or click to select'}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e)=>{
                const file = e.target.files?.[0]
                if (!file) return
                setSelectedFile(file)
                setTitle(file.name)
                if (previewUrl) URL.revokeObjectURL(previewUrl)
                setPreviewUrl(URL.createObjectURL(file))
              }} />
              {selectedFile && (
                <div className="rounded-xl border border-slate-200 p-3 flex items-center justify-center">
                  <div className="text-sm font-medium mb-2">Preview</div>
                  {(() => {
                    const name = selectedFile.name.toLowerCase()
                    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp') || name.endsWith('.svg')) {
                      return <img src={previewUrl || ''} alt="preview" className="max-h-48 rounded-lg border" />
                    }
                    if (name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.webm')) {
                      return <video src={previewUrl || ''} controls className="max-h-48 rounded-lg border" />
                    }
                    if (name.endsWith('.pdf')) {
                      return <div className="flex items-center gap-2 text-slate-700"><FileText className="h-5 w-5"/> <span>{selectedFile.name}</span></div>
                    }
                    return <div className="text-slate-600">{selectedFile.name}</div>
                  })()}
                </div>
              )}
              <input
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600"
              />
              {uploading && (
                <div className="w-full">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>Uploading…</span>
                    <span>{uploadProgress != null ? `${uploadProgress}%` : ''}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-2 bg-blue-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, uploadProgress ?? 0))}%` }} />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setOpenUpload(false)}>Cancel</Button>
                <Button
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!selectedFile || uploading}
                  onClick={async ()=>{
                    if (!selectedFile) return
                    const form = new FormData()
                    form.append('file', selectedFile)
                    if (title) form.append('title', title)
                    try {
                      setUploading(true)
                      setUploadProgress(0)
                      await api.post(`/classes/${id}/resources`, form, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (e) => {
                          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
                        },
                      })
                      await qc.invalidateQueries({ queryKey: ['class-detail', id] })
                      setOpenUpload(false)
                      addToast({ title: 'Uploaded', description: title || selectedFile.name, variant: 'success' })
                    } catch (err) {
                      console.error(err)
                      addToast({ title: 'Upload failed', description: 'Please try again', variant: 'error' })
                    } finally {
                      setUploading(false)
                      setUploadProgress(null)
                      setSelectedFile(null)
                      setTitle('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }
                  }}
                >
                  {uploading ? (uploadProgress != null ? `Uploading… ${uploadProgress}%` : 'Uploading…') : 'Upload'}
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      </div>

      {/* Drag & drop */}
      {/* Removed external drop zone per request; upload via modal only */}

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
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => { setPreviewItem(r); setOpenPreview(true) }}><Eye className="h-4 w-4"/> Preview</Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={async () => {
                          if (!r.id) return
                          const api = ((import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8081/api')
                          const url = `${api}/classes/${id}/resources/${r.id}/download`
                          try {
                            const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` } })
                            if (!res.ok) throw new Error('Download failed')
                            const blob = await res.blob()
                            const href = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = href
                            const dispo = res.headers.get('content-disposition') || ''
                            const match = dispo.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
                            const name = (match?.[1] || match?.[2] || r.title || 'resource')
                            a.download = name
                            document.body.appendChild(a)
                            a.click()
                            a.remove()
                            URL.revokeObjectURL(href)
                          } catch (e) {
                            console.error(e)
                            addToast({ title: 'Download failed', variant: 'error' })
                          }
                        }}
                      >
                        <Download className="h-4 w-4"/> Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-600"
                        onClick={()=>{ setDeletingItem(r); setOpenDelete(true) }}
                      >
                        <Trash2 className="h-4 w-4"/> Delete
                      </Button>
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

      {/* Preview Modal */}
      <Modal open={openPreview} onOpenChange={(v)=>{ setOpenPreview(v); if (!v) { setPreviewItem(null); setPreviewText(null); setPreviewSheet(null); setPreviewLoading(false) } }}>
        <ModalContent className="max-w-5xl w-[90vw]">
          <ModalHeader title={previewItem?.title || 'Preview'} description={previewItem?.type || ''} />
          <div className="grid gap-3">
            {previewItem && previewItem.url ? (
              (() => {
                const url = previewItem.url
                const ext = (url.split('.').pop() || '').toLowerCase()

                // Image
                if (['png','jpg','jpeg','gif','webp','svg'].includes(ext)) {
                  return <div className="w-full flex items-center justify-center"><img src={url} alt="preview" className="max-h-[80vh] w-auto rounded-lg border" /></div>
                }
                // Video
                if (['mp4','mov','webm'].includes(ext)) {
                  return <div className="w-full flex items-center justify-center"><video src={url} controls className="max-h-[80vh] w-auto rounded-lg border" /></div>
                }
                // PDF
                if (ext === 'pdf') {
                  return <div className="w-full flex items-center justify-center"><iframe src={url} className="h-[80vh] w-full max-w-5xl rounded-lg border" /></div>
                }
                // Office Docs
                if (ext === 'docx' || ext === 'doc') {
                  // Try docx-preview; fallback to Office viewer if fails
                  if (!previewLoading && !previewText) {
                    setPreviewLoading(true)
                    fetch(url).then(r=>r.arrayBuffer()).then(async (buf)=>{
                      try {
                        if (docxContainerRef.current) {
                          docxContainerRef.current.innerHTML = ''
                          await renderDocx(buf, docxContainerRef.current)
                        }
                        setPreviewText('rendered-docx')
                      } catch {
                        setPreviewText(null)
                      } finally {
                        setPreviewLoading(false)
                      }
                    }).catch(()=> setPreviewLoading(false))
                  }
                  if (previewLoading) return <div className="text-sm text-slate-600">Loading…</div>
                  if (previewText === 'rendered-docx') return <div className="w-full flex items-center justify-center"><div ref={docxContainerRef} className="docx-preview prose max-w-none h-[80vh] overflow-auto rounded-lg border bg-white p-4" /></div>
                  const viewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
                  return <div className="w-full flex items-center justify-center"><iframe src={viewer} className="h-[80vh] w-full max-w-5xl rounded-lg border" /></div>
                }
                if (['ppt','pptx'].includes(ext)) {
                  const viewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
                  return <div className="w-full flex items-center justify-center"><iframe src={viewer} className="h-[80vh] w-full max-w-5xl rounded-lg border" /></div>
                }
                // Text-like: txt, sql, json, md, csv
                if (['txt','sql','json','md','log','csv'].includes(ext)) {
                  if (!previewText && !previewLoading) {
                    setPreviewLoading(true)
                    fetch(url).then(r=>r.text()).then(t=>{ setPreviewText(t); setPreviewLoading(false) }).catch(()=> setPreviewLoading(false))
                  }
                  if (previewLoading) return <div className="text-sm text-slate-600">Loading…</div>
                  if (previewText == null) return <div className="text-sm text-slate-600">Unable to load preview</div>
                  // Render CSV as simple table (first 200 rows), others as code block
                  if (ext === 'csv') {
                    const rows = previewText.split(/\r?\n/).slice(0, 200).map(line => line.split(','))
                    return (
                      <div className="w-full flex items-center justify-center">
                        <div className="max-h-[70vh] w-full max-w-5xl overflow-auto rounded-lg border">
                          <table className="min-w-full text-sm">
                            <tbody>
                              {rows.map((r, i) => (
                                <tr key={i} className={i%2? 'bg-slate-50/50':''}>
                                  {r.map((c, j) => <td key={j} className="px-3 py-1 whitespace-pre-wrap">{c}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  }
                  return <div className="w-full flex items-center justify-center"><pre className="max-h-[80vh] w-full max-w-5xl overflow-auto rounded-lg border bg-slate-50 p-3 text-sm"><code>{previewText}</code></pre></div>
                }
                // Excel xls/xlsx: render first sheet preview (and offer Office viewer link)
                if (['xls','xlsx'].includes(ext)) {
                  if (!previewSheet && !previewLoading) {
                    setPreviewLoading(true)
                    fetch(url).then(r=>r.arrayBuffer()).then(buf => {
                      const wb = XLSX.read(buf, { type: 'array' })
                      const wsName = wb.SheetNames[0]
                      const ws = wb.Sheets[wsName]
                      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[]
                      setPreviewSheet((aoa.slice(0, 200) as Array<Array<string|number>>))
                      setPreviewLoading(false)
                    }).catch(()=> setPreviewLoading(false))
                  }
                  if (previewLoading) return <div className="text-sm text-slate-600">Loading…</div>
                  if (!previewSheet) return <div className="text-sm text-slate-600">Unable to load preview</div>
                  const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
                  return (
                    <div className="grid gap-3">
                      <div className="text-sm text-slate-600">Inline preview (first sheet, first 200 rows). <a className="text-blue-600 underline" href={officeViewer} target="_blank" rel="noreferrer">Open in Office viewer</a></div>
                      <div className="w-full flex items-center justify-center">
                        <div className="max-h-[80vh] w-full max-w-5xl overflow-auto rounded-lg border">
                          <table className="min-w-full text-sm">
                            <tbody>
                              {previewSheet.map((r, i) => (
                                <tr key={i} className={i%2? 'bg-slate-50/50':''}>
                                  {r.map((c, j) => <td key={j} className="px-3 py-1 whitespace-pre-wrap">{String(c)}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )
                }
                // Fallback
                return (
                  <div className="w-full flex items-center justify-center text-sm text-slate-700">
                    <span>No inline preview for this file type. </span>&nbsp;<a className="text-blue-600 underline" href={url} target="_blank" rel="noreferrer">Open</a>
                  </div>
                )
              })()
            ) : (
              <div className="w-full flex items-center justify-center text-sm text-slate-600">No preview available</div>
            )}
          </div>
        </ModalContent>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={openDelete} onOpenChange={(v)=>{ setOpenDelete(v); if (!v) { setDeleting(false); setDeletingItem(null) } }}>
        <ModalContent>
          <ModalHeader title="Delete Resource" description={deletingItem?.title ? `Are you sure you want to delete "${deletingItem.title}"?` : 'Are you sure you want to delete this resource?'} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setOpenDelete(false)}>Cancel</Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
              onClick={async ()=>{
                if (!deletingItem?.id) return
                try {
                  setDeleting(true)
                  const api = ((import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8081/api')
                  const res = await fetch(`${api}/classes/${id}/resources/${deletingItem.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` },
                  })
                  if (!res.ok) throw new Error('Delete failed')
                  await qc.invalidateQueries({ queryKey: ['class-detail', id] })
                  setOpenDelete(false)
                } catch (e) {
                  console.error(e)
                  addToast({ title: 'Delete failed', variant: 'error' })
                } finally {
                  setDeleting(false)
                  setDeletingItem(null)
                }
              }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  )
}

