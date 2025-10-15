import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { useLogout } from '@/hooks/auth'
import { useUser } from '@/hooks/auth'

const links = [
  { to: '/dashboard', label: 'Bảng điều khiển' },
  { to: '/classes', label: 'Lớp học' },
  { to: '/assignments', label: 'Bài tập' },
  { to: '/reports', label: 'Báo cáo' },
  { to: '/public/pdfs', label: 'Thư viện PDF', hasSub: true },
  { to: '/chat', label: 'Trò chuyện' },
  { to: '/profile', label: 'Hồ sơ' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
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
                placeholder="Tìm lớp, bài tập..."
              />
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
          {links.map((l) => {
            const base = (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => {
                  const active = isActive || (l.to === '/classes' && location.pathname.startsWith('/class/'))
                  return `relative rounded-xl px-3 py-2 text-sm ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`
                }}
              >
                {l.label}
              </NavLink>
            )
            if (!l.hasSub) return base

            // Submenu for Thư viện PDF
            return (
              <div key={l.to} className="relative group">
                {base}
                <div className="invisible absolute left-0 top-full z-50 mt-1 w-[560px] translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 transition">
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div>
                      <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Môn học</div>
                      <div className="grid gap-1 text-sm">
                        <Link to="/public/pdfs?subject_name=Toán" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Toán</Link>
                        <Link to="/public/pdfs?subject_name=Lý" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Vật lý</Link>
                        <Link to="/public/pdfs?subject_name=Hóa học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Hóa học</Link>
                        <Link to="/public/pdfs?subject_name=Sinh học" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Sinh học</Link>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Khối lớp</div>
                      <div className="grid gap-1 text-sm">
                        <Link to="/public/pdfs?class_name=L%C3%A1p%2010" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 10</Link>
                        <Link to="/public/pdfs?class_name=L%C3%A1p%2011" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 11</Link>
                        <Link to="/public/pdfs?class_name=L%E1%BB%9Bp%2012" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Lớp 12</Link>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 px-2 text-xs font-semibold text-slate-500">Category</div>
                      <div className="grid gap-1 text-sm">
                        <Link to="/public/pdfs?category=Thi%20%C4%91%E1%BA%A1i%20h%E1%BB%8Dc" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi đại học</Link>
                        <Link to="/public/pdfs?category=Thi%20gi%E1%BB%AFa%20k%E1%BB%B3" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi giữa kỳ</Link>
                        <Link to="/public/pdfs?category=Thi%20cu%E1%BB%91i%20k%E1%BB%B3" className="rounded-lg px-2 py-1.5 hover:bg-slate-50">Thi cuối kỳ</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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
                  {user?.name || 'Khách'}
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
                  Hồ sơ
                </Link>
                <button
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => { setUserMenuOpen(false); handleLogout() }}
                  disabled={logout.isPending}
                >
                  {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
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
                <span className="text-sm font-medium text-slate-800">{user?.name || 'Khách'}</span>
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
              {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}

