import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cài đặt</h1>
        <p className="text-slate-600">Ngôn ngữ, giao diện, thông báo, quyền riêng tư</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tùy chọn</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-lg">
          <div>
            <label className="text-sm font-medium">Ngôn ngữ</label>
            <select className="mt-1 w-full rounded-2xl border px-3 py-2">
              <option>Tiếng Việt</option>
              <option>Tiếng Anh</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Chủ đề</label>
            <select className="mt-1 w-full rounded-2xl border px-3 py-2">
              <option>Sáng</option>
              <option>Tối</option>
              <option>Hệ thống</option>
            </select>
          </div>
          <Button>Lưu</Button>
        </CardContent>
      </Card>
    </div>
  )
}

