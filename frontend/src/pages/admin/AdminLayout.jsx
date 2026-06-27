import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/Sidebar'
import { Menu, X } from 'lucide-react'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-100">
      <div className="hidden lg:block flex-shrink-0 h-screen overflow-y-auto">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 top-0 z-40 bg-white/900 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="w-64 h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <AdminSidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="lg:hidden bg-brand-900 text-white px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-bold font-display">Admin Panel</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden  animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
