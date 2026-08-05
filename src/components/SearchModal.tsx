import React, { useState, useMemo } from 'react';
import { Search, X, User, ArrowRight } from 'lucide-react';
import { Patient } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors?: any[];
  appointments?: any[];
  labTests?: any[];
  pharmacy?: any[];
  onSelectPatient: (patient: Patient) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSelectPatient
}) => {
  const [query, setQuery] = useState('');

  const filteredPatients = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return patients.filter(
      p => p.name.toLowerCase().includes(q) || 
           (p.registrationNumber && p.registrationNumber.toLowerCase().includes(q)) || 
           (p.uhid && p.uhid.toLowerCase().includes(q)) || 
           p.phone.includes(q) ||
           p.department.toLowerCase().includes(q)
    );
  }, [query, patients]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-purple-500/40 shadow-2xl overflow-hidden p-4 sm:p-5">
        
        {/* Upper Header Row with Title and Prominent Icon Close Button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white font-['Poppins']">Search Dental Patient Records</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-purple-500/30 hover:border-rose-700/60 transition-all flex items-center justify-center shrink-0 shadow-sm"
            title="Close Search Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-purple-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, Registration No. (e.g. REGD-1001), phone..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Patient Search Results */}
        <div className="mt-3 max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {!query.trim() ? (
            <div className="text-center py-6">
              <User className="w-6 h-6 text-purple-400/50 mx-auto mb-1.5" />
              <p className="text-xs text-slate-400">Type name or registration number to search dental records</p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {['Aarav', 'REGD-1001', 'REGD-1002', 'Root Canal'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/30 text-[10px] text-purple-300 hover:border-purple-500/50"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {filteredPatients.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1 px-1">
                    Matching Patient Profiles ({filteredPatients.length})
                  </div>
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPatient(p);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border border-purple-900/30 hover:border-purple-500/40 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                            {p.name} <span className="text-slate-400 font-normal">({p.gender}, {p.age}y)</span>
                          </div>
                          <div className="text-[10px] text-purple-300 font-mono">
                            Reg No: <strong className="text-purple-200">{p.registrationNumber || p.uhid}</strong> • {p.department}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No patient records found matching "{query}".
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 mt-2 border-t border-purple-900/30 flex items-center justify-between text-[10px] text-slate-500">
          <span>DentaPlus Patient Directory</span>
          <button 
            onClick={onClose} 
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
