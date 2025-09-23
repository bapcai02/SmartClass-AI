import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-px mx-auto flex gap-6 py-8 items-stretch">
        <Sidebar />
        <main className="min-w-0 flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto md:ml-80 lg:ml-80">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

