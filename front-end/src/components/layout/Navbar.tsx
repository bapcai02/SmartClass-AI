import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, CircleUserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { useLogout } from '@/hooks/auth'
import { useUser } from '@/hooks/auth'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/classes', label: 'Classes' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/reports', label: 'Reports' },
  { to: '/chat', label: 'Chat' },
  { to: '/profile', label: 'Profile' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = useLogout()
  const { data: me } = useUser()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const authUser = (() => {
    try {
      const raw = localStorage.getItem('auth_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const user = me || authUser

  const initials = (name?: string, email?: string) =>
    (name || email || '')
      .split(' ')
      .filter(Boolean)
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
    } catch {}
    navigate('/login', { replace: true })
  }
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="container-px mx-auto flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/brand-mark.svg" alt="SmartClass AI" className="h-7 w-7" />
          <Link to="/" className="text-lg font-semibold tracking-tight">
            SmartClass AI
          </Link>
        </div>
        <div className="hidden md:flex flex-1 max-w-xl items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm shadow-sm focus:border-brand-blue focus:outline-none"
                placeholder="Search classes, assignments..."
              />
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <button className="rounded-full p-2 hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600" />
          </button>
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-100"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green grid place-items-center text-slate-900 text-xs font-semibold border border-slate-200">
                  {initials(user?.name, user?.email)}
                </div>
              )}
              <div className="hidden lg:flex flex-col leading-tight text-left">
                <span className="text-sm font-medium text-slate-800">
                  {user?.name || 'Guest'}
                </span>
                <span className="text-xs text-slate-500 truncate max-w-[160px]">
                  {user?.email || ''}
                </span>
              </div>
            </button>
            {userMenuOpen ? (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-md">
                <Link
                  to="/profile"
                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => { setUserMenuOpen(false); handleLogout() }}
                  disabled={logout.isPending}
                >
                  {logout.isPending ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <Button className="md:hidden" variant="outline" onClick={() => setOpen((v) => !v)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {open ? (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container-px mx-auto grid gap-1 py-2">
            <div className="flex items-center gap-2 px-3 py-2">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green grid place-items-center text-slate-900 text-xs font-semibold border border-slate-200">
                  {initials(user?.name, user?.email)}
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-slate-800">{user?.name || 'Guest'}</span>
                <span className="text-xs text-slate-500">{user?.email || ''}</span>
              </div>
            </div>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Button variant="outline" onClick={() => { setOpen(false); handleLogout() }} disabled={logout.isPending}>
              {logout.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}

