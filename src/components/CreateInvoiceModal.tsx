import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, Receipt, User, DollarSign, Calculator, CheckCircle2, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { Patient, Doctor, Invoice, InvoiceItem } from '../types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  onAddInvoice: (invoice: Invoice) => void;
}

// Preset popular dental procedures with default NPR rates
const DENTAL_PROCEDURES_PRESETS = [
  { name: 'Dental Consultation & OPD Fee (Free)', rate: 0, category: 'General' },
  { name: 'Ultrasonic Scaling & Polishing', rate: 2000, category: 'Preventive' },
  { name: 'Root Canal Treatment (RCT - Anterior)', rate: 4500, category: 'Endodontics' },
  { name: 'Root Canal Treatment (RCT - Posterior)', rate: 6500, category: 'Endodontics' },
  { name: 'Light Cure Composite Tooth Filling', rate: 1500, category: 'Restorative' },
  { name: 'Simple Tooth Extraction', rate: 1200, category: 'Oral Surgery' },
  { name: 'Surgical Wisdom Tooth Removal', rate: 8500, category: 'Oral Surgery' },
  { name: 'Dental X-Ray (RVG Digital)', rate: 400, category: 'Radiology' },
  { name: 'Full Mouth OPG Panoramic Scan', rate: 1500, category: 'Radiology' },
  { name: 'Metal Ceramic Crown / Tooth Cap', rate: 7000, category: 'Prosthodontics' },
  { name: 'Zirconia All-Ceramic Crown', rate: 14000, category: 'Prosthodontics' },
  { name: 'Orthodontic Braces Monthly Adjustment', rate: 2500, category: 'Orthodontics' },
  { name: 'Teeth Whitening / Bleaching', rate: 8000, category: 'Cosmetic' },
  { name: 'Fluoride Varnish Application', rate: 1000, category: 'Pediatric' }
];

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  onAddInvoice
}) => {
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [panNumber, setPanNumber] = useState('609823412');
  const [paymentStatus, setPaymentStatus] = useState<Invoice['paymentStatus']>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('Cash');

  // Itemized Procedures State
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Dental Consultation & OPD Fee (Free)', quantity: 1, rate: 0, amount: 0 }
  ]);

  // Financial Adjustment State
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Auto-generate invoice number when modal opens or patient changes
  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const year = new Date().getFullYear();
      setInvoiceNumber(`INV-${year}-${randomNum}`);
      setDiscountAmount(0);
      setPartialPaymentAmount(0);
      setNotes('');
      if (patients.length > 0 && !selectedPatient) {
        setSelectedPatient(patients[0]);
        setSelectedDoctorName(patients[0]?.assignedDoctor || doctors[0]?.name || 'Dr. Sameer Joshi');
      }
    }
  }, [isOpen]);

  // Sync doctor when patient changes
  useEffect(() => {
    if (selectedPatient) {
      if (selectedPatient.assignedDoctor) {
        setSelectedDoctorName(selectedPatient.assignedDoctor);
      } else if (doctors.length > 0) {
        setSelectedDoctorName(doctors[0]?.name || 'Dr. Sameer Joshi');
      }
    }
  }, [selectedPatient]);

  if (!isOpen) return null;

  // Filter patients by search term
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.registrationNumber && p.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.uhid && p.uhid.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.phone.includes(searchTerm)
  );

  // Item handlers
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { description: 'Ultrasonic Scaling & Polishing', quantity: 1, rate: 2000, amount: 2000 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return; // Keep at least one line item
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // Check if user selected a standard procedure preset
      if (field === 'description') {
        const preset = DENTAL_PROCEDURES_PRESETS.find(p => p.name === value);
        if (preset) {
          item.rate = preset.rate;
        }
      }

      // Auto recalculate amount = quantity * rate
      const qty = Number(item.quantity) || 1;
      const rate = Number(item.rate) || 0;
      item.amount = qty * rate;

      updated[index] = item;
      return updated;
    });
  };

  // Subtotal, Discount & Net Total Calculation
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalAmount = Math.max(0, subtotal - (Number(discountAmount) || 0));

  // Determine Paid & Due Amounts based on Status
  let paidAmount = totalAmount;
  let dueAmount = 0;

  if (paymentStatus === 'Pending') {
    paidAmount = 0;
    dueAmount = totalAmount;
  } else if (paymentStatus === 'Partial') {
    paidAmount = Math.min(totalAmount, Math.max(0, Number(partialPaymentAmount) || 0));
    dueAmount = Math.max(0, totalAmount - paidAmount);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newInvoice: Invoice = {
      id: `INV-ID-${Date.now()}`,
      invoiceNumber,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      doctorName: selectedDoctorName || 'Dr. Sameer Joshi',
      date: invoiceDate,
      items,
      subtotal,
      discount: discountAmount || 0,
      tax: 0, // No VAT - PAN Registered Only
      total: totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentMethod,
      panNumber: panNumber || '609823412'
    };

    onAddInvoice(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-purple-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border-b border-purple-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Poppins']">Create Patient Tax Invoice / Receipt</h2>
              <p className="text-xs text-purple-300">Search patient, select dental procedures, and generate an official clinic bill</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* STEP 1: PATIENT SEARCH & AUTO EXTRACTED INFO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" /> Patient Verification & Search
              </h3>
              <span className="text-[10px] text-purple-300 font-mono">Reg No / ID Lookup</span>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient by name, Reg No. (e.g. REGD-1001) or phone number..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] text-xs font-semibold"
              />

              {/* Instant Search Suggestions Dropdown */}
              {searchTerm && filteredPatients.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-900 border border-purple-500/40 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-purple-900/20">
                  {filteredPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setSearchTerm('');
                      }}
                      className="p-3 hover:bg-purple-950/60 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white block">{p.name}</span>
                        <span className="text-[10px] text-purple-300">
                          {p.registrationNumber || p.uhid} • {p.gender}, {p.age} Yrs • {p.phone}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        {p.department}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Patient Info Card */}
            {selectedPatient ? (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-purple-400 block uppercase">Selected Patient:</span>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedPatient.name}</div>
                  <div className="text-[11px] text-slate-300">Reg No: <strong className="text-purple-200 font-mono">{selectedPatient.registrationNumber || selectedPatient.uhid}</strong></div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-purple-400 block uppercase">Demographics & Contact:</span>
                  <div className="text-[11px] text-slate-200">{selectedPatient.gender}, {selectedPatient.age} Yrs • Blood Group: <strong className="text-rose-400">{selectedPatient.bloodGroup}</strong></div>
                  <div className="text-[11px] text-slate-300">Phone: {selectedPatient.phone}</div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-purple-400 block uppercase">Department & Doctor:</span>
                  <div className="text-[11px] text-slate-200">{selectedPatient.department}</div>
                  <div className="text-[11px] text-slate-300">Assigned: <strong className="text-emerald-300">{selectedPatient.assignedDoctor || 'General Practitioner'}</strong></div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center text-slate-400 text-xs">
                No patient selected. Type in search bar above or select from dropdown.
              </div>
            )}
          </div>

          {/* STEP 2: INVOICE METADATA & CLINIC DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Invoice Number *</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono font-bold focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Invoice Date *</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Attending Doctor / Specialist</label>
              <select
                value={selectedDoctorName}
                onChange={(e) => setSelectedDoctorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-semibold focus:outline-none focus:border-[#7C3AED]"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Clinic PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="609823412"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* STEP 3: ITEMIZED DENTAL PROCEDURES */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-400" /> Itemized Dental Procedures & Fees
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-slate-900/90 border border-purple-900/30">
                  
                  {/* Select Preset or Custom Description */}
                  <div className="col-span-12 sm:col-span-6">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Procedure Description</label>
                    <input
                      type="text"
                      list={`procedures-list-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="e.g. Ultrasonic Scaling or Root Canal"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                      required
                    />
                    <datalist id={`procedures-list-${index}`}>
                      {DENTAL_PROCEDURES_PRESETS.map((p, i) => (
                        <option key={i} value={p.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-purple-900/40 text-white text-center focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  {/* Unit Rate (NPR) */}
                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Rate (NPR)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.rate || 0}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-purple-900/40 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  {/* Item Total Amount & Delete button */}
                  <div className="col-span-4 sm:col-span-2 flex items-center justify-between gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-900/20">
                    <div>
                      <span className="text-[10px] text-slate-400 block sm:hidden">Item Total</span>
                      <span className="font-mono font-bold text-purple-200">NPR {item.amount.toLocaleString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* STEP 4: FINANCIAL SUMMARY & SETTLEMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Payment Settlement Methods */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-3">
              <h4 className="font-bold text-white text-xs">Payment Settlement & Status</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as Invoice['paymentStatus'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-semibold focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Paid">Paid (Full Settlement)</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Pending">Pending (Unpaid)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Invoice['paymentMethod'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-semibold focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Fonepay">Fonepay QR</option>
                    <option value="eSewa">eSewa Wallet</option>
                    <option value="Khalti">Khalti Wallet</option>
                    <option value="Card">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              {/* PARTIAL PAYMENT INPUT FIELD */}
              {paymentStatus === 'Partial' && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-amber-300 font-bold text-xs">Partial Paid Amount (NPR) *</label>
                    <span className="text-[10px] text-amber-200">
                      Balance Due: <strong className="font-mono text-amber-300 font-bold">NPR {dueAmount.toLocaleString()}</strong>
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={partialPaymentAmount || ''}
                    onChange={(e) => setPartialPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder={`Enter amount paid (e.g. ${Math.round(totalAmount / 2)})`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-100 font-mono font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Treatment Remarks / Receipt Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Remaining balance due on crown placement day"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2.5">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Procedure Amount:</span>
                <span className="font-mono font-bold">NPR {subtotal.toLocaleString()}</span>
              </div>

              {/* Discount Amount in NPR */}
              <div className="flex items-center justify-between text-slate-300">
                <span>Discount / Concession (NPR):</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-xs font-mono">- NPR</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-24 px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-900/40 text-white font-mono font-bold text-right focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* PAN Registered (Non-VAT) indicator */}
              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                <span className="flex items-center gap-1 text-purple-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> PAN Registered (Non-VAT Business)
                </span>
                <span className="font-mono text-slate-500">NPR 0</span>
              </div>

              {/* Total Payable */}
              <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-purple-800/40">
                <span>Total Net Amount:</span>
                <span className="text-purple-300 text-lg font-mono">NPR {totalAmount.toLocaleString()}</span>
              </div>

              {/* Partial Payment Breakdown */}
              {paymentStatus === 'Partial' && (
                <div className="pt-2 border-t border-purple-800/30 space-y-1">
                  <div className="flex justify-between text-xs text-emerald-300">
                    <span>Paid Amount (Advance):</span>
                    <span className="font-mono font-bold">NPR {paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-300 font-bold">
                    <span>Remaining Balance Due:</span>
                    <span className="font-mono">NPR {dueAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPatient}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-bold shadow-lg shadow-purple-900/50 flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Issue Official Tax Invoice
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
