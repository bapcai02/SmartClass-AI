import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Edit3, Trash2, UserPlus } from 'lucide-react'

export default function ClassDetailsPage() {
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

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card>
            <CardHeader><CardTitle>Students</CardTitle></CardHeader>
            <CardContent className="overflow-hidden rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Last Active</th>
                    <th className="px-4 py-2 text-left">Attendance</th>
                    <th className="px-4 py-2 text-left">Grade</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6,7,8,9,10].map((i)=> (
                    <tr key={i} className={`${i % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                      <td className="px-4 py-3 font-medium">Student {i}</td>
                      <td className="px-4 py-3">student{i}@school.edu</td>
                      <td className="px-4 py-3">Student</td>
                      <td className="px-4 py-3">Today 10:{10+i}</td>
                      <td className="px-4 py-3">{90 - i}%</td>
                      <td className="px-4 py-3">{String.fromCharCode(65 + (i%5))}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assignments">
          <Card>
            <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
            <CardContent className="overflow-hidden rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Points</th>
                    <th className="px-4 py-2 text-left">Submissions</th>
                    <th className="px-4 py-2 text-left">Avg Score</th>
                    <th className="px-4 py-2 text-left">Due</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6].map((i)=> (
                    <tr key={i} className={`${i % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                      <td className="px-4 py-3 font-medium">Assignment {i}</td>
                      <td className="px-4 py-3">Math</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3">{20 + i}</td>
                      <td className="px-4 py-3">{80 + i}%</td>
                      <td className="px-4 py-3">Due in {i*2} days</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">In Progress</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources">
          <Card>
            <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
            <CardContent className="overflow-hidden rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Uploaded By</th>
                    <th className="px-4 py-2 text-left">Uploaded</th>
                    <th className="px-4 py-2 text-left">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5,6,7].map((i)=> (
                    <tr key={i} className={`${i % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                      <td className="px-4 py-3 font-medium">Resource {i}</td>
                      <td className="px-4 py-3">PDF</td>
                      <td className="px-4 py-3">{5 + i} MB</td>
                      <td className="px-4 py-3">Ms. Johnson</td>
                      <td className="px-4 py-3">Sep {10+i}, 2025</td>
                      <td className="px-4 py-3">{10 * i}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="announcements">
          <Card>
            <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
            <CardContent className="overflow-hidden rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Author</th>
                    <th className="px-4 py-2 text-left">Audience</th>
                    <th className="px-4 py-2 text-left">Pinned</th>
                    <th className="px-4 py-2 text-left">Attachments</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5].map((i)=> (
                    <tr key={i} className={`${i % 2 ? 'bg-slate-50/50' : ''} hover:bg-slate-100/70 transition-colors`}>
                      <td className="px-4 py-3 font-medium">Announcement {i}</td>
                      <td className="px-4 py-3">Oct {i+3}, 2025</td>
                      <td className="px-4 py-3">Ms. Johnson</td>
                      <td className="px-4 py-3">Class</td>
                      <td className="px-4 py-3">{i%2 ? 'Yes':'No'}</td>
                      <td className="px-4 py-3">{i} files</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

