import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'
import { progressSeries, leaderboard } from '@/data/dummy'
import { BarChart3, CheckCircle2, TrendingUp } from 'lucide-react'

const chartData = Array.from({ length: 6 }, (_, i) => ({
  label: `W${i + 1}`,
  you: progressSeries[0].data[i],
  classAvg: progressSeries[1].data[i],
}))

export default function ReportsPage() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700"><BarChart3 className="h-5 w-5"/></div>
            <div>
              <div className="text-sm text-slate-600">Average Score</div>
              <div className="text-3xl font-semibold">87%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2 text-brand-green"><CheckCircle2 className="h-5 w-5"/></div>
            <div>
              <div className="text-sm text-slate-600">Exams Completed</div>
              <div className="text-3xl font-semibold">12</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-brand-blue"><TrendingUp className="h-5 w-5"/></div>
            <div>
              <div className="text-sm text-slate-600">Improvement Rate</div>
              <div className="text-3xl font-semibold">+8%</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[60, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="you" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="classAvg" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strengths vs Weaknesses</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ topic: 'Algebra', score: 90 }, { topic: 'Geometry', score: 80 }, { topic: 'Graphs', score: 85 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Top Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Points</th>
                    <th className="px-4 py-2 text-left">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0,5).map((u, idx) => (
                    <tr key={u.id} className={idx ? 'border-t' : ''}>
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.points}</td>
                      <td className="px-4 py-2">{u.badges}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

