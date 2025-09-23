import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Paperclip, Sparkles, ThumbsUp, CheckCircle2 } from 'lucide-react'

export default function QAPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Q&A</h1>
        <p className="text-slate-600">Ask questions and get help from AI, teachers, and peers</p>
      </div>
      <Card>
        <CardContent className="p-4 grid gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="shrink-0"><Paperclip className="h-4 w-4"/></Button>
            <input className="flex-1 rounded-2xl border px-3 py-2" placeholder="Ask a question or paste a problem..." />
            <Button className="gap-2"><Sparkles className="h-4 w-4"/> Ask AI</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {[1,2,3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>How to solve equation #{i}?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="text-sm text-slate-700">I'm stuck on quadratic equations. Any tips?</div>
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="font-medium">AI Answer</div>
                Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a ...
              </div>
              <div className="grid gap-2">
                <div className="rounded-xl border p-3 text-sm">Teacher: Try factoring when possible.</div>
                <div className="rounded-xl border p-3 text-sm">Student: Completing the square works too!</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-1"><ThumbsUp className="h-4 w-4"/> Upvote</Button>
                <Button variant="outline" className="gap-1"><CheckCircle2 className="h-4 w-4"/> Mark as solved</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

