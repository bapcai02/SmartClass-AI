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
  download_count?: number
  view_count?: number
  subject?: { id: number; name: string }
  clazz?: { id: number; name: string }
  category?: string
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
  const [category, setCategory] = useState<string>('')
  const [showMenu, setShowMenu] = useState<boolean>(false)

  const tagBase = "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border"
  const subjectTagClass = (name?: string) => {
    const n = (name || '').toLowerCase()
    if (n.includes('toán')) return `${tagBase} bg-blue-50 text-blue-700 border-blue-100`
    if (n.includes('vật') || n.includes('ly') || n.includes('lý')) return `${tagBase} bg-amber-50 text-amber-800 border-amber-200`
    if (n.includes('hóa')) return `${tagBase} bg-emerald-50 text-emerald-700 border-emerald-100`
    if (n.includes('sinh')) return `${tagBase} bg-green-50 text-green-700 border-green-100`
    return `${tagBase} bg-slate-100 text-slate-700 border-slate-200`
  }
  const classTagClass = (name?: string) => {
    const n = (name || '').toLowerCase()
    if (n.includes('12')) return `${tagBase} bg-sky-50 text-sky-700 border-sky-100`
    if (n.includes('11')) return `${tagBase} bg-cyan-50 text-cyan-700 border-cyan-100`
    if (n.includes('10')) return `${tagBase} bg-teal-50 text-teal-700 border-teal-100`
    return `${tagBase} bg-slate-100 text-slate-700 border-slate-200`
  }
  const categoryTagClass = (name?: string) => {
    const n = (name || '').toLowerCase()
    if (n.includes('đại học') || n.includes('dai hoc')) return `${tagBase} bg-indigo-50 text-indigo-700 border-indigo-100`
    if (n.includes('giữa') || n.includes('giua')) return `${tagBase} bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100`
    if (n.includes('cuối') || n.includes('cuoi')) return `${tagBase} bg-violet-50 text-violet-700 border-violet-100`
    return `${tagBase} bg-slate-100 text-slate-700 border-slate-200`
  }

  useEffect(() => {
    load()
    ;(async () => {
      try {
        const s = await api.get('/public/subjects').then(r => r.data as Array<{id:number; name:string}>)
        setSubjects(s)
        // classes table is public_classes; expose minimal list via question-bank controller? fallback hardcode
        setClasses([{id:1,name:'Lớp 10'},{id:2,name:'Lớp 11'},{id:3,name:'Lớp 12'}])
        // Parse filters from URL (by names) and apply once
        const sp = new URLSearchParams(window.location.search)
        const subjectName = sp.get('subject_name') || ''
        const className = sp.get('class_name') || ''
        const cat = sp.get('category') || ''
        let sid: number | '' = ''
        let cid: number | '' = ''
        if (subjectName) {
          const found = s.find(x => x.name === subjectName)
          if (found) sid = found.id
        }
        if (className) {
          const cls = [{id:1,name:'Lớp 10'},{id:2,name:'Lớp 11'},{id:3,name:'Lớp 12'}]
          const foundC = cls.find(x => x.name === className)
          if (foundC) cid = foundC.id
        }
        if (sid || cid || cat) {
          setSubjectId(sid)
          setClassId(cid)
          setCategory(cat)
          load({ subject_id: sid || undefined, class_id: cid || undefined, category: cat || undefined })
        }
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
      category: category || undefined,
    })
  }

  const toPublicUrl = (pdfUrl: string) => {
    if (!pdfUrl) return '#'
    if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl
    // storage-relative path from backend
    return `/storage/${pdfUrl.replace(/^\/?storage\//i, '')}`
  }

  const downloadViaApi = async (item: Item) => {
    try { await api.get(`/public/exam-pdfs/${item.id}/download`) } catch {}
    // open public URL directly to avoid any auth redirect
    const url = toPublicUrl(item.pdf_url)
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-sky-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 relative" onMouseLeave={()=> setShowMenu(false)}>
            <a href="/public/pdfs" className="flex items-center gap-2 text-slate-800 font-semibold">
              <div className="h-8 w-8 rounded-md bg-indigo-600 grid place-items-center text-white"><FileText className="h-5 w-5"/></div>
              Thư viện đề thi
            </a>
            <button onClick={()=> setShowMenu(v=>!v)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Danh mục</button>
            {showMenu && (
            <div className="absolute left-0 top-full mt-2 w-[560px] z-50">
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <div>
                  <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Môn học</div>
                  <div className="grid gap-1 text-sm">
                    <a href="/public/pdfs?subject_name=Toán" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Toán</a>
                    <a href="/public/pdfs?subject_name=Vật lý" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Vật lý</a>
                    <a href="/public/pdfs?subject_name=Hóa học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Hóa học</a>
                    <a href="/public/pdfs?subject_name=Sinh học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Sinh học</a>
                  </div>
                </div>
                <div>
                  <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Khối lớp</div>
                  <div className="grid gap-1 text-sm">
                    <a href="/public/pdfs?class_name=Lớp 10" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 10</a>
                    <a href="/public/pdfs?class_name=Lớp 11" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 11</a>
                    <a href="/public/pdfs?class_name=Lớp 12" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 12</a>
                  </div>
                </div>
                <div>
                  <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Loại thi</div>
                  <div className="grid gap-1 text-sm">
                    <a href="/public/pdfs?category=Thi đại học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi đại học</a>
                    <a href="/public/pdfs?category=Thi giữa kỳ" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi giữa kỳ</a>
                    <a href="/public/pdfs?category=Thi cuối kỳ" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi cuối kỳ</a>
                  </div>
                </div>
                <div className="col-span-3 border-t pt-2 mt-1">
                  <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Lối tắt (Môn · Lớp · Loại)</div>
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <a href="/public/pdfs?subject_name=Toán&class_name=Lớp 12&category=Thi đại học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Toán · Lớp 12 · Thi đại học</a>
                    <a href="/public/pdfs?subject_name=Vật lý&class_name=Lớp 12&category=Thi đại học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Vật lý · Lớp 12 · Thi đại học</a>
                    <a href="/public/pdfs?subject_name=Hóa học&class_name=Lớp 12&category=Thi đại học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Hóa học · Lớp 12 · Thi đại học</a>
                  </div>
                  <div className="mt-2 px-2 text-xs text-slate-600">
                    <a href="/public/question-bank" className="rounded px-2 py-1 hover:bg-slate-50 text-slate-700 border border-slate-200">Tới Ngân hàng đề thi</a>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
            <a href="/public/question-bank" className="hover:text-slate-900">Làm đề trực tuyến</a>
            <a href="#" className="hover:text-slate-900" onClick={(e)=>{e.preventDefault(); window.scrollTo({ top: 9999, behavior:'smooth' })}}>Liên hệ</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=> { try { window.history.back() } catch { window.location.href = '/public/question-bank' } }} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Quay lại</button>
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
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tiêu đề..." className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <select value={subjectId} onChange={e=>setSubjectId(e.target.value?Number(e.target.value):'')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Tất cả môn</option>
            {subjects.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={classId} onChange={e=>setClassId(e.target.value?Number(e.target.value):'')} className="w-full sm:flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Tất cả khối</option>
              {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full sm:flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Tất cả category</option>
              <option value="Thi đại học">Thi đại học</option>
              <option value="Thi giữa kỳ">Thi giữa kỳ</option>
              <option value="Thi cuối kỳ">Thi cuối kỳ</option>
            </select>
            <button onClick={handleSearch} className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white text-slate-900 px-4 py-2 text-sm hover:bg-slate-50">Áp dụng lọc</button>
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
            <div key={it.id} className="text-left rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition">
                <div className="font-medium mb-1 line-clamp-2">{it.title}</div>
                <div className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">
                  <span className={subjectTagClass(it.subject?.name)}>{it.subject?.name || 'Môn?'}</span>
                  <span className={classTagClass(it.clazz?.name)}>{it.clazz?.name || 'Khối?'}</span>
                  {it.category ? (<span className={categoryTagClass(it.category)}>{it.category}</span>) : null}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {(it.num_pages ? `${it.num_pages} trang` : '')} {(it.file_size_bytes ? `· ${(it.file_size_bytes/1024/1024).toFixed(2)} MB` : '')}
                </div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=> { setActive(it) }} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Xem nhanh</button>
                <button onClick={()=> downloadViaApi(it)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Tải về</button>
                <span className="ml-auto text-xs text-slate-600">
                  {typeof it.view_count === 'number' ? `${it.view_count} lượt xem` : ''}
                  {typeof it.view_count === 'number' && typeof it.download_count === 'number' ? ' · ' : ''}
                  {typeof it.download_count === 'number' ? `${it.download_count} lượt tải` : ''}
                </span>
              </div>
            </div>
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
