import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  BookOpen,
  File,
  Image,
  Video,
  FileType,
  Archive,
  Upload,
  Trash2
} from 'lucide-react'
import api from '@/utils/api'
import { useRef } from 'react'
import { 
  getAllResources, 
  getResourceStats,
  type ResourceFilters,
  getFileTypeFromUrl,
  getFileIcon
} from '@/api/resources'
import { getClasses } from '@/api/classApi'
import { searchSubjects } from '@/api/lookup'
import { useQuery } from '@tanstack/react-query'

export default function AllResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ResourceFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const [openUpload, setOpenUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadClassId, setUploadClassId] = useState<number | ''>('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewRes, setPreviewRes] = useState<any | null>(null)
  const [previewType, setPreviewType] = useState<string>('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['resource-stats'],
    queryFn: getResourceStats,
  })

  const { data: classesResp } = useQuery({
    queryKey: ['classes'],
    queryFn: () => getClasses(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => searchSubjects(''),
  })

  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['all-resources', page, filters, searchTerm],
    queryFn: () => getAllResources({
      page,
      perPage: 15,
      ...filters,
      search: searchTerm || undefined,
    }),
  })

  const handleSearch = () => {
    setPage(1)
  }

  const handleFilterChange = (key: keyof ResourceFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'bg-red-100 text-red-700'
      case 'doc':
        return 'bg-blue-100 text-blue-700'
      case 'image':
        return 'bg-green-100 text-green-700'
      case 'video':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Tất cả tài nguyên</h1>
          <p className="text-slate-600">Duyệt và quản lý tài nguyên từ tất cả lớp</p>
          <div className="mt-3">
            <Button onClick={()=> setOpenUpload(true)} className="gap-2 bg-brand-blue text-white hover:bg-brand-blue/90"><Upload className="h-4 w-4"/> Tải lên</Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <File className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                  <div className="text-sm text-slate-600">Tổng số tệp</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.pdf}</div>
                  <div className="text-sm text-slate-600">Tệp PDF</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <FileType className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.doc}</div>
                  <div className="text-sm text-slate-600">Tài liệu</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <Image className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.image}</div>
                  <div className="text-sm text-slate-600">Hình ảnh</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.video}</div>
                  <div className="text-sm text-slate-600">Video</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Archive className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.other}</div>
                  <div className="text-sm text-slate-600">Khác</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tài nguyên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full rounded-lg border border-slate-300 bg-white px-10 py-2 text-slate-900 placeholder-slate-500 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Tìm kiếm
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="text-black hover:bg-black hover:text-white"
            >
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Lớp</label>
                  <select
                    value={filters.class_id || ''}
                    onChange={(e) => handleFilterChange('class_id', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="">Tất cả lớp</option>
                    {(
                      (classesResp as any)?.data || (classesResp as any)?.items || []
                    ).map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Môn học</label>
                  <select
                    value={filters.subject_id || ''}
                    onChange={(e) => handleFilterChange('subject_id', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="">Tất cả môn</option>
                    {subjects?.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Loại tệp</label>
                  <select
                    value={filters.file_type || ''}
                    onChange={(e) => handleFilterChange('file_type', e.target.value || undefined)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="">Tất cả</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Tài liệu</option>
                    <option value="image">Hình ảnh</option>
                    <option value="video">Video</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Từ ngày</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-black hover:bg-black hover:text-white"
                >
                  Xóa lọc
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Resources List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Tài nguyên</h2>
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="text-black hover:bg-black hover:text-white"
            >
              {showAll ? 'Thu gọn' : 'Xem tất cả'}
            </Button>
          </div>
          {resourcesLoading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {(showAll ? resourcesData?.data : resourcesData?.data?.slice(0, 10))?.map((resource) => {
                const fileType = getFileTypeFromUrl(resource.file_url)
                const fileIcon = getFileIcon(fileType)
                return (
                  <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-2xl">{fileIcon}</span>
                          <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getFileTypeColor(fileType)}`}>
                            {fileType.toUpperCase()}
                          </span>
                        </div>
                        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{resource.class_room.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{resource.class_room.subject.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{resource.uploader.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(resource.uploaded_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const t = getFileTypeFromUrl(resource.file_url)
                              setPreviewType(t)
                              setPreviewRes(resource)
                              setPreviewOpen(true)
                            }}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Xem
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = resource.file_url
                              link.download = resource.title
                              link.click()
                            }}
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                          >
                            <Download className="mr-1 h-4 w-4" />
                            Tải về
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!confirm('Xóa tài nguyên này?')) return
                              try {
                                await api.delete(`/resources/${resource.id}`)
                                window.location.reload()
                              } catch (e) {
                                alert('Xóa thất bại')
                              }
                            }}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {resourcesData?.last_page && resourcesData.last_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg"
            >
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, resourcesData.last_page) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`rounded-lg ${page === pageNum ? 'bg-brand-blue text-white' : ''}`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(resourcesData.last_page, p + 1))}
              disabled={page === resourcesData.last_page}
              className="rounded-lg"
            >
              Sau
            </Button>
          </div>
        )}

        {/* Empty State */}
        {resourcesData?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <File className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Không có tài nguyên</h3>
            <p className="text-slate-600">
              {searchTerm || Object.keys(filters).length > 0 
                ? "Hãy thử điều chỉnh từ khóa hoặc bộ lọc." 
                : "Chưa có tài nguyên nào được tải lên."
              }
            </p>
          </div>
        )}
      </div>

      {openUpload && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=> setOpenUpload(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="border-b p-4 text-slate-900 font-semibold">Tải tài nguyên</div>
            <div className="p-4 grid gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Lớp</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                  value={uploadClassId}
                  onChange={(e)=> setUploadClassId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Chọn lớp</option>
                  {(((classesResp as any)?.data)||(classesResp as any)?.items||[]).map((c: any)=> (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tiêu đề</label>
                <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" value={uploadTitle} onChange={(e)=> setUploadTitle(e.target.value)} placeholder="VD: Bài giảng Chương 1" />
              </div>
              <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 p-8 text-slate-600 cursor-pointer hover:bg-slate-50" onClick={()=> fileInputRef.current?.click()}>
                {selectedFile ? `Đã chọn: ${selectedFile?.name}` : 'Kéo thả tệp vào đây, hoặc bấm để chọn'}
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e)=> setSelectedFile(e.target.files?.[0]||null)} />
              </div>
              {uploading && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>Đang tải lên…</span>
                    <span>{uploadProgress ?? 0}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-2 bg-blue-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, uploadProgress ?? 0))}%` }} />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={()=> setOpenUpload(false)}>Hủy</Button>
                <Button
                  onClick={async ()=>{
                    if (!selectedFile || !uploadClassId) { alert('Chọn lớp và tệp'); return }
                    try {
                      setUploading(true)
                      setUploadProgress(0)
                      const form = new FormData()
                      form.append('file', selectedFile)
                      if (uploadTitle) form.append('title', uploadTitle)
                      await api.post(`/classes/${uploadClassId}/resources`, form, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (e) => { if (e.total) setUploadProgress(Math.round((e.loaded/e.total)*100)) },
                      })
                      setOpenUpload(false)
                      window.location.reload()
                    } catch (e) {
                      alert('Tải lên thất bại')
                    } finally {
                      setUploading(false)
                      setUploadProgress(null)
                      setSelectedFile(null)
                      setUploadTitle('')
                      setUploadClassId('')
                    }
                  }}
                  className="bg-brand-blue text-white hover:bg-brand-blue/90"
                  disabled={uploading}
                >{uploading ? 'Đang tải lên…' : 'Tải lên'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewOpen && previewRes && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={()=> setPreviewOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] max-w-5xl max-h-[90vh] rounded-xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b p-3">
              <div className="font-semibold text-slate-900 truncate pr-3">{previewRes.title}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={()=> {
                    navigator.clipboard.writeText(previewRes.file_url)
                  }}
                >Sao chép liên kết</Button>
                <Button variant="outline" onClick={()=> window.open(previewRes.file_url, '_blank')}>Mở tab mới</Button>
                <Button onClick={()=> setPreviewOpen(false)}>Đóng</Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50">
              {previewType === 'pdf' && (
                <iframe title="pdf" src={previewRes.file_url} className="h-full w-full min-h-[70vh]" />
              )}
              {previewType === 'image' && (
                <div className="p-4 grid place-items-center">
                  <img src={previewRes.file_url} alt={previewRes.title} className="max-h-[75vh] w-auto rounded-lg shadow" />
                </div>
              )}
              {previewType === 'video' && (
                <div className="p-4 grid place-items-center">
                  <video src={previewRes.file_url} controls className="max-h-[75vh] w-auto rounded-lg shadow" />
                </div>
              )}
              {previewType === 'doc' && (
                <iframe
                  title="doc"
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewRes.file_url)}`}
                  className="h-full w-full min-h-[70vh]"
                />
              )}
              {previewType !== 'pdf' && previewType !== 'image' && previewType !== 'video' && previewType !== 'doc' && (
                <div className="p-6 text-center text-slate-600">
                  Không có xem trước cho loại tệp này. Bấm "Mở tab mới" để xem trực tiếp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
