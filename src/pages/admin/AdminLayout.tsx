import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Package, label: 'Inventory', path: '/admin/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0B0B0D] text-white">
      {/* Sidebar */}
      <aside 
        className={`relative bg-[#0F0F12] border-r border-white/5 transition-all duration-300 flex flex-col ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-[#D4A24F] text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className={`p-8 mb-6 ${isSidebarCollapsed ? 'items-center' : ''}`}>
          <NavLink to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
            {!isSidebarCollapsed && <span>AtCozy</span>}
            <span className="text-[#D4A24F]">Admin</span>
          </NavLink>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-[#D4A24F] text-black shadow-[0_0_20px_rgba(212,162,79,0.2)]' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon size={20} className={isSidebarCollapsed ? 'mx-auto' : ''} />
              {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User / Bottom info */}
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-4">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4A24F]/20 flex items-center justify-center text-[#D4A24F] font-bold">
                  {user?.name?.[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-4 px-4 py-2 text-white/50 hover:text-red-400 transition-colors ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={18} />
              {!isSidebarCollapsed && <span className="text-sm font-medium">Log out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0B0B0D] to-[#0F0F12]">
        <header className="sticky top-0 z-10 px-10 py-6 bg-[#0B0B0D]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-6">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-white/60">Server Online</span>
            </div>
          </div>
        </header>

        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
