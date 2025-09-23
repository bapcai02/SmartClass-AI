import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { materials, assignments as assignmentList, leaderboard } from '@/data/dummy'

export default function ClassPage() {
  return (
    <div className="grid gap-4">
      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <div className="grid gap-4 md:grid-cols-2">
            {materials.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle>{m.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {m.type === 'pdf' ? (
                    <div className="overflow-hidden rounded-xl border aspect-[4/3] grid place-items-center text-sm text-slate-600">
                      PDF preview disabled • <a className="text-brand-blue" href={m.url} target="_blank">Open</a>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl aspect-video grid place-items-center text-sm text-slate-600">
                      Video preview disabled • <a className="text-brand-blue" href={m.url} target="_blank">Open</a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="grid gap-3">
          {assignmentList.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-slate-600">Status: {a.status}</div>
                </div>
                <button className="rounded-xl border border-slate-300 px-3 py-1.5">Open</button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="qa" className="grid gap-3">
          {[1,2,3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="font-medium">Question {i}</div>
                <div className="text-sm text-slate-600">How do I solve problem {i}?</div>
                <div className="mt-2 grid gap-2">
                  <div className="rounded-lg bg-slate-50 p-2 text-sm">Reply A</div>
                  <div className="rounded-lg bg-slate-50 p-2 text-sm">Reply B</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="chat" className="grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 h-64 overflow-y-auto">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className={`mb-2 flex ${i % 2 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${i % 2 ? 'bg-slate-100' : 'bg-brand-blue text-white'}`}>
                  Message {i}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 rounded-2xl border border-slate-300 px-3 py-2" placeholder="Type a message" />
            <button className="rounded-2xl bg-brand-blue px-4 py-2 text-white">Send</button>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="overflow-hidden rounded-2xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Points</th>
                  <th className="px-3 py-2 text-left">Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.points}</td>
                    <td className="px-3 py-2">{u.badges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

