import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Scan, 
  Pill, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  FileCheck,
  MapPin,
  Phone,
  Mail,
  CalendarCheck,
  Filter
} from 'lucide-react';
import { Patient, Appointment, Doctor, DentalXRay, PharmacyItem, ClinicInfo } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  doctors: Doctor[];
  labTests: DentalXRay[];
  pharmacy: PharmacyItem[];
  clinicInfo: ClinicInfo;
  onOpenQuickAdd: () => void;
  onSelectPatient: (patient: Patient) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  appointments,
  doctors,
  labTests,
  pharmacy,
  clinicInfo,
  onOpenQuickAdd,
  onSelectPatient,
  onNavigateTab
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const isTodaySelected = selectedDate === todayStr;

  // Filter appointments date-responsively
  const selectedDateAppointments = appointments.filter(a => a.date === selectedDate);
  const inConsultation = selectedDateAppointments.filter(a => a.status === 'In Consultation').length;
  const followUpCount = selectedDateAppointments.filter(a => a.type === 'Follow-up').length;
  const lowStockCount = pharmacy.filter(p => p.stock <= p.minStockThreshold).length;

  // Format date nicely
  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner - Compact Layout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#2E1065] p-4 sm:p-5 border border-purple-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          {/* Dental Clinic Profile Header with Logo aligned to TOP LEFT */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            
            {/* LOGO on Top-Left Side of Clinic Name */}
            <div 
              className="shrink-0 relative group self-start"
              style={{
                paddingLeft: '10px',
                paddingTop: '10px',
                marginTop: '-1px',
                width: '60px',
                height: '60px'
              }}
            >
              {clinicInfo.logoUrl ? (
                <img 
                  src={clinicInfo.logoUrl} 
                  alt={clinicInfo.name} 
                  className="w-full h-full object-contain rounded-xl bg-slate-900/90 p-0 border border-purple-400/40 shadow-md shadow-purple-950/60"
                  style={{ padding: 0 }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              {/* High Quality Dental Emblem Logo */}
              {(!clinicInfo.logoUrl) && (
                <div className="flex items-center justify-center w-full h-full rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#6D28D9] p-2.5 shadow-md shadow-purple-950/80 border border-purple-400/40 relative group-hover:scale-105 transition-transform duration-300">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-full h-full text-white fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round"
                  >
                    <path d="M12 4c-3.5 0-6 2-6 5.5 0 2.5 1.2 5 2 7.5.5 1.5 1 3.5 2 3.5s1.2-1.5 2-3.5c.8 2 1.2 3.5 2 3.5s1.5-2 2-3.5c.8-2.5 2-5 2-7.5C18 6 15.5 4 12 4z" stroke="currentColor" fill="rgba(255,255,255,0.2)" />
                    <path d="M12 7v5M9.5 9.5h5" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                </div>
              )}
            </div>

            {/* Clinic Name & Dental Details */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7C3AED]/30 text-purple-300 border border-purple-500/40 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-purple-400" /> Secured &amp; Managed by DentaPlus
              </div>
              
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Poppins'] tracking-tight leading-snug">
                {clinicInfo.name}
              </h1>

              {clinicInfo.tagline && (
                <p className="text-purple-200/90 text-xs font-medium">
                  {clinicInfo.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 pt-1 text-slate-300 text-[11px]">
                {clinicInfo.address && (
                  <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-purple-900/30">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    <span>{clinicInfo.address}</span>
                  </span>
                )}
                {clinicInfo.phone && (
                  <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-purple-900/30">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{clinicInfo.phone}</span>
                  </span>
                )}
                {clinicInfo.licenseCode && (
                  <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-purple-900/30 font-mono text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Reg: {clinicInfo.licenseCode}</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Quick Issue Token Action Button */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              onClick={onOpenQuickAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold shadow-md shadow-purple-900/50 border border-purple-400/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Issue Dental Token / EMR
            </button>
          </div>

        </div>
      </div>

      {/* Hero Welcome Banner - Compact Layout */}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div 
          onClick={() => onNavigateTab('patients')}
          className="p-5 rounded-2xl bg-gradient-to-b from-[#1E1B4B]/70 to-[#0F172A] border border-purple-900/30 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Patient Records Of All Time</span>
            <div className="p-2.5 rounded-xl bg-[#7C3AED]/20 text-purple-300 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3 font-['Poppins']">{patients.length}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> {patients.length === 0 ? '0 registered patients of all time' : `${patients.length} registered patients of all time`}
          </div>
        </div>

        {/* Selected Date OPD Appointments */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="p-5 rounded-2xl bg-gradient-to-b from-[#1E1B4B]/70 to-[#0F172A] border border-purple-900/30 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isTodaySelected ? "Today's Total OPD Visits" : `Visits for ${selectedDate}`}
            </span>
            <div className="p-2.5 rounded-xl bg-[#7C3AED]/20 text-purple-300 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3 font-['Poppins']">{selectedDateAppointments.length}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-300 mt-2 font-medium">
            <Clock className="w-3.5 h-3.5" /> {inConsultation} Active in Chair
          </div>
        </div>

        {/* Scheduled Follow-ups for Selected Date */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="p-5 rounded-2xl bg-gradient-to-b from-[#1E1B4B]/70 to-[#0F172A] border border-purple-900/30 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isTodaySelected ? "Today's Follow-up Visits" : `Follow-ups on ${selectedDate}`}
            </span>
            <div className="p-2.5 rounded-xl bg-[#7C3AED]/20 text-purple-300 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3 font-['Poppins']">{followUpCount}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Recall Visits Scheduled
          </div>
        </div>

        {/* Dental Pharmacy Stock */}
        <div 
          onClick={() => onNavigateTab('pharmacy')}
          className="p-5 rounded-2xl bg-gradient-to-b from-[#1E1B4B]/70 to-[#0F172A] border border-purple-900/30 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pharmacy Inventory</span>
            <div className="p-2.5 rounded-xl bg-[#7C3AED]/20 text-purple-300 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-3 font-['Poppins']">{pharmacy.length} Items</div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-2 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> {lowStockCount} Low Stock Alert
          </div>
        </div>
      </div>

      {/* Main Grid: OPD Timeline Queue & Dental Specialists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* OPD Queue Timeline (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Poppins']">
                <Clock className="w-4 h-4 text-purple-400" /> 
                {isTodaySelected ? "Today's Active Consultation Queue" : `Appointments for ${selectedDate}`}
              </h3>
              <p className="text-xs text-slate-400">
                Live token sequence for operatories on {formatDateLabel(selectedDate)}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View Appointments <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-purple-900/30 space-y-2">
                <Calendar className="w-8 h-8 text-purple-400/40 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">
                  No appointments or follow-up visits scheduled for {selectedDate}.
                </p>
                <p className="text-[11px] text-slate-500">
                  Click "Issue Dental Token" above to schedule a patient for this date.
                </p>
              </div>
            ) : (
              selectedDateAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-purple-900/20 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      #{apt.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{apt.patientName}</span>
                        {apt.type === 'Follow-up' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700">
                            Follow-Up Visit
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-purple-300">{apt.doctorName} • <span className="text-slate-400">{apt.department}</span></div>
                      {apt.notes && <div className="text-[11px] text-slate-400 italic mt-0.5">{apt.notes}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-mono text-slate-400">{apt.time}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      apt.status === 'In Consultation' 
                        ? 'bg-purple-950 text-purple-200 border-purple-500/50 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Doctors Roster Panel (1 col) */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-['Poppins']">
              <FileCheck className="w-4 h-4 text-purple-400" /> Dental Doctors
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono">Duty Roster</span>
          </div>

          <div className="space-y-3">
            {doctors.slice(0, 4).map((doc) => (
              <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-purple-900/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{doc.name}</div>
                  <div className="text-[11px] text-purple-300">{doc.specialization}</div>
                  <div className="text-[10px] text-purple-400 font-mono mt-0.5 font-bold">NMC: {doc.nmcNo}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                  doc.status === 'Available'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                    : 'bg-amber-950 text-amber-300 border-amber-800/50'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
