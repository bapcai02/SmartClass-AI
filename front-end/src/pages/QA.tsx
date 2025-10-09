import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Paperclip, Sparkles, ThumbsUp, CheckCircle2 } from 'lucide-react'

export default function QAPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hỏi & Đáp</h1>
        <p className="text-slate-600">Đặt câu hỏi và nhận trợ giúp từ AI, giáo viên và bạn bè</p>
      </div>
      <Card>
        <CardContent className="p-4 grid gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="shrink-0"><Paperclip className="h-4 w-4"/></Button>
            <input className="flex-1 rounded-2xl border px-3 py-2" placeholder="Nhập câu hỏi hoặc dán bài toán..." />
            <Button className="gap-2"><Sparkles className="h-4 w-4"/> Hỏi AI</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {[1,2,3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Làm sao giải phương trình #{i}?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="text-sm text-slate-700">Mình đang mắc ở phương trình bậc hai. Có mẹo nào không?</div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="font-medium">Trả lời bởi AI</div>
                Sử dụng công thức nghiệm: x = (-b ± √(b²-4ac)) / 2a ...
              </div>
              <div className="grid gap-2">
                <div className="rounded-xl border p-3 text-sm">Giáo viên: Thử phân tích nhân tử nếu có thể.</div>
                <div className="rounded-xl border p-3 text-sm">Học sinh: Hoàn thành bình phương cũng hiệu quả!</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-1"><ThumbsUp className="h-4 w-4"/> Thích</Button>
                <Button variant="outline" className="gap-1"><CheckCircle2 className="h-4 w-4"/> Đánh dấu đã giải</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

