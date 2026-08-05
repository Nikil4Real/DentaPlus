import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit, ShieldCheck, Clock, Award, Phone } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorToEdit?: Doctor | null;
  onSaveDoctor: (doctor: Doctor) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  doctorToEdit,
  onSaveDoctor
}) => {
  const isEditing = !!doctorToEdit;

  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('Endodontics');
  const [experienceYears, setExperienceYears] = useState('10');
  const [consultationFee, setConsultationFee] = useState('0');
  const [nmcNo, setNmcNo] = useState('NMC-D-1001');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 02:00 PM');
  const [phone, setPhone] = useState('+977 9841000000');
  const [status, setStatus] = useState<Doctor['status']>('Available');
  const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  useEffect(() => {
    if (doctorToEdit) {
      setName(doctorToEdit.name);
      setSpecialization(doctorToEdit.specialization);
      setDepartment(doctorToEdit.department);
      setExperienceYears(String(doctorToEdit.experienceYears));
      setConsultationFee(String(doctorToEdit.consultationFee));
      setNmcNo(doctorToEdit.nmcNo);
      setTimeSlot(doctorToEdit.timeSlot);
      setPhone(doctorToEdit.phone);
      setStatus(doctorToEdit.status);
      setAvailableDays(doctorToEdit.availableDays || ['Mon', 'Tue', 'Wed']);
    } else {
      setName('Dr. ');
      setSpecialization('Consultant Endodontist');
      setDepartment('Endodontics');
      setExperienceYears('8');
      setConsultationFee('0');
      setNmcNo('NMC-D-1234');
      setTimeSlot('09:00 AM - 02:00 PM');
      setPhone('+977 9841000000');
      setStatus('Available');
      setAvailableDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    }
  }, [doctorToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedDoc: Doctor = {
      id: doctorToEdit ? doctorToEdit.id : `DOC-${Date.now().toString().slice(-3)}`,
      name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
      specialization: specialization || 'General Dental Practitioner',
      department,
      experienceYears: Number(experienceYears) || 5,
      consultationFee: Number(consultationFee) || 0,
      nmcNo: nmcNo || 'NMC-D-0000',
      timeSlot: timeSlot || '09:00 AM - 02:00 PM',
      phone: phone || '+977 9800000000',
      status,
      availableDays: availableDays.length > 0 ? availableDays : ['Mon', 'Wed', 'Fri']
    };

    onSaveDoctor(savedDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0F172A] border border-purple-500/40 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              {isEditing ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Poppins']">
                {isEditing ? 'Edit Doctor Information' : 'Add New Dental Specialist'}
              </h3>
              <p className="text-xs text-purple-300">
                {isEditing ? `Update information for ${doctorToEdit?.name}` : 'Register new doctor profile with NMC registration number'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Doctor Name & NMC No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Doctor Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Sameer Joshi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-semibold text-xs focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">NMC Registration No. *</label>
              <input
                type="text"
                required
                value={nmcNo}
                onChange={(e) => setNmcNo(e.target.value)}
                placeholder="e.g. NMC-D-1824"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-purple-200 font-mono font-bold text-xs focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* Specialization & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Specialization Title *</label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Consultant Endodontist & Root Canal Specialist"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Specialty Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="Endodontics">Endodontics</option>
                <option value="Orthodontics">Orthodontics</option>
                <option value="Oral Surgery">Oral Surgery</option>
                <option value="Periodontics">Periodontics</option>
                <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                <option value="General Dentistry">General Dentistry</option>
                <option value="Prosthodontics">Prosthodontics</option>
                <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
              </select>
            </div>
          </div>

          {/* Experience Years, Consultation Fee, Phone */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Exp. Years</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Consult Fee (NPR)</label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="0 (Free)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-emerald-400 font-bold text-xs focus:outline-none focus:border-[#7C3AED]"
              />
              <span className="text-[10px] text-emerald-400/80 mt-0.5 block">0 = Free Consultation</span>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 98..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* Time Slot & Duty Hours */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Shift / Duty Time Slot *</label>
            <input
              type="text"
              required
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="e.g. 09:00 AM - 02:00 PM"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono text-xs focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* Status Selection (Including On Leave & Break Time with custom font colors) */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Doctor Status *</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'Available', label: 'Available', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60' },
                { id: 'In Procedure', label: 'In Procedure', color: 'text-amber-400 border-amber-800 bg-amber-950/60' },
                { id: 'On Leave', label: 'On Leave', color: 'text-rose-400 font-bold border-rose-800 bg-rose-950/80' },
                { id: 'Break Time', label: 'Break Time', color: 'text-purple-300 font-bold border-purple-600 bg-purple-950/80' },
                { id: 'Busy', label: 'Busy', color: 'text-orange-400 border-orange-800 bg-orange-950/60' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id as Doctor['status'])}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] transition-all text-center ${
                    status === st.id
                      ? `${st.color} ring-2 ring-purple-400`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Available Days */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Available OPD Days</label>
            <div className="flex flex-wrap gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all ${
                    availableDays.includes(day)
                      ? 'bg-[#7C3AED] text-white border-purple-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-purple-900/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white font-semibold shadow-lg shadow-purple-900/50"
            >
              {isEditing ? 'Save Changes' : 'Add Doctor'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
