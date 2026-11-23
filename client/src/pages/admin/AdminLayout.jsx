import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Tag, Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-accent font-black text-xl tracking-[0.3em] uppercase">LUXE</span>
        <div className="mt-3">
          <p className="text-white font-semibold text-sm">{user?.name}</p>
          <span className="inline-flex items-center mt-1 bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-sm
              ${isActive ? 'bg-accent text-primary' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/10"
        >
          <ChevronRight size={16} /> View Store
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors rounded-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-primary flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-60 bg-primary z-50 flex flex-col lg:hidden">
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
                <X size={22} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-primary"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-primary uppercase tracking-widest">Admin Panel</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
