import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Patient, Prescription } from '../types';

interface NewPrescriptionModalProps {
  patient: Patient | null;
  onClose: () => void;
  onAddPrescription: (prescription: Prescription) => void;
  doctorName?: string;
}

export const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
  patient,
  onClose,
  onAddPrescription,
  doctorName = 'Dr. Sameer Joshi'
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: '1-0-1 (After Meals)', duration: '5 days', instructions: 'Take with warm water' }
  ]);
  const [notes, setNotes] = useState('');

  if (!patient) return null;

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '3 days', instructions: '' }]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    (updated[index] as any)[field] = value;
    setMedicines(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) return;

    const newPrescription: Prescription = {
      id: `RX-${Date.now().toString().slice(-4)}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: 'DOC-1',
      doctorName,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      medicines: medicines.filter(m => m.name.trim() !== ''),
      notes
    };

    onAddPrescription(newPrescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#0F172A] border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Poppins']">Issue Electronic Prescription</h3>
              <p className="text-xs text-purple-300">Patient: {patient.name} ({patient.uhid})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Diagnosis *</label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Mild Hypertension & Upper Respiratory Tract Infection"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-purple-300">Prescribed Medications</label>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Drug
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-purple-900/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                      value={m.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/30 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (1 tab)"
                      value={m.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/30 text-white text-xs focus:outline-none"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(idx)}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Frequency (1-0-1)"
                      value={m.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/30 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={m.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/30 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={m.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/30 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Doctor Advice / Follow-up Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Drink plenty of fluids. Review after 5 days."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white text-xs focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-purple-900/30">
            <span className="text-[11px] text-purple-300 font-mono">Attending: {doctorName}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white text-xs font-semibold shadow-lg shadow-purple-900/50"
              >
                Sign & Dispatch Prescription
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
