import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, NotebookTabs, BarChart3, MessageCircle, User, MessageSquare, Trophy, FileBarChart, FolderOpen, Settings, BookOpen } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { to: '/classes', label: 'Lớp học', icon: NotebookTabs },
  { to: '/assignments', label: 'Bài tập', icon: NotebookTabs },
  { to: '/exams', label: 'Bài kiểm tra', icon: FileBarChart },
  { to: '/reports', label: 'Báo cáo', icon: BarChart3 },
  { to: '/chat', label: 'Trò chuyện', icon: MessageCircle },
  { to: '/qa', label: 'Hỏi & Đáp', icon: MessageSquare },
  { to: '/resources', label: 'Tài nguyên', icon: FolderOpen },
  { to: '/question-bank', label: 'Ngân hàng câu hỏi', icon: BookOpen },
  { to: '/leaderboard', label: 'Bảng xếp hạng', icon: Trophy },
  { to: '/profile', label: 'Hồ sơ', icon: User },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
  { to: '/ai-chat', label: 'Trợ lý AI', icon: MessageCircle },
]

export function Sidebar() {
  const location = useLocation()
  return (
    <aside className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-80">
      <div className="h-full overflow-y-auto space-y-3 p-5 border border-slate-200 bg-white">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <div key={l.to}>
              {false ? (
                <div />
              ) : (
                <NavLink
                  to={l.to}
                  className={({ isActive }) => {
                    const active = isActive || (l.to === '/classes' && location.pathname.startsWith('/class/'))
                    return `group relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${active ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-50'}`
                  }}
                >
                  <Icon className="h-5 w-5" /> {l.label}
                </NavLink>
              )}
              {null}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

