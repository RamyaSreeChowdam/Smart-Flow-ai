import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Zap, Plus, Activity, Bell, BarChart3,
  Settings, LogOut, Menu, X, ChevronRight, Layers,
  Workflow, Bot, Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard',         label: 'Dashboard',         icon: LayoutDashboard },
  { path: '/automations',       label: 'Automations',       icon: Zap },
  { path: '/create-automation', label: 'Create Automation', icon: Plus },
  { path: '/analytics',         label: 'Analytics',         icon: BarChart3 },
  { path: '/activity',          label: 'Activity Log',      icon: Activity },
  { path: '/alerts',            label: 'Notifications',     icon: Bell },
  { path: '/settings',          label: 'Settings',          icon: Settings },
];

function NavItem({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`nav-item w-full text-left ${active ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon className="nav-icon w-5 h-5" />
      {!collapsed && <span className="nav-label flex-1 font-bold text-[15px] text-slate-100">{item.label}</span>}
      {!collapsed && active && <ChevronRight className="w-4 h-4 text-cyan-400 opacity-90 stroke-[2.5]" />}
    </button>
  );
}

function SidebarBrand({ collapsed }) {
  return (
    <div className={`sidebar-brand ${collapsed ? 'justify-center px-0 mx-2' : ''}`}>
      <div className="sidebar-logo">
        <Cpu className="w-6 h-6 text-white" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="text-white font-black text-lg leading-tight tracking-tight">Smart Automation</div>
          <div className="text-xs font-bold mt-0.5 text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            AI Sales Intelligence
          </div>
        </div>
      )}
    </div>
  );
}

function SmartAutomationCard({ collapsed }) {
  if (collapsed) {
    return (
      <div className="px-2 my-2 flex justify-center">
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg cursor-pointer" title="Smart Automation Engine">
          <img src="/smart-automation.jpg" alt="Smart Automation" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3.5 my-3 p-3 rounded-2xl relative overflow-hidden border border-blue-500/30 shadow-xl"
      style={{ background: 'linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(10,25,55,0.85) 100%)' }}>
      <div className="relative rounded-xl overflow-hidden mb-2.5 border border-cyan-400/30 group">
        <img
          src="/smart-automation.jpg"
          alt="Smart Automation Workflow Engine"
          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/80 text-cyan-300 border border-cyan-500/50 backdrop-blur-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Smart Automation
        </div>
        <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-900/90 text-blue-200 border border-blue-400/40">
          98.7% Flow Rate
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-white text-xs font-black flex items-center justify-between">
          <span>AI Workflow Engine</span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
          </span>
        </div>
        <p className="text-slate-300 text-[11px] font-semibold leading-snug">
          Autonomous pipelines & neural sales optimization running.
        </p>
      </div>
    </div>
  );
}

function SidebarFooter({ user, collapsed, onLogout }) {
  return (
    <div className="sidebar-footer space-y-2">
      <button
        onClick={onLogout}
        title={collapsed ? 'Logout' : undefined}
        className={`nav-item w-full text-left hover:text-red-400 hover:bg-red-500/15 ${collapsed ? 'justify-center px-0' : ''}`}
      >
        <LogOut className="nav-icon w-5 h-5 flex-shrink-0 text-slate-300 group-hover:text-red-400" />
        {!collapsed && <span className="nav-label font-bold text-[15px] text-slate-200">Logout</span>}
      </button>
      {!collapsed && (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.22)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-black truncate">{user?.name || 'User'}</p>
            <p className="truncate text-xs font-semibold text-slate-300">{user?.email || ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNav = (path) => { navigate(path); setMobileOpen(false); };

  const currentPage = NAV_ITEMS.find(n => n.path === location.pathname);
  const unreadAlerts = 0; // Will be dynamic when needed

  return (
    <div className="app-shell">
      {/* DESKTOP SIDEBAR */}
      <aside className={`sidebar hidden lg:flex flex-col ${collapsed ? 'collapsed' : ''}`}
        style={{ transition: 'width 0.3s ease' }}>
        <SidebarBrand collapsed={collapsed} />

        <nav className="sidebar-nav">
          <div className="nav-section-label mb-2.5 font-black text-xs tracking-widest">{!collapsed && 'NAVIGATION'}</div>
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.path}
              item={item}
              active={location.pathname === item.path}
              collapsed={collapsed}
              onClick={() => handleNav(item.path)}
            />
          ))}
        </nav>

        {/* SMART AUTOMATION PICTURE SHOWCASE */}
        <SmartAutomationCard collapsed={collapsed} />

        <div className="px-3.5 pb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full justify-center border border-dashed py-2"
            style={{ borderColor: 'rgba(37,99,235,0.35)' }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed
              ? <ChevronRight className="w-5 h-5 text-cyan-400" />
              : <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider"><X className="w-3.5 h-3.5" />Collapse Menu</div>
            }
          </button>
        </div>

        <SidebarFooter user={user} collapsed={collapsed} onLogout={handleLogout} />
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* MOBILE SIDEBAR */}
      <aside className={`sidebar flex lg:hidden flex-col ${mobileOpen ? 'mobile-open' : ''}`}
        style={{ transition: 'transform 0.3s ease' }}>
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(37,99,235,0.18)' }}>
          <SidebarBrand collapsed={false} />
          <button onClick={() => setMobileOpen(false)} className="icon-btn">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label mb-2.5 font-black text-xs tracking-widest">NAVIGATION</div>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.path} item={item} active={location.pathname === item.path}
              collapsed={false} onClick={() => handleNav(item.path)} />
          ))}
        </nav>
        <SmartAutomationCard collapsed={false} />
        <SidebarFooter user={user} collapsed={false} onLogout={handleLogout} />
      </aside>

      {/* MAIN */}
      <div className="main-content">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="icon-btn lg:hidden">
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <span className="text-white font-semibold text-sm">{currentPage?.label || 'SmartFlow AI'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/alerts')} className="icon-btn relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </button>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
              style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-300 hidden sm:inline">{user?.name?.split(' ')[0] || 'User'}</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
