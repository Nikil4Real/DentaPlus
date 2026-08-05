import React, { useState } from 'react';
import { X, UserPlus, Calendar, Plus, Shield } from 'lucide-react';
import { Patient, Doctor, Appointment } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onAddPatient: (patient: Patient) => void;
  onAddAppointment: (appointment: Appointment) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onAddPatient,
  onAddAppointment
}) => {
  const [tab, setTab] = useState<'patient' | 'token'>('patient');

  // Patient Form State
  const [patientName, setPatientName] = useState('');
  const [regNumberDigits, setRegNumberDigits] = useState('1006');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [department, setDepartment] = useState('Endodontics');
  const [address, setAddress] = useState('Kathmandu, Nepal');
  const [dentalNotes, setDentalNotes] = useState('');

  // Token Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [tokenPatientName, setTokenPatientName] = useState('');
  const [appointmentType, setAppointmentType] = useState<'OPD' | 'Follow-up' | 'Procedure'>('OPD');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const fullRegNo = `REGD-${regNumberDigits.trim() || '0000'}`;

    const newPatient: Patient = {
      id: `P-${Date.now().toString().slice(-3)}`,
      registrationNumber: fullRegNo,
      uhid: fullRegNo,
      name: patientName,
      age: Number(age) || 28,
      gender,
      phone: phone || '+977 9800000000',
      email: `${patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      bloodGroup,
      address,
      registeredDate: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'Active',
      assignedDoctor: doctors[0]?.name || 'Dr. Sameer Joshi',
      department,
      allergies: ['None Reported'],
      vitals: { bp: '120/80', pulse: 75, spo2: 98, temp: 98.6, weight: 65 },
      dentalNotes: dentalNotes || 'Initial Dental Consultation Registration',
      medicalHistory: ['Dental Registration Checkup']
    };

    onAddPatient(newPatient);
    onClose();
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenPatientName.trim()) return;

    const doctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

    const newAppointment: Appointment = {
      id: `APT-${Date.now().toString().slice(-3)}`,
      patientId: `P-${Math.floor(100 + Math.random() * 900)}`,
      patientName: tokenPatientName,
      doctorId: doctor?.id || 'DOC-GENERIC',
      doctorName: doctor?.name || 'Attending Doctor',
      department: doctor?.department || 'General Dentistry',
      date: appointmentDate || new Date().toISOString().split('T')[0],
      time: '10:30 AM',
      tokenNumber: Math.floor(Math.random() * 20) + 1,
      status: 'Scheduled',
      type: appointmentType,
      notes: 'Dental token issued at reception.'
    };

    onAddAppointment(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0F172A] border border-purple-500/30 shadow-2xl overflow-hidden p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Poppins']">Quick Dental Intake</h3>
              <p className="text-xs text-purple-300">Register dental EMR profile or issue immediate OPD token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 my-4 rounded-xl bg-slate-900 border border-purple-900/40">
          <button
            onClick={() => setTab('patient')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'patient'
                ? 'bg-[#7C3AED] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register Dental Patient
          </button>
          <button
            onClick={() => setTab('token')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'token'
                ? 'bg-[#7C3AED] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Issue OPD Token
          </button>
        </div>

        {/* Form Body */}
        {tab === 'patient' ? (
          <form onSubmit={handlePatientSubmit} className="space-y-4">
            
            {/* Registration Number & Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registration No. *
                </label>
                <div className="flex items-center">
                  <span className="px-2.5 py-2.5 bg-slate-800 border border-purple-900/40 text-purple-300 font-mono font-bold text-xs rounded-l-xl border-r-0 select-none">
                    REGD-
                  </span>
                  <input
                    type="text"
                    required
                    value={regNumberDigits}
                    onChange={(e) => setRegNumberDigits(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0001"
                    maxLength={6}
                    className="w-full px-2.5 py-2.5 rounded-r-xl bg-slate-900 border border-purple-900/40 focus:border-[#7C3AED] text-white font-mono font-bold text-xs focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Matches hardcopy register</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Aarav Shrestha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 focus:border-[#7C3AED] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age (Years) *</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 focus:border-[#7C3AED] text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-sm focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977 98..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dental Specialty</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-sm focus:outline-none"
                >
                  <option value="Endodontics">Endodontics (Root Canal)</option>
                  <option value="Orthodontics">Orthodontics (Braces)</option>
                  <option value="Oral Surgery">Oral Surgery (Disimpaction)</option>
                  <option value="Periodontics">Periodontics (Scaling/Gums)</option>
                  <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                  <option value="General Dentistry">General Dentistry</option>
                  <option value="Prosthodontics">Prosthodontics (Crowns)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Chief Dental Complaint / Tooth # Notes</label>
              <input
                type="text"
                value={dentalNotes}
                onChange={(e) => setDentalNotes(e.target.value)}
                placeholder="e.g. Tooth sensitivity #36, bleeding gums, braces consultation"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-sm focus:outline-none"
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-semibold shadow-lg shadow-purple-900/50"
              >
                Save Dental Profile
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={tokenPatientName}
                onChange={(e) => setTokenPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Appointment / Visit Date *</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Dental Doctor *</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-sm focus:outline-none"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} (NMC: {d.nmcNo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Visit Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['OPD', 'Follow-up', 'Procedure'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAppointmentType(t)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      appointmentType === t
                        ? 'bg-[#7C3AED]/30 border-[#7C3AED] text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs text-purple-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Token dispatched to Reception Token Display and Dental Chair Workstation.</span>
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-semibold shadow-lg shadow-purple-900/50"
              >
                Issue Token
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
