import React, { useState, useEffect } from 'react';
import { X, Calendar, Search, UserCheck, Shield, CheckCircle2, User } from 'lucide-react';
import { Patient, Doctor, Appointment } from '../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  initialPatient?: Patient | null;
  onAddAppointment: (appointment: Appointment) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  initialPatient,
  onAddAppointment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('11:00 AM');
  const [procedureNotes, setProcedureNotes] = useState('Next follow-up procedure evaluation.');

  // Set initial selected patient or default
  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
      const doc = doctors.find(d => d.name.includes((initialPatient.assignedDoctor || '').split(' ')[1] || '')) || doctors[0];
      if (doc) setSelectedDoctorId(doc.id);
    } else if (patients.length > 0) {
      setSelectedPatient(patients[0]);
      if (doctors.length > 0) setSelectedDoctorId(doctors[0].id);
    }
  }, [initialPatient, patients, doctors, isOpen]);

  // Set default follow up date to 7 days from today
  useEffect(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFollowUpDate(nextWeek.toISOString().split('T')[0]);
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
           (p.registrationNumber && p.registrationNumber.toLowerCase().includes(q)) ||
           p.phone.includes(q) ||
           p.department.toLowerCase().includes(q);
  });

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    // Auto fill assigned doctor matching patient department/doctor
    const matchedDoc = doctors.find(d => (patient.assignedDoctor || '').includes(d.name)) || doctors[0];
    if (matchedDoc) {
      setSelectedDoctorId(matchedDoc.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const doctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

    const newAppointment: Appointment = {
      id: `APT-FLW-${Date.now().toString().slice(-3)}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: doctor?.id || 'DOC-GENERIC',
      doctorName: doctor?.name || selectedPatient.assignedDoctor || 'Attending Doctor',
      department: selectedPatient.department || doctor?.department || 'General Dentistry',
      date: followUpDate || new Date().toISOString().split('T')[0],
      time: followUpTime || '11:00 AM',
      tokenNumber: Math.floor(Math.random() * 15) + 1,
      status: 'Scheduled',
      type: 'Follow-up',
      notes: procedureNotes || 'Follow-up registration for existing patient.'
    };

    onAddAppointment(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0F172A] border border-purple-500/40 shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Poppins']">Register Next Follow-up</h3>
              <p className="text-xs text-purple-300">Schedule next visit appointment for an existing patient</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Auto-Search Selection Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">
            1. Search & Select Existing Patient *
          </label>
          
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type patient name, Registration No. (e.g. REGD-1001) or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* Quick patient selector list when searching */}
          {searchQuery.trim() && (
            <div className="max-h-36 overflow-y-auto bg-slate-900/90 border border-purple-500/30 rounded-xl p-1.5 space-y-1">
              {filteredPatients.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPatient(p)}
                  className="w-full text-left p-2 rounded-lg hover:bg-purple-950/60 flex items-center justify-between text-xs text-white"
                >
                  <div>
                    <span className="font-bold">{p.name}</span>
                    <span className="text-[10px] text-purple-300 ml-2 font-mono">
                      ({p.registrationNumber || p.uhid})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{p.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auto-Filled Patient Information Box */}
        {selectedPatient ? (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Auto-Filled Patient Profile
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-500/30">
                Reg No: {selectedPatient.registrationNumber || selectedPatient.uhid}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Patient Name:</span>
                <span className="font-bold text-white">{selectedPatient.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Age & Gender:</span>
                <span className="font-semibold text-slate-200">{selectedPatient.gender}, {selectedPatient.age} Yrs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Phone Number:</span>
                <span className="font-mono text-purple-300">{selectedPatient.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Specialty Dept:</span>
                <span className="font-semibold text-purple-200">{selectedPatient.department}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 block">Assigned Doctor:</span>
                <span className="font-semibold text-emerald-400">{selectedPatient.assignedDoctor}</span>
              </div>
            </div>

            {selectedPatient.dentalNotes && (
              <div className="text-[11px] text-slate-300 bg-slate-950/50 p-2 rounded-xl border border-purple-900/20 mt-1">
                <strong className="text-purple-400">Treatment Plan:</strong> {selectedPatient.dentalNotes}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-dashed border-purple-900/40 text-center text-xs text-slate-400">
            Please search and select a patient above to auto-fill details.
          </div>
        )}

        {/* Follow-up Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-Up Date *</label>
              <input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Time *</label>
              <select
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Attending Doctor *</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization}) — Status: {d.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-Up Procedure / Reason</label>
            <input
              type="text"
              value={procedureNotes}
              onChange={(e) => setProcedureNotes(e.target.value)}
              placeholder="e.g. Suture removal, wire adjustment, obturation check, crown placement"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPatient}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-900/50 disabled:opacity-50"
            >
              Register Follow-Up
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
