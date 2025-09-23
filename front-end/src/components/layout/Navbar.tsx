import { Link, NavLink } from 'react-router-dom'
import { Menu, Bell, Search, CircleUserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

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
        <div className="hidden md:flex items-center gap-2">
          <button className="rounded-full p-2 hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600" />
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-green grid place-items-center text-white">
            <CircleUserRound className="h-5 w-5" />
          </div>
        </div>
        <Button className="md:hidden" variant="outline" onClick={() => setOpen((v) => !v)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {open ? (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container-px mx-auto grid gap-1 py-2">
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
          </div>
        </div>
      ) : null}
    </header>
  )
}

