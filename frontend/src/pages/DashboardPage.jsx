import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, FileText, CalendarDays, User, Settings } from 'lucide-react'

const sideNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/requests', label: 'My Requests', icon: FileText },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: CalendarDays },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900 font-display">
            Hey, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage your requests, bookings, and profile</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-surface-200 p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {sideNav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                    }`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
