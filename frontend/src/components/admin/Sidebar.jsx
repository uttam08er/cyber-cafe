import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CalendarDays,
  MessageSquare,
  LogOut,
  Wifi,
  ChevronRight,
  Bell,
} from "lucide-react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/services", label: "Services", icon: Briefcase },
  { to: "/admin/requests", label: "Requests", icon: FileText },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/contacts", label: "Messages", icon: MessageSquare },
  { to: "/admin/updates", label: "Daily Updates", icon: Bell },
];

export default function AdminSidebar({ mobile = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`${mobile ? "w-full h-full max-h-screen" : "w-60 h-full max-h-screen"} bg-brand-900 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-surface-400">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Wifi size={16} className="text-white" />
          </div>
        </Link>
        <div>
          <p className="font-bold text-white font-display text-sm">
            Shaurya eServices
          </p>
          <p className="text-xs text-surface-300">Management Panel</p>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-surface-400">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-brand-800">
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user?.full_name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-xs truncate">
              Welcome, {user?.full_name}
            </p>
            <p className="text-surface-300 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-brand"
                  : "text-surface-200 hover:text-white hover:bg-brand-600"
              }`
            }
          >
            <Icon size={16} />
            {label}
            <ChevronRight size={16} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-3 mb-3 border-b border-surface-400"></div>
      <div className="px-3 pb-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-200 hover:text-accent-330 hover:bg-accent-330/15 transition-all w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
