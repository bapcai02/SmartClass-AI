import { useEffect, useState } from 'react'
import api from '@/utils/api'
import { Search, FileText } from 'lucide-react'
// Use Vite-specific entry that wires the worker automatically

type Item = {
  id: number
  title: string
  pdf_url: string
  file_size_bytes?: number
  num_pages?: number
  subject?: { id: number; name: string }
  clazz?: { id: number; name: string }
}

export default function PublicExamPdfsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classId, setClassId] = useState<number | ''>('')
  const [subjects, setSubjects] = useState<Array<{id:number; name:string}>>([])
  const [classes, setClasses] = useState<Array<{id:number; name:string}>>([])
  const [active, setActive] = useState<Item | null>(null)

  useEffect(() => {
    load()
    ;(async () => {
      try {
        const s = await api.get('/public/subjects').then(r => r.data as Array<{id:number; name:string}>)
        setSubjects(s)
        // classes table is public_classes; expose minimal list via question-bank controller? fallback hardcode
        setClasses([{id:1,name:'Lớp 10'},{id:2,name:'Lớp 11'},{id:3,name:'Lớp 12'}])
      } catch {}
    })()
  }, [])

  const load = async (params: Record<string, any> = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/public/exam-pdfs', { params })
      setItems((data?.data as Item[]) || [])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    load({
      search: search || undefined,
      subject_id: subjectId || undefined,
      class_id: classId || undefined,
    })
  }

  const toPublicUrl = (pdfUrl: string) => {
    if (!pdfUrl) return '#'
    if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl
    // storage-relative path from backend
    return `/storage/${pdfUrl.replace(/^\/?storage\//i, '')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-sky-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <a href="/public/pdfs" className="flex items-center gap-2 text-slate-800 font-semibold">
            <div className="h-8 w-8 rounded-md bg-indigo-600 grid place-items-center text-white"><FileText className="h-5 w-5"/></div>
            Thư viện đề thi
          </a>
          <div className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
            <a href="/public/question-bank" className="hover:text-slate-900">Làm đề trực tuyến</a>
            <a href="#" className="hover:text-slate-900" onClick={(e)=>{e.preventDefault(); window.scrollTo({ top: 9999, behavior:'smooth' })}}>Liên hệ</a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-4 py-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">Thư viện đề thi</h1>
          <p className="mt-2 text-indigo-100">Tổng hợp đề thi theo môn và khối lớp, xem nhanh hoặc tải về.</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Đề thi mới</h2>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tiêu đề..." className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <select value={subjectId} onChange={e=>setSubjectId(e.target.value?Number(e.target.value):'')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Tất cả môn</option>
            {subjects.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={classId} onChange={e=>setClassId(e.target.value?Number(e.target.value):'')} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Tất cả khối</option>
              {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={handleSearch} className="rounded-lg border border-slate-300 bg-white text-slate-900 px-4 py-2 text-sm hover:bg-slate-50">Áp dụng lọc</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length:6}).map((_,i)=> (
              <div key={i} className="h-28 rounded-lg border border-slate-200 bg-white animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">Không có dữ liệu.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(it => (
              <button key={it.id} onClick={()=> setActive(it)} className="text-left block rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition">
                <div className="font-medium mb-1 line-clamp-2">{it.title}</div>
                <div className="text-sm text-slate-600">
                  {(it.subject?.name || 'Môn?')} · {(it.clazz?.name || 'Khối?')}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {(it.num_pages ? `${it.num_pages} trang` : '')} {(it.file_size_bytes ? `· ${(it.file_size_bytes/1024/1024).toFixed(2)} MB` : '')}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* PDF Modal (public, no login) */}
      {active && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=> setActive(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-medium text-slate-900 truncate pr-3">{active.title}</div>
              <div className="flex items-center gap-2">
                <button onClick={()=> setActive(null)} className="rounded-md border px-3 py-1.5 hover:bg-slate-50">Đóng</button>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 overflow-auto">
              <iframe
                title="PDF Preview"
                src={`${toPublicUrl(active.pdf_url)}#view=FitH&toolbar=1`}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
