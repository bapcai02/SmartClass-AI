import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ClassDetailsPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Class Details</h1>
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
            <CardContent className="grid gap-2">
              {[1,2,3,4,5].map((i)=>(
                <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                  <div className="font-medium">Student {i}</div>
                  <div className="text-sm text-slate-600">Active</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assignments">
          <Card>
            <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {[1,2,3].map((i)=>(
                <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                  <div className="font-medium">Assignment {i}</div>
                  <div className="text-sm text-slate-600">Due in {i*2} days</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources">
          <Card>
            <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {[1,2,3].map((i)=>(
                <div key={i} className="rounded-xl border p-3">Resource {i}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="announcements">
          <Card>
            <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {[1,2].map((i)=>(
                <div key={i} className="rounded-xl border p-3">Announcement {i}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

