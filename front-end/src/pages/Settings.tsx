import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-slate-600">Language, theme, notifications, privacy</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-lg">
          <div>
            <label className="text-sm font-medium">Language</label>
            <select className="mt-1 w-full rounded-2xl border px-3 py-2">
              <option>English</option>
              <option>Tiếng Việt</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Theme</label>
            <select className="mt-1 w-full rounded-2xl border px-3 py-2">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
          <Button>Save</Button>
        </CardContent>
      </Card>
    </div>
  )
}

