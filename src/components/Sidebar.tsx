import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  Scan, 
  Pill, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';
import { NavLink } from 'react-router-dom';

export type ActiveTab = 
  | 'dashboard' 
  | 'patients' 
  | 'appointments' 
  | 'doctors' 
  | 'lab' 
  | 'pharmacy' 
  | 'billing' 
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const menuItems = [
    { id: 'dashboard' as ActiveTab, path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as ActiveTab, path: '/patients', label: 'Patients', icon: Users },
    { id: 'appointments' as ActiveTab, path: '/appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors' as ActiveTab, path: '/doctors', label: 'Doctors', icon: UserCheck },
    { id: 'lab' as ActiveTab, path: '/diagnostics', label: 'Dental Radiology', icon: Scan },
    { id: 'pharmacy' as ActiveTab, path: '/inventory', label: 'Pharmacy', icon: Pill },
    { id: 'billing' as ActiveTab, path: '/billing', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'settings' as ActiveTab, path: '/settings', label: 'System Settings', icon: Settings },
  ] as { id: ActiveTab; path: string; label: string; icon: any; badge?: string }[];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-purple-900/30 bg-[#0F172A]/95 backdrop-blur-xl flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Logo Section */}
      <div>
        <div className="flex items-center justify-between h-20 px-3 border-b border-purple-900/30">
          {!collapsed ? (
            <Logo showSubtitle={true} />
          ) : (
            <div className="flex flex-col items-center justify-center w-full px-1">
              <Logo showSubtitle={false} isCompact={true} className="h-7" />
              <span className="text-[10px] font-extrabold tracking-tight text-white font-['Poppins'] -mt-0.5">
                DentaPlus
              </span>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-[#7C3AED] text-slate-300 hover:text-white transition-colors border border-purple-500/20 shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-2.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-lg shadow-purple-900/50 border border-purple-400/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon 
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-purple-400'
                  }`} 
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge && (
                  <span 
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Left Active Glow Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-purple-300 rounded-r-full shadow-glow" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom DentaPlus EMR Badge */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-[#1E1B4B]/80 to-[#0F172A] border border-purple-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#7C3AED]/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-bold text-purple-200">DentaPlus Cloud</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Dental EMR &amp; Practice Management Software • Digital Odontogram Synced.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Clinic Database Online
          </div>
        </div>
      )}
    </aside>
  );
};
