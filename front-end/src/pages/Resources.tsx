import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function ResourcesPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
          <p className="text-slate-600">PDFs, videos, and learning materials</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input className="w-64 rounded-2xl border bg-white pl-10 pr-3 py-2 text-sm shadow-sm" placeholder="Search resources" />
          </div>
          <select className="rounded-2xl border px-3 py-2 text-sm">
            <option>All</option>
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
                <span>Resource {i}</span>
                <span className="text-xs text-slate-600">by Ms. Johnson • Sep {10+i}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="aspect-video rounded-xl bg-slate-100" />
              <div className="flex justify-between">
                <Button variant="outline">Preview</Button>
                <Button variant="ghost">Open</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

