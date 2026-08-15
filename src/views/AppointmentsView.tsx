import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Ticket,
  CalendarCheck,
  Filter
} from 'lucide-react';
import {   Appointment, Doctor, Patient } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onOpenQuickAdd: () => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  patients,
  doctors,
  onOpenQuickAdd,
  onUpdateAppointmentStatus
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateMode, setDateMode] = useState<'date' | 'all'>('date');
  const [customDate, setCustomDate] = useState<string>(todayStr);
  const [filterType, setFilterType] = useState<string>('All');

  const recentPatients = [...patients]
    .sort((a, b) => b.registeredDate.localeCompare(a.registeredDate))
    .slice(0, 5);
  const upcomingFollowUps = appointments
    .filter(a => a.type === 'Follow-up' && a.date >= todayStr && a.status !== 'Completed' && a.status !== 'Cancelled')
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 5);

  const filteredAppointments = appointments.filter(a => {
    // Date filter
    if (dateMode !== 'all' && a.date !== customDate) {
      return false;
    }
    // Type filter
    if (filterType !== 'All' && a.type !== filterType) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins'] flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-purple-400" /> OPD Appointments &amp; Token Manager
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time date-responsive OPD token queue management and doctor schedule dispatch.
          </p>
        </div>
        <button
          onClick={onOpenQuickAdd}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2"
        >
          <Ticket className="w-4 h-4" /> Issue Token
        </button>
      </div>

      {/* Date-Responsive Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Date Mode Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
            <CalendarCheck className="w-4 h-4 text-purple-400" /> Date Filter:
          </span>

          <label
            className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer overflow-hidden ${
              dateMode === 'date'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Click anywhere to select date"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-current shrink-0 pointer-events-none" />
            <span className="pointer-events-none">
              {customDate === todayStr ? `Today (${todayStr})` : customDate}
            </span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                if (e.target.value) {
                  setCustomDate(e.target.value);
                  setDateMode('date');
                }
              }}
              onClick={() => setDateMode('date')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </label>

          <button
            onClick={() => setDateMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              dateMode === 'all'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Scheduled ({appointments.length})
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-purple-400" /> Type:
          </span>
          {['All', 'OPD', 'Follow-up', 'Procedure', 'Emergency'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                filterType === cat
                  ? 'bg-purple-950 text-purple-200 border border-purple-500/60'
                  : 'bg-slate-950 border border-purple-900/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Recently Registered Patients</h2>
              <p className="text-[11px] text-slate-400">New patient records from this clinic</p>
            </div>
            <span className="text-[11px] font-semibold text-purple-300">{patients.length} total</span>
          </div>
          {recentPatients.length > 0 ? (
            <div className="space-y-2">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/60 border border-purple-900/20 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{patient.name}</p>
                    <p className="text-[10px] text-slate-400">{patient.registrationNumber} • {patient.department}</p>
                  </div>
                  <span className="text-[10px] text-emerald-300 whitespace-nowrap">{patient.registeredDate}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-slate-500">No registered patients yet.</p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Upcoming Follow-ups</h2>
              <p className="text-[11px] text-slate-400">Next scheduled visits for existing patients</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-300">{upcomingFollowUps.length} shown</span>
          </div>
          {upcomingFollowUps.length > 0 ? (
            <div className="space-y-2">
              {upcomingFollowUps.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => {
                    setCustomDate(appointment.date);
                    setDateMode('date');
                    setFilterType('Follow-up');
                  }}
                  className="w-full flex items-center justify-between gap-3 text-left rounded-xl bg-slate-950/60 border border-purple-900/20 px-3 py-2.5 hover:border-purple-500/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{appointment.patientName}</p>
                    <p className="text-[10px] text-purple-300">{appointment.doctorName} • {appointment.time}</p>
                  </div>
                  <span className="text-[10px] text-emerald-300 whitespace-nowrap">{appointment.date}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-slate-500">No upcoming follow-ups scheduled.</p>
          )}
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAppointments.map((apt) => (
          <div
            key={apt.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/40">
                  #{apt.tokenNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{apt.patientName}</h3>
                    {apt.type === 'Follow-up' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700">
                        Follow-Up
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-purple-300">
                    {apt.doctorName} • <span className="text-slate-400">{apt.department}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Date: <span className="text-purple-300 font-bold">{apt.date}</span> • {apt.time}
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                apt.status === 'In Consultation'
                  ? 'bg-purple-950 text-purple-200 border-purple-500/60 animate-pulse'
                  : apt.status === 'Completed'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {apt.status}
              </span>
            </div>

            {apt.notes && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-900/20 text-xs text-slate-300 italic">
                "{apt.notes}"
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                Type: {apt.type}
              </span>

              <div className="flex items-center gap-2">
                {apt.status !== 'In Consultation' && apt.status !== 'Completed' && (
                  <button
                    onClick={() => onUpdateAppointmentStatus(apt.id, 'In Consultation')}
                    className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-[#7C3AED] text-purple-200 hover:text-white text-xs font-semibold transition-colors border border-purple-500/40"
                  >
                    Call into OPD
                  </button>
                )}
                {apt.status === 'In Consultation' && (
                  <button
                    onClick={() => onUpdateAppointmentStatus(apt.id, 'Completed')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-700 text-emerald-200 hover:text-white text-xs font-semibold transition-colors border border-emerald-500/40"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-purple-900/30 space-y-2">
          <CalendarIcon className="w-10 h-10 text-purple-400/50 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">
            No active OPD appointments found for {dateMode === 'all' ? 'any scheduled date' : customDate}.
          </p>
          <p className="text-xs text-slate-500">
            Click "Issue Token" to schedule a patient appointment and add them to the queue for this date.
          </p>
        </div>
      )}
    </div>
  );
};
