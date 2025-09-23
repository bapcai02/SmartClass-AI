import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

export default function AuthPage() {
  const login = useAuthStore((s) => s.login)
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'Student'|'Teacher'|'Parent'>('Student')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ id: 'u1', name: email.split('@')[0] || 'User', email, role })
  }

  return (
    <div className="grid place-items-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignup ? 'Create account' : 'Welcome back'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                className="rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                className="rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Role</label>
              <select
                className="rounded-2xl border border-slate-300 px-3 py-2 focus:border-brand-blue"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option>Student</option>
                <option>Teacher</option>
                <option>Parent</option>
              </select>
            </div>
            <Button type="submit" className="w-full">{isSignup ? 'Sign up' : 'Log in'}</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button className="text-brand-blue" onClick={() => setIsSignup((v) => !v)}>
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

