import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  CalendarPlus,
  ArrowRight
} from 'lucide-react';
import { Patient } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenQuickAdd: () => void;
  onOpenFollowUp: (patient?: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onOpenQuickAdd,
  onOpenFollowUp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const dentalCategories = [
    'All', 
    'Endodontics', 
    'Orthodontics', 
    'Oral Surgery', 
    'Periodontics', 
    'Pediatric Dentistry', 
    'General Dentistry', 
    'Prosthodontics', 
    'Cosmetic Dentistry'
  ];

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.registrationNumber && p.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.uhid && p.uhid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.phone.includes(searchTerm);
    const matchesDept = selectedDepartment === 'All' || p.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins'] flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" /> Patients
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Dental patient records, manual hardcopy register numbers, treatment progress, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => onOpenFollowUp()}
            className="px-4 py-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-xs font-semibold shadow-lg shadow-purple-900/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <CalendarPlus className="w-4 h-4 text-purple-300" /> Next Follow-up
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> Register New Patient
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Registration No. (e.g. REGD-1001), Patient Name, or Phone..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-purple-900/40 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        {/* Dental Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {dentalCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedDepartment(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDepartment === cat
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/40'
                  : 'bg-slate-900 border border-purple-900/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-purple-900/30 hover:border-purple-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Top Row: Name & Registration Number */}
              <div className="flex items-start justify-between gap-3">
                <div 
                  onClick={() => onSelectPatient(patient)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/40">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {patient.name}
                    </h3>
                    <div className="text-[11px] font-mono font-bold text-purple-300">
                      Reg No: {patient.registrationNumber || patient.uhid}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {patient.gender}, {patient.age} Yrs • <span className="text-purple-200 font-semibold">{patient.bloodGroup}</span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                  patient.status === 'Active'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-purple-950 text-purple-300 border-purple-800'
                }`}>
                  {patient.status}
                </span>
              </div>

              {/* Dental Notes / Chief Complaint */}
              {patient.dentalNotes && (
                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs text-purple-200">
                  <span className="text-purple-400 font-semibold block text-[10px] uppercase">Dental Plan / Status:</span>
                  <p className="line-clamp-2 text-[11px] text-slate-300 mt-0.5">{patient.dentalNotes}</p>
                </div>
              )}

              {/* Vitals Ribbon */}
              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-950/60 border border-purple-900/20 text-center">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">BP</div>
                  <div className="text-xs font-bold text-white mt-0.5">{patient.vitals.bp}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Pulse</div>
                  <div className="text-xs font-bold text-white mt-0.5">{patient.vitals.pulse} bpm</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Specialty</div>
                  <div className="text-[10px] font-semibold text-purple-300 mt-0.5 truncate">{patient.department}</div>
                </div>
              </div>
            </div>

            {/* Bottom Row Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-purple-900/20 gap-2">
              <button
                onClick={() => onOpenFollowUp(patient)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                title="Register next follow-up for this patient"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-purple-300" /> Follow-Up
              </button>

              <button
                onClick={() => onSelectPatient(patient)}
                className="flex items-center text-purple-400 hover:text-purple-300 font-semibold text-[11px] group-hover:translate-x-1 transition-transform"
              >
                View EMR <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-purple-900/30">
          <Users className="w-10 h-10 text-purple-400/50 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">
            {patients.length === 0 ? 'No patient records registered yet for this clinic.' : 'No patient records match your search query.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {patients.length === 0 ? 'Click "Register New Patient" to create your first electronic dental record.' : 'Try searching by full patient name or Registration Number.'}
          </p>
        </div>
      )}
    </div>
  );
};
