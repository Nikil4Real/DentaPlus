import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  Activity, 
  HeartPulse, 
  FileText, 
  Scan, 
  Receipt, 
  AlertTriangle, 
  Plus, 
  CheckCircle2,
  FileCheck,
  Calendar,
  Clock,
  UserCheck,
  History,
  CalendarCheck,
  ArrowRight
} from 'lucide-react';
import { Patient, Prescription, DentalXRay, Invoice, Appointment } from '../types';

interface PatientDetailsModalProps {
  patient: Patient | null;
  onClose: () => void;
  prescriptions: Prescription[];
  labTests: DentalXRay[];
  invoices: Invoice[];
  appointments?: Appointment[];
  onOpenNewPrescription: (patient: Patient) => void;
  onOpenFollowUp?: (patient: Patient) => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  onClose,
  prescriptions,
  labTests,
  invoices,
  appointments = [],
  onOpenNewPrescription,
  onOpenFollowUp
}) => {
  const [activeTab, setActiveTab] = useState<'followups' | 'vitals' | 'prescriptions' | 'labs' | 'billing'>('followups');

  if (!patient) return null;

  const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id || p.patientName === patient.name);
  const patientLabTests = labTests.filter(l => l.patientId === patient.id || l.patientName === patient.name);
  const patientInvoices = invoices.filter(i => i.patientId === patient.id || i.patientName === patient.name);
  const patientAppointments = appointments.filter(a => a.patientId === patient.id || a.patientName === patient.name);

  // Find next follow up appointment
  const followUpAppointments = patientAppointments.filter(a => a.type === 'Follow-up' || a.status === 'Scheduled');
  const nextFollowUp = followUpAppointments.length > 0 ? followUpAppointments[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-[#0F172A] border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner Header */}
        <div className="p-6 bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border-b border-purple-900/40 relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-900/50 border border-purple-400/30">
                {patient.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white font-['Poppins']">{patient.name}</h2>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-purple-900/80 text-purple-200 border border-purple-500/30">
                    Reg No: {patient.registrationNumber || patient.uhid}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                  <span>{patient.gender}, {patient.age} Yrs</span>
                  <span>•</span>
                  <span>Blood Group: <strong className="text-purple-300 font-bold">{patient.bloodGroup}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong className="text-purple-200">{patient.department}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-purple-400" /> {patient.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-400" /> {patient.address}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenFollowUp && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenFollowUp(patient);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Next Follow-up
                </button>
              )}
              <button
                onClick={() => onOpenNewPrescription(patient)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Write Prescription
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Allergies Warning Bar */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="mt-4 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>
                <strong>Known Medical Allergies:</strong> {patient.allergies.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-900/30 bg-slate-900/60 px-6 gap-2 pt-2 overflow-x-auto">
          {[
            { id: 'followups', label: `Next Follow-Ups & History (${patientAppointments.length})`, icon: CalendarCheck },
            { id: 'vitals', label: 'Dental Notes & Vitals', icon: HeartPulse },
            { id: 'prescriptions', label: `Prescriptions (${patientPrescriptions.length})`, icon: FileText },
            { id: 'labs', label: `X-Ray Scans (${patientLabTests.length})`, icon: Scan },
            { id: 'billing', label: `Invoices (${patientInvoices.length})`, icon: Receipt },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-[#7C3AED] text-purple-300 bg-purple-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          
          {/* TAB 1: Next Follow-ups & History */}
          {activeTab === 'followups' && (
            <div className="space-y-6">
              
              {/* Next Scheduled Follow-up Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-purple-950/70 border border-purple-500/40 relative space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-900/60 text-purple-300 border border-purple-500/30">
                      <CalendarCheck className="w-5 h-5 text-purple-300" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Poppins']">Next Scheduled Follow-up Visit</h3>
                      <p className="text-[11px] text-purple-300">Upcoming recall appointment & treatment plan</p>
                    </div>
                  </div>

                  {onOpenFollowUp && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFollowUp(patient);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule Next Follow-up
                    </button>
                  )}
                </div>

                {nextFollowUp ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-purple-900/30 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Follow-Up Date</span>
                      <span className="font-bold text-emerald-400 text-sm flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {nextFollowUp.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Scheduled Time</span>
                      <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-purple-300" /> {nextFollowUp.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Attending Doctor</span>
                      <span className="font-semibold text-purple-200 flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" /> {nextFollowUp.doctorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Token / Status</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/40 mt-0.5">
                        Token #{nextFollowUp.tokenNumber} • {nextFollowUp.status}
                      </span>
                    </div>
                    {nextFollowUp.notes && (
                      <div className="sm:col-span-4 pt-2 border-t border-purple-900/30 text-slate-300 text-[11px]">
                        <strong className="text-purple-300">Procedure / Reason:</strong> {nextFollowUp.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-purple-900/40 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">No upcoming follow-up visit currently scheduled.</p>
                    <p className="text-[11px]">Click "Schedule Next Follow-up" to assign a return date &amp; procedure notes.</p>
                  </div>
                )}
              </div>

              {/* Complete Patient Appointment & Follow-Up History Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-purple-400 tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4" /> Patient Visit &amp; Follow-up History Timeline
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {patientAppointments.length} Total Visits Recorded
                  </span>
                </div>

                {patientAppointments.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/60 rounded-2xl border border-purple-900/30 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">No appointment history found for this patient profile.</p>
                    <p className="text-[11px]">Past consultations and scheduled follow-ups will appear chronologically here.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-900/40">
                    {patientAppointments.map((apt, idx) => {
                      const isFollowUp = apt.type === 'Follow-up';
                      return (
                        <div key={apt.id || idx} className="relative group">
                          {/* Timeline Node Dot */}
                          <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 ${
                            isFollowUp 
                              ? 'bg-purple-500 border-purple-300 shadow-glow' 
                              : 'bg-slate-700 border-slate-500'
                          }`} />

                          <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 hover:border-purple-500/40 transition-all space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                  isFollowUp ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {apt.type}
                                </span>
                                <span className="font-bold text-white">{apt.date} • {apt.time}</span>
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-900/30">
                                  Token #{apt.tokenNumber}
                                </span>
                              </div>

                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                apt.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                apt.status === 'In Consultation' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                                'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {apt.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Attending Specialist:</span>
                                <span className="font-semibold text-purple-200">{apt.doctorName} ({apt.department})</span>
                              </div>
                              {apt.notes && (
                                <div>
                                  <span className="text-[10px] text-slate-400 block">Clinical / Procedure Notes:</span>
                                  <span className="text-slate-200 font-medium">{apt.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="space-y-6">
              
              {/* Dental Chief Complaint & Treatment Notes */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs space-y-1">
                <span className="text-purple-300 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" /> Dental History &amp; Chief Complaint:
                </span>
                <p className="text-white text-sm font-medium mt-1">
                  {patient.dentalNotes || 'Standard dental hygiene checkup and oral prophylaxis.'}
                </p>
              </div>

              {/* Next Follow-Up Highlight Card inside Vitals */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 flex items-center justify-between flex-wrap gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-300" /> Next Scheduled Follow-up Visit:
                  </span>
                  {nextFollowUp ? (
                    <div className="text-slate-200 font-semibold mt-1">
                      <span className="text-emerald-400 font-bold">{nextFollowUp.date}</span> at {nextFollowUp.time} with <span className="text-purple-300">{nextFollowUp.doctorName}</span>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">{nextFollowUp.notes}</p>
                    </div>
                  ) : (
                    <div className="text-slate-400 mt-1">No upcoming follow-up scheduled.</div>
                  )}
                </div>

                {onOpenFollowUp && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFollowUp(patient);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1"
                  >
                    Schedule <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Vital Cards */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-purple-400 tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Patient Pre-Op Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-900/30">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Blood Pressure</div>
                    <div className="text-lg font-bold text-white mt-1">{patient.vitals.bp}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">mmHg (Optimal)</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-900/30">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Pulse Rate</div>
                    <div className="text-lg font-bold text-white mt-1">{patient.vitals.pulse} <span className="text-xs font-normal">bpm</span></div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Normal Rhythm</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-900/30">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">SpO2 Oxygen</div>
                    <div className="text-lg font-bold text-white mt-1">{patient.vitals.spo2}%</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Normal Level</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-900/30">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Body Temp</div>
                    <div className="text-lg font-bold text-white mt-1">{patient.vitals.temp}°F</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Afebrile</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-900/30">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Weight</div>
                    <div className="text-lg font-bold text-white mt-1">{patient.vitals.weight} <span className="text-xs font-normal">kg</span></div>
                    <div className="text-[10px] text-purple-300 mt-0.5">BMI ~ 22.4</div>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-purple-400 tracking-wider mb-2">
                  Past Dental Procedures &amp; History
                </h4>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 space-y-2">
                  {patient.medicalHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-3">
              {patientPrescriptions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No active prescriptions on file. Click "Write Prescription" above.
                </div>
              ) : (
                patientPrescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-purple-900/20">
                      <div>
                        <span className="text-xs font-bold text-white">Diagnosis: {rx.diagnosis}</span>
                        <div className="text-[10px] text-purple-300">Prescribed by {rx.doctorName} • {rx.date}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 font-mono">
                        {rx.id}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {rx.medicines.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/50">
                          <span className="font-semibold text-purple-200">{m.name}</span>
                          <span className="text-slate-300">{m.dosage} ({m.frequency}) — {m.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="space-y-3">
              {patientLabTests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No X-ray scan records attached for this patient.
                </div>
              ) : (
                patientLabTests.map((lab) => (
                  <div key={lab.id} className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{lab.xrayType} ({lab.toothNumber})</div>
                      <div className="text-[10px] text-slate-400">
                        Date: {lab.orderDate} • Doctor: Dr. {lab.doctorName}
                      </div>
                      {lab.findings && (
                        <div className="mt-1 text-xs text-purple-300 font-medium">
                          Findings: {lab.findings}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                      {lab.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-3">
              {patientInvoices.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No invoice statements generated yet.
                </div>
              ) : (
                patientInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">Date: {inv.date}</div>
                      <div className="text-xs font-bold text-purple-300 mt-1">Total: NPR {inv.total}</div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400">
          <span>DentaPlus Electronic Medical Record (EMR) System</span>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold">
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
