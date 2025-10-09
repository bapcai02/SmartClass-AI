import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function ResourcesPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tài nguyên</h1>
          <p className="text-slate-600">PDF, video và tài liệu học tập</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input className="w-64 rounded-2xl border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm shadow-sm focus:border-brand-blue" placeholder="Tìm kiếm tài nguyên" />
          </div>
          <select className="rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue">
            <option>Tất cả</option>
            <option>PDF</option>
            <option>Video</option>
            <option>Slides</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tài nguyên {i}</span>
                <span className="text-xs text-slate-600">bởi Ms. Johnson • Thg 9 {10+i}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="aspect-video rounded-xl bg-slate-100" />
              <div className="flex justify-between">
                <Button variant="outline">Xem trước</Button>
                <Button variant="ghost">Mở</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

