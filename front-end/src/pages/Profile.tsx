import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user) || { name: 'Alex', email: 'alex@example.com', role: 'Student' as const }
  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-green" />
          <div>
            <div className="text-xl font-semibold">{user.name}</div>
            <div className="text-sm text-slate-600">{user.role} • {user.email}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:max-w-lg">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input className="mt-1 w-full rounded-2xl border px-3 py-2" defaultValue={user.name} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input className="mt-1 w-full rounded-2xl border px-3 py-2" defaultValue={user.email} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="classes">
          <Card>
            <CardHeader><CardTitle>My Classes</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">Class list coming soon...</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="achievements">
          <Card>
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">Badges and milestones coming soon...</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">Notification and privacy controls...</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

