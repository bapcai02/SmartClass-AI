import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getClasses, getClassLeaderboard, type LeaderboardRow } from '@/api/classApi'

export default function LeaderboardPage() {
  const [classId, setClassId] = useState<number | ''>('')

  const { data: classesResp, isLoading: classesLoading } = useQuery({
    queryKey: ['classes-all-for-leaderboard'],
    queryFn: () => getClasses({ perPage: 100 }),
  })

  const { data: rows, isLoading: lbLoading, refetch } = useQuery({
    queryKey: ['leaderboard', classId],
    queryFn: async () => {
      if (!classId) return [] as LeaderboardRow[]
      return await getClassLeaderboard(classId, 50)
    },
  })

  const leaderboard = (rows || [])
  const top3 = leaderboard.slice(0,3)
  const rest = leaderboard.slice(3)

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bảng xếp hạng</h1>
        <p className="text-slate-600">Tôn vinh thành tích và người học xuất sắc</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            value={classId}
            onChange={(e)=> setClassId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Chọn lớp để xem bảng xếp hạng</option>
            {(() => {
              const arr = (classesResp && 'data' in classesResp) ? (classesResp as any).data : (classesResp && 'items' in classesResp) ? (classesResp as any).items : []
              return arr.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            })()}
          </select>
          <Button variant="outline" onClick={()=> refetch()} disabled={!classId || lbLoading}>Tải lại</Button>
        </div>
      </div>
      {!classId && (
        <Card>
          <CardContent className="p-6 text-slate-600">Hãy chọn một lớp để xem bảng xếp hạng.</CardContent>
        </Card>
      )}

      {!!classId && (
        <>
          {lbLoading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[0,1,2].map(i => (
                <Card key={i}><CardContent className="h-28 animate-pulse" /></Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {top3.map((u, idx) => (
                <Card key={u.id} className={idx===0 ? 'sm:col-span-1 border-amber-200' : ''}>
                  <CardContent className="p-5 text-center grid gap-2">
                    <div className={`mx-auto grid place-items-center rounded-full ${idx===0?'h-16 w-16':'h-14 w-14'} bg-gradient-to-br from-brand-blue to-brand-green text-white shadow`}>
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="text-lg font-semibold">{u.name}</div>
                    <div className="text-sm text-slate-600">{u.points} pts</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!!classId && (
        <Card>
          <CardHeader>
            <CardTitle>Top học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            {lbLoading ? (
              <div className="grid gap-2">
                {Array.from({length:8}).map((_,i)=>(<div key={i} className="h-10 rounded bg-slate-100 animate-pulse" />))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Hạng</th>
                      <th className="px-4 py-2 text-left">Học sinh</th>
                      <th className="px-4 py-2 text-left">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((u, idx) => (
                      <tr key={u.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                        <td className="px-4 py-3">{idx + 4}</td>
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

