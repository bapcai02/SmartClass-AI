import { NavLink } from 'react-router-dom'
import { LayoutDashboard, NotebookTabs, BarChart3, MessageCircle, User, MessageSquare, Trophy, FileBarChart, FolderOpen, Settings } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/classes', label: 'Classes', icon: NotebookTabs },
  { to: '/assignments', label: 'Assignments', icon: NotebookTabs },
  { to: '/exams', label: 'Exams', icon: FileBarChart },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/qa', label: 'Q&A', icon: MessageSquare },
  { to: '/resources', label: 'Resources', icon: FolderOpen },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
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
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-50'}`
                  }
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

