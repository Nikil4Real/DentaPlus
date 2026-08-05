import React, { useState } from 'react';
import { FileImage, Plus, Image as ImageIcon, Eye, X, UploadCloud, CheckCircle2, Scan } from 'lucide-react';
import { DentalXRay, Patient } from '../types';

interface LabDiagnosticsViewProps {
  labTests: DentalXRay[];
  patients: Patient[];
  onAddXRay: (newXRay: DentalXRay) => void;
  onUpdateLabStatus?: (id: string, status: DentalXRay['status'], result?: string) => void;
}

export const LabDiagnosticsView: React.FC<LabDiagnosticsViewProps> = ({
  labTests,
  patients,
  onAddXRay
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewXRay, setPreviewXRay] = useState<DentalXRay | null>(null);

  // Form State for New X-Ray
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [xrayType, setXrayType] = useState<string>('Dental X-Ray (RVG)');
  const [toothNumber, setToothNumber] = useState('Tooth #36');
  const [findings, setFindings] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Sameer Joshi');
  const [urgent, setUrgent] = useState(false);
  
  // Image handling: support both file upload & preset selection
  const [attachedImageBase64, setAttachedImageBase64] = useState<string>('');
  const [sampleImageUrl, setSampleImageUrl] = useState('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80');

  const xrayTypes = ['All', 'Dental X-Ray (RVG)', 'Full Mouth (OPG)', 'Images', 'Periapical (IOPA)', 'Bitewing X-Ray', 'CBCT 3D Scan', 'Cephalometric'];

  const filteredXRays = labTests.filter(x => {
    if (selectedType === 'All') return true;
    return x.xrayType.toLowerCase().includes(selectedType.toLowerCase());
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateXRay = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === selectedPatientId);
    if (!patientObj) return;

    // Use attached base64 image if available, else preset sample
    const finalImageUrl = attachedImageBase64 || sampleImageUrl;

    const newRecord: DentalXRay = {
      id: `XRAY-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patientObj.id,
      patientName: patientObj.name,
      xrayType,
      toothNumber: toothNumber || 'General Dental Arch',
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      findings: findings || 'Digital radiograph attached and examined. Normal alveolar bone height.',
      doctorName,
      imageUrl: finalImageUrl,
      urgent
    };

    onAddXRay(newRecord);
    setShowAddModal(false);
    setFindings('');
    setAttachedImageBase64('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins'] flex items-center gap-3">
            <FileImage className="w-7 h-7 text-purple-400" /> Radiology & Patient X-Rays
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Dental X-Ray (RVG), Full Mouth (OPG) panoramic scans, radiograph image file attachments, and findings.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2 self-start sm:self-auto hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Patient X-Ray
        </button>
      </div>

      {/* Filter Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {xrayTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === type
                ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/40'
                : 'bg-slate-900 border border-purple-900/30 text-slate-400 hover:text-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* X-Ray Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredXRays.map((xray) => (
          <div
            key={xray.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 font-semibold">{xray.id}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {xray.patientName}
                  </h3>
                  <div className="text-xs text-purple-300 font-medium">{xray.xrayType} • <span className="text-amber-300 font-bold">{xray.toothNumber}</span></div>
                </div>

                {xray.urgent ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                    URGENT
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Validated
                  </span>
                )}
              </div>

              {/* Image Preview Box - Front End Display */}
              <div 
                onClick={() => setPreviewXRay(xray)}
                className="relative h-48 rounded-2xl bg-black/90 border border-purple-900/40 overflow-hidden cursor-pointer group/img shadow-inner"
              >
                {xray.imageUrl ? (
                  <img 
                    src={xray.imageUrl} 
                    alt={xray.xrayType}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">No X-Ray Image Preview</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5 bg-[#7C3AED]/90 px-3 py-1 rounded-xl shadow-lg">
                    <Eye className="w-3.5 h-3.5" /> Inspect Full Radiograph
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-purple-900/20 text-xs">
                <span className="text-purple-300 font-semibold text-[10px] uppercase block">Radiologist Findings:</span>
                <p className="text-slate-300 text-xs mt-0.5 line-clamp-3">{xray.findings || 'Radiograph examined; normal dental anatomy.'}</p>
              </div>
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-900/20 text-[11px] text-slate-400">
              <span>Dr. {xray.doctorName}</span>
              <span className="font-mono">{xray.orderDate}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredXRays.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-purple-900/30">
          <Scan className="w-10 h-10 text-purple-400/50 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">No digital X-ray records found for this clinic.</p>
          <p className="text-xs text-slate-500 mt-1">Upload a dental RVG or OPG radiograph to populate radiology records.</p>
        </div>
      )}

      {/* Add New X-Ray Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-purple-500/40 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Poppins']">
                <FileImage className="w-5 h-5 text-purple-400" /> Add Patient Dental X-Ray
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateXRay} className="space-y-4 text-xs">
              {/* Select Patient Name */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Patient Name *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.registrationNumber || p.uhid}) — {p.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Radiology Type & Tooth Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Radiology Type *</label>
                  <select
                    value={xrayType}
                    onChange={(e) => setXrayType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-semibold focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Dental X-Ray (RVG)">Dental X-Ray (RVG)</option>
                    <option value="Full Mouth (OPG)">Full Mouth (OPG)</option>
                    <option value="Images">Images</option>
                    <option value="Periapical (IOPA)">Periapical (IOPA)</option>
                    <option value="Bitewing X-Ray">Bitewing X-Ray</option>
                    <option value="CBCT 3D Scan">CBCT 3D Scan</option>
                    <option value="Cephalometric">Cephalometric</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tooth / Arch Location *</label>
                  <input
                    type="text"
                    value={toothNumber}
                    onChange={(e) => setToothNumber(e.target.value)}
                    placeholder="e.g. Tooth #36 or Upper Right"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                    required
                  />
                </div>
              </div>

              {/* File Attachment Section */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                <label className="text-purple-300 font-bold block text-xs flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-purple-400" /> Attach X-Ray Image File *
                </label>
                
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#7C3AED] file:text-white hover:file:bg-[#6D28D9] cursor-pointer"
                  />
                </div>

                {attachedImageBase64 ? (
                  <div className="mt-2 relative h-28 rounded-xl overflow-hidden border border-purple-500/50">
                    <img src={attachedImageBase64} alt="Attached Preview" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-emerald-950/90 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Custom Image Attached
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] text-slate-400 block my-1">Or pick a standard preset image URL:</span>
                    <select
                      value={sampleImageUrl}
                      onChange={(e) => setSampleImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-slate-300 text-xs focus:outline-none"
                    >
                      <option value="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80">Dental X-Ray (RVG) Tooth #36</option>
                      <option value="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80">Full Mouth (OPG) Panoramic Scan</option>
                      <option value="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80">Dental Intraoral Camera Image</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Radiologist Findings / Notes:</label>
                <textarea
                  rows={2}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Enter detailed radiolucency, root canal anatomy, or bone findings..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentFlag"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="rounded bg-slate-900 border-purple-900 text-[#7C3AED]"
                />
                <label htmlFor="urgentFlag" className="text-slate-300 font-medium">Mark as High Priority / Urgent Case</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white font-semibold shadow-lg shadow-purple-900/40"
                >
                  Save X-Ray Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* X-Ray Image Inspector Modal */}
      {previewXRay && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-purple-500/40 rounded-3xl p-6 w-full max-w-3xl space-y-4 shadow-2xl relative animate-in zoom-in-95">
            <button 
              onClick={() => setPreviewXRay(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-purple-900/30 pb-3">
              <span className="text-xs font-mono text-purple-400">Radiograph Inspection Viewer</span>
              <h2 className="text-xl font-bold text-white">{previewXRay.patientName} — {previewXRay.xrayType}</h2>
              <p className="text-xs text-purple-300">{previewXRay.toothNumber} • Date: {previewXRay.orderDate}</p>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-black border border-purple-900/40 flex items-center justify-center p-2">
              <img 
                src={previewXRay.imageUrl} 
                alt={previewXRay.xrayType}
                className="max-h-[55vh] object-contain rounded-xl" 
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/30 text-xs">
              <span className="text-purple-400 font-semibold uppercase text-[10px] block">Validated Radiologist Report:</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{previewXRay.findings}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
