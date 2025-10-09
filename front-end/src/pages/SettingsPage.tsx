import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Shield, 
  Palette, 
  User as UserIcon, 
  Key, 
  Trash2, 
  Download,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'
import { 
  getSettings, 
  updateSettings,
  updateProfile,
  updatePassword,
  deleteAccount,
  exportData,
  type UserSettings,
} from '@/api/settings'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const queryClient = useQueryClient()

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmation: '',
  })

  const [settings, setSettings] = useState<UserSettings | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: () => import('@/api/profile').then(api => api.getProfile()),
  })

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      setSettings(data.settings)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setIsEditing(false)
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      })
      setShowPasswordForm(false)
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // Redirect to login or show success message
      window.location.href = '/login'
    },
  })

  const exportDataMutation = useMutation({
    mutationFn: exportData,
    onSuccess: (data) => {
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartclass-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })

  // Initialize settings and edit form
  useState(() => {
    if (settingsData) {
      setSettings(settingsData)
    }
  })

  useState(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      })
    }
  })

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm)
  }

  const handleSavePassword = () => {
    updatePasswordMutation.mutate(passwordForm)
  }

  const handleDeleteAccount = () => {
    if (deleteForm.confirmation === 'DELETE') {
      deleteAccountMutation.mutate(deleteForm)
    }
  }

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    if (!settings) return
    
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    }
    setSettings(newSettings)
    updateSettingsMutation.mutate(newSettings)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const tabs = [
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'privacy', label: 'Quyền riêng tư', icon: Shield },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'account', label: 'Tài khoản', icon: UserIcon },
  ]

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Cài đặt</h1>
          <p className="text-slate-600">Quản lý tùy chọn và cài đặt tài khoản của bạn</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 border transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-brand-blue text-black border-brand-blue' 
                      : 'text-black border-slate-300 hover:bg-black hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && settings && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Thông báo Email</h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-sm text-slate-600">
                        {key === 'email_notifications' && 'Nhận thông báo qua email'}
                        {key === 'assignment_reminders' && 'Nhắc nhở các bài tập sắp đến hạn'}
                        {key === 'exam_reminders' && 'Nhắc nhở các bài kiểm tra sắp tới'}
                        {key === 'grade_updates' && 'Thông báo khi có điểm'}
                        {key === 'announcement_notifications' && 'Thông báo khi có thông báo mới'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notifications', key, !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-brand-blue' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && settings && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Cài đặt quyền riêng tư</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hiển thị hồ sơ</label>
                  <select
                    value={settings.privacy.profile_visibility}
                    onChange={(e) => handleSettingChange('privacy', 'profile_visibility', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="public">Công khai</option>
                    <option value="friends">Chỉ bạn bè</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </div>
                {Object.entries(settings.privacy).filter(([key]) => key !== 'profile_visibility').map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-sm text-slate-600">
                        {key === 'show_email' && 'Hiển thị email của bạn cho người khác'}
                        {key === 'show_activity' && 'Hiển thị hoạt động của bạn cho người khác'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('privacy', key, !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-brand-blue' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && settings && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Giao diện</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Chủ đề</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'light', label: 'Sáng', icon: Sun },
                      { value: 'dark', label: 'Tối', icon: Moon },
                      { value: 'auto', label: 'Tự động', icon: Monitor },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => handleSettingChange('appearance', 'theme', value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          settings.appearance.theme === value
                            ? 'bg-brand-blue text-white border-brand-blue'
                            : 'text-black border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ngôn ngữ</label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="en">Tiếng Anh</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="es">Tiếng Tây Ban Nha</option>
                    <option value="fr">Tiếng Pháp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Múi giờ</label>
                  <select
                    value={settings.appearance.timezone}
                    onChange={(e) => handleSettingChange('appearance', 'timezone', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                    <option value="America/New_York">Mỹ/New_York</option>
                    <option value="Europe/London">Châu Âu/London</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Thông tin hồ sơ</h3>
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="text-black hover:bg-black hover:text-white"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Họ và tên</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Giới thiệu</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Ảnh đại diện (URL)</label>
                      <input
                        type="url"
                        value={editForm.avatar_url}
                        onChange={(e) => setEditForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="text-black hover:bg-black hover:text-white"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-brand-blue text-white hover:bg-brand-blue/90"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Họ và tên</div>
                    <div className="text-slate-900">{user?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Email</div>
                    <div className="text-slate-900">{user?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Giới thiệu</div>
                    <div className="text-slate-900">{user?.bio || 'Chưa có giới thiệu'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Thành viên từ</div>
                    <div className="text-slate-900">{user?.created_at && formatDate(user.created_at)}</div>
                  </div>
                </div>
              )}
            </Card>

            {/* Password Settings */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Mật khẩu</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-black hover:bg-black hover:text-white"
                >
                  <Key className="mr-2 h-4 w-4" />
                  {showPasswordForm ? 'Hủy' : 'Đổi mật khẩu'}
                </Button>
              </div>
              {showPasswordForm && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePassword}
                      disabled={updatePasswordMutation.isPending}
                      className="bg-brand-blue text-white hover:bg-brand-blue/90"
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Cập nhật mật khẩu
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Hành động tài khoản</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">Xuất dữ liệu</div>
                    <div className="text-sm text-slate-600">Tải xuống bản sao dữ liệu của bạn</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportDataMutation.mutate()}
                    disabled={exportDataMutation.isPending}
                    className="text-black hover:bg-black hover:text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Xuất
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-600">Xóa tài khoản</div>
                    <div className="text-sm text-slate-600">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="p-6 max-w-md w-full mx-4">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Xóa tài khoản</h3>
                  </div>
                  <p className="text-slate-600 mb-4">
                    Hành động này không thể hoàn tác. Thao tác sẽ xóa vĩnh viễn tài khoản và toàn bộ dữ liệu khỏi hệ thống.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu</label>
                      <input
                        type="password"
                        value={deleteForm.password}
                        onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Gõ "DELETE" để xác nhận</label>
                      <input
                        type="text"
                        value={deleteForm.confirmation}
                        onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmation: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-black hover:bg-black hover:text-white"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending || deleteForm.confirmation !== 'DELETE'}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Đang xóa...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa tài khoản
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
