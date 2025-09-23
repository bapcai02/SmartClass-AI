import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { leaderboard } from '@/data/dummy'

export default function LeaderboardPage() {
  const top3 = leaderboard.slice(0,3)
  const rest = leaderboard.slice(3)
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-slate-600">Celebrate top performers and achievements</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {top3.map((u, idx) => (
          <Card key={u.id} className={idx===0 ? 'sm:col-span-1 border-amber-200' : ''}>
            <CardContent className="p-5 text-center grid gap-2">
              <div className={`mx-auto grid place-items-center rounded-full ${idx===0?'h-16 w-16':'h-14 w-14'} bg-gradient-to-br from-brand-blue to-brand-green text-white shadow`}>
                <Trophy className="h-6 w-6" />
              </div>
              <div className="text-lg font-semibold">{u.name}</div>
              <div className="text-sm text-slate-600">{u.points} pts • {u.badges} badges</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Points</th>
                  <th className="px-4 py-2 text-left">Badges</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((u, idx) => (
                  <tr key={u.id} className={`${idx % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                    <td className="px-4 py-3">{idx + 4}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.points}</td>
                    <td className="px-4 py-3">{u.badges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

