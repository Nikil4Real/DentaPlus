import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Clock, 
  ChevronDown,
  Building2,
  Settings,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { Role, ClinicInfo, PharmacyItem, Appointment } from '../types';

interface HeaderProps {
  currentRole: Role;
  clinicInfo?: ClinicInfo;
  pharmacy?: PharmacyItem[];
  appointments?: Appointment[];
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  collapsed: boolean;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  clinicInfo,
  pharmacy = [],
  appointments = [],
  onOpenQuickAdd,
  onOpenSearch,
  collapsed,
  onLogout,
  onNavigateToSettings
}) => {
  const [time, setTime] = useState<string>('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const lowStockPharmacy = pharmacy.filter(p => p.stock <= p.minStockThreshold);
  const activeAppointments = appointments.filter(a => a.status === 'In Consultation');

  const notifications = [
    ...lowStockPharmacy.map((p, idx) => ({
      id: `pharm-${idx}`,
      title: 'Low Dental Inventory',
      desc: `${p.name} stock below threshold (${p.stock} remaining)`,
      time: 'Stock Alert',
      type: 'warning' as const
    })),
    ...activeAppointments.map((a, idx) => ({
      id: `apt-${idx}`,
      title: `Token #${a.tokenNumber} In Chair`,
      desc: `${a.patientName} with ${a.doctorName}`,
      time: a.time || 'Today',
      type: 'info' as const
    }))
  ];

  const clinicName = clinicInfo?.name || 'Kathmandu Dental Hospital & Implant Center';

  return (
    <header 
      className={`fixed top-0 right-0 z-30 h-20 transition-all duration-300 border-b border-purple-900/30 bg-[#0F172A]/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 ${
        collapsed ? 'left-20 w-[calc(100%-5rem)]' : 'left-64 w-[calc(100%-16rem)]'
      }`}
    >
      {/* Compact Patient Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-sm sm:max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-purple-500/20 hover:border-purple-500/50 text-slate-400 hover:text-slate-200 transition-all text-xs group"
        >
          <Search className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="flex-1 text-left truncate">Search patients by name or UHID...</span>
        </button>

        {/* Real-time Kathmandu Clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/30 text-purple-200 text-xs font-mono shrink-0">
          <Clock className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>{time || '09:30:00 AM'} NPT</span>
        </div>
      </div>

      {/* Right Controls & Clinic Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Add Action Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-semibold shadow-lg shadow-purple-900/40 border border-purple-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Patient / Token</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-purple-500/20 text-slate-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-purple-300" />
            {notifications.length > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
              </>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#0F172A] border border-purple-500/30 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/30 mb-3">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" /> Notifications
                </span>
                <span className="text-[10px] font-medium bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full">
                  {notifications.length} {notifications.length === 1 ? 'Update' : 'Updates'}
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active alerts or notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-800/50 border border-purple-900/20 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-normal text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dental Clinic Profile Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-purple-500/30 text-white transition-all group"
            title="Clinic Profile & Account"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-purple-600 p-0.5 flex items-center justify-center shadow-md shadow-purple-900/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-purple-300 group-hover:scale-105 transition-transform" />
              </div>
            </div>
            <div className="text-left hidden lg:block max-w-[160px] xl:max-w-[220px]">
              <div className="text-xs font-bold text-slate-100 truncate flex items-center gap-1">
                <span className="truncate">{clinicName}</span>
                <ChevronDown className="w-3 h-3 text-purple-400 shrink-0" />
              </div>
              <div className="text-[10px] text-purple-300 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{currentRole} Session</span>
              </div>
            </div>
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#0F172A] border border-purple-500/30 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
              {/* Clinic Header Card */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-purple-400 p-0.5 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-extrabold text-white truncate">{clinicName}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{clinicInfo?.tagline || 'Dental Practice Management'}</p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-purple-900/40 text-[10px] text-slate-300 space-y-1 font-mono">
                  {clinicInfo?.licenseCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">License:</span>
                      <span className="text-purple-300 font-semibold">{clinicInfo.licenseCode}</span>
                    </div>
                  )}
                  {clinicInfo?.panNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">PAN No:</span>
                      <span className="text-purple-300 font-semibold">{clinicInfo.panNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Logged in role details */}
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">{currentRole} Account</div>
                    <div className="text-[10px] text-slate-400">Authenticated &amp; Active</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  Active
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-1 pt-1 border-t border-purple-900/30">
                {onNavigateToSettings && (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onNavigateToSettings();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-200 hover:bg-slate-800 text-xs font-medium transition"
                  >
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span>Manage System &amp; Clinic Settings</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out / Lock Session</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
