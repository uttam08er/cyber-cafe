import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  Wifi,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/updates", label: "Updates" },
    { to: "/booking", label: "Book PC" },
    { to: "/contact", label: "Contact" },
  ];

  const activeCls = "text-brand-600 font-semibold";
  const inactiveCls = "text-surface-800 hover:text-brand-600";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-surface-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-brand group-hover:bg-brand-700 transition-colors">
              <Wifi size={18} className="text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-lg leading-4 text-surface-900 font-display">
                Shaurya
              </span>
              <span className="text-xs leading-none text-brand-600 text-start">
                eServices
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div
            className="hidden md:flex items-center gap-6"
            onClick={() => setDropdownOpen(false)}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? activeCls : inactiveCls}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-bold text-sm">
                      {user?.full_name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-surface-800 max-w-[120px] truncate">
                    {user?.full_name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-surface-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl border border-surface-200 shadow-xl py-1.5 z-60 animate-fade-in">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      My Dashboard
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                    >
                      <User size={15} />
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors font-semibold"
                      >
                        <Shield size={15} />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-surface-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            name="nav links for mobile"
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-surface-100 animate-slide-up">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-600"
                        : "text-surface-700 hover:bg-surface-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="my-2 border-surface-100" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 flex items-center gap-2"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50 flex items-center gap-2"
                    >
                      <Shield size={15} /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary flex-1 justify-center text-sm py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary flex-1 justify-center text-sm py-2"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
