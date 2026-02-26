import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BarChart3, Star, Shield, LogOut,
  Zap, ChevronRight, User
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/favorites', icon: Star, label: 'Favorites' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-0 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-surface-1 border-r border-white/5">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-glow-sm">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-lg leading-none">TaskFlow</div>
              <div className="text-xs text-white/30 mt-0.5">Smart Productivity</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-4 mb-3">
            Navigation
          </div>
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={clsx('nav-item w-full text-left', {
                'active': location.pathname === path
              })}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {location.pathname === path && (
                <ChevronRight className="w-3 h-3 ml-auto text-accent" />
              )}
            </button>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-4 mt-6 mb-3">
                Admin
              </div>
              <button
                onClick={() => navigate('/admin')}
                className={clsx('nav-item w-full text-left', {
                  'active': location.pathname === '/admin'
                })}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
                {location.pathname === '/admin' && (
                  <ChevronRight className="w-3 h-3 ml-auto text-accent" />
                )}
              </button>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-3 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-xs text-white/30 truncate">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-rose-400 transition-colors p-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
