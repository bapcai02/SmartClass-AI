import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { classes, announcements, stats } from '@/data/dummy'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts'
import { MetricChip } from '@/components/ui/metric-chip'
import { Link } from 'react-router-dom'
import { useUser } from '@/hooks/auth'

export default function DashboardPage() {
  const { data: user } = useUser()
  return (
    <div className="grid gap-8">
      <div className="rounded-2xl bg-gradient-to-r from-slate-100 to-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{user ? `Welcome, ${user.name}` : 'Welcome back, Alex'}</h1>
        <p className="text-slate-600">Keep up the great work. You’re making steady progress!</p>
      </div>
      <section className="grid gap-3 md:grid-cols-4">
        <MetricChip label="Assignments Due" value={stats.assignmentsDue} color="amber" />
        <MetricChip label="Completed" value={stats.completed} color="green" />
        <MetricChip label="Avg Score" value={`${stats.avgScore}%`} color="blue" />
        <MetricChip label="Active Classes" value={classes.length} />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {classes.map((c) => (
                <Card key={c.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="text-lg font-semibold">{c.name}</div>
                    <div className="text-sm text-slate-600">{c.teacher}</div>
                    <div className="text-sm text-slate-600">{c.students} students</div>
                    <Link to={`/class/${c.id}`}>
                      <Button className="mt-3" variant="outline">Open</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-slate-600">{a.body}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{w:'W1',you:70,avg:68},{w:'W2',you:75,avg:72},{w:'W3',you:80,avg:77},{w:'W4',you:85,avg:80},{w:'W5',you:88,avg:83},{w:'W6',you:90,avg:85}]}
                margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="w" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="you" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="avg" stroke="#22c55e" strokeWidth={2} />
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
              <BarChart data={[{ t: 'Algebra', s: 90 }, { t: 'Geometry', s: 80 }, { t: 'Graphs', s: 85 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="s" fill="#2563eb" radius={[10,10,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

