import { NavLink, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Edit3, Trash2, UserPlus, LayoutDashboard, Users as UsersIcon, CalendarDays, FolderOpen, NotebookTabs, FileBarChart, BarChart3, Megaphone, MessageSquare } from 'lucide-react'

export default function ClassDetailsPage() {
  const { id } = useParams()
  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Algebra I</h1>
          <p className="text-slate-600">Subject: Math • Teacher: Ms. Johnson • Semester: Fall 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Edit3 className="h-4 w-4"/> Edit</Button>
          <Button variant="outline" className="gap-2 text-red-600"><Trash2 className="h-4 w-4"/> Delete</Button>
          <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4"/> Add Student</Button>
        </div>
      </div>

      {/* Overview cards */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Total Students</div>
            <div className="text-3xl font-semibold">28</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Attendance Rate</div>
            <div className="text-3xl font-semibold">94%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600">Average Grade</div>
            <div className="text-3xl font-semibold">B+</div>
          </CardContent>
        </Card>
      </section>

      {/* Upcoming lessons + Progress chart */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Lessons</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { title: 'Quadratic Equations', date: 'Mon, Oct 6 • 09:00' },
              { title: 'Factoring Techniques', date: 'Wed, Oct 8 • 09:00' },
              { title: 'Graphing Parabolas', date: 'Fri, Oct 10 • 09:00' },
            ].map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-sm text-slate-600">{l.date}</div>
                </div>
                <Button variant="outline">View</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { w: 'W1', score: 78 },
                { w: 'W2', score: 81 },
                { w: 'W3', score: 84 },
                { w: 'W4', score: 86 },
                { w: 'W5', score: 88 },
                { w: 'W6', score: 90 },
              ]} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="w" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
      {/* Class navigation moved here: */}
      <Card>
        <CardHeader><CardTitle>Class Navigation</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { to: `/class/${id}`, label: 'Overview', icon: LayoutDashboard },
            { to: `/class/${id}/students`, label: 'Students', icon: UsersIcon },
            { to: `/class/${id}/attendance`, label: 'Attendance', icon: CalendarDays },
            { to: `/class/${id}/resources`, label: 'Resources', icon: FolderOpen },
            { to: `/class/${id}/assignments`, label: 'Assignments', icon: NotebookTabs },
            { to: `/class/${id}/exams`, label: 'Exams / Competitions', icon: FileBarChart },
            { to: `/class/${id}/grades`, label: 'Grades', icon: BarChart3 },
            { to: `/class/${id}/announcements`, label: 'Announcements', icon: Megaphone },
            { to: `/class/${id}/discussion`, label: 'Discussion', icon: MessageSquare },
          ].map((l) => {
            const Ico = l.icon
            return (
              <NavLink key={l.to} to={l.to} className={({isActive})=>`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm ${isActive?'border-brand-blue text-brand-blue':'border-slate-300 text-slate-800 hover:border-slate-400'}`}>
                <Ico className="h-4 w-4" /> {l.label}
              </NavLink>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Class Statistics</CardTitle></CardHeader>
        <CardContent className="overflow-hidden rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Metric</th>
                <th className="px-4 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Total Students</td><td className="px-4 py-3">28</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Attendance Rate</td><td className="px-4 py-3">94%</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Average Grade</td><td className="px-4 py-3">B+</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Assignments (Open/Closed)</td><td className="px-4 py-3">12 / 4</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Exams (Upcoming/Ongoing/Finished)</td><td className="px-4 py-3">3 / 1 / 6</td></tr>
              <tr className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Resources</td><td className="px-4 py-3">35</td></tr>
              <tr className="hover:bg-slate-100/70 transition-colors"><td className="px-4 py-3 font-medium">Announcements</td><td className="px-4 py-3">16</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

