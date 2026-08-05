import React from 'react';
import { UserCheck, Clock, Award, FileCheck, Plus, Edit3, ChevronDown } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorsViewProps {
  doctors: Doctor[];
  onOpenAddDoctor: () => void;
  onEditDoctor: (doctor: Doctor) => void;
  onToggleDoctorStatus: (id: string, status?: Doctor['status']) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({ 
  doctors, 
  onOpenAddDoctor,
  onEditDoctor,
  onToggleDoctorStatus 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins'] flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-purple-400" /> Specialist Doctors Roster
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Dental clinic doctors, Nepal Medical Council (NMC) registration numbers, shift timings, and live duty status.
          </p>
        </div>

        <button
          onClick={onOpenAddDoctor}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2 self-start sm:self-auto hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => {
          // Status style mapper
          let statusStyle = 'bg-emerald-950 text-emerald-300 border-emerald-800';
          if (doc.status === 'In Procedure') {
            statusStyle = 'bg-amber-950 text-amber-300 border-amber-800';
          } else if (doc.status === 'On Leave') {
            statusStyle = 'bg-rose-950 text-rose-400 border-rose-800 font-bold'; // RED font
          } else if (doc.status === 'Break Time') {
            statusStyle = 'bg-purple-950 text-purple-300 border-purple-600 font-bold'; // PURPLE font
          } else if (doc.status === 'Busy') {
            statusStyle = 'bg-orange-950 text-orange-300 border-orange-800';
          }

          return (
            <div
              key={doc.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-4 hover:border-purple-500/50 transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Doctor Row */}
                <div className="flex items-start justify-between gap-2">
                  <div 
                    onClick={() => onEditDoctor(doc)}
                    className="flex items-center gap-3 cursor-pointer group/title flex-1"
                    title="Click to edit doctor details"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white text-xl font-bold flex items-center justify-center shadow-lg shadow-purple-900/40 shrink-0 group-hover/title:scale-105 transition-transform">
                      {doc.name.charAt(4) || doc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover/title:text-purple-300 transition-colors flex items-center gap-1.5">
                        {doc.name}
                        <Edit3 className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                      </h3>
                      <div className="text-xs text-purple-300 font-semibold">{doc.specialization}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{doc.department} • {doc.experienceYears} Yrs Exp.</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditDoctor(doc)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-900/60 text-slate-400 hover:text-purple-200 border border-purple-900/30 transition-all shrink-0"
                    title="Edit Doctor Info"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Timings, NMC No & Consultation Fee */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-purple-900/20 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <FileCheck className="w-3.5 h-3.5 text-purple-400" /> NMC Reg:
                    </span>
                    <span className="font-mono text-purple-200 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                      {doc.nmcNo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-purple-400" /> Shift Hours:
                    </span>
                    <span className="font-mono text-white font-semibold">{doc.timeSlot}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Award className="w-3.5 h-3.5 text-purple-400" /> Fee (NPR):
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {doc.consultationFee === 0 ? 'Free' : `NPR ${doc.consultationFee}`}
                    </span>
                  </div>
                </div>

                {/* Available Days Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <span
                      key={day}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        doc.availableDays.includes(day)
                          ? 'bg-purple-900/50 text-purple-200 border border-purple-500/40 font-semibold'
                          : 'bg-slate-950 text-slate-600'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Status Switcher */}
              <div className="flex items-center justify-between pt-3 border-t border-purple-900/20 mt-2">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle}`}>
                    {doc.status}
                  </span>
                </div>

                {/* Status Toggle Quick Dropdown */}
                <select
                  value={doc.status}
                  onChange={(e) => onToggleDoctorStatus(doc.id, e.target.value as Doctor['status'])}
                  className="bg-slate-800 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-xl border border-purple-500/30 focus:outline-none cursor-pointer hover:bg-slate-700"
                >
                  <option value="Available">Available</option>
                  <option value="In Procedure">In Procedure</option>
                  <option value="On Leave" className="text-rose-400 font-bold">On Leave</option>
                  <option value="Break Time" className="text-purple-400 font-bold">Break Time</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>

            </div>
          );
        })}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-purple-900/30">
          <UserCheck className="w-10 h-10 text-purple-400/50 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">No specialist doctors registered yet for this clinic.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Add Doctor" to add attending dental specialists and assign shift timings.</p>
        </div>
      )}
    </div>
  );
};
