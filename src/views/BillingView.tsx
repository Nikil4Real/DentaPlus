import React, { useState } from 'react';
import { CreditCard, Receipt, Printer, Plus, Search, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Invoice, Patient, Doctor } from '../types';
import { CreateInvoiceModal } from '../components/CreateInvoiceModal';

interface BillingViewProps {
  invoices: Invoice[];
  patients: Patient[];
  doctors: Doctor[];
  onMarkPaid: (id: string, method: Invoice['paymentMethod']) => void;
  onAddInvoice: (invoice: Invoice) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ 
  invoices, 
  patients, 
  doctors, 
  onMarkPaid, 
  onAddInvoice 
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.patientName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
    (inv.patientPhone && inv.patientPhone.includes(invoiceSearchQuery))
  );

  const handleAddNewInvoice = (newInvoice: Invoice) => {
    onAddInvoice(newInvoice);
    setSelectedInvoice(newInvoice);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30 print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins'] flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-purple-400" /> Dental Billing & Official Receipts
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Itemized dental procedures, tax receipts, PAN verification, digital wallets, and print-ready invoices.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-bold shadow-lg shadow-purple-900/40 flex items-center gap-2 self-start sm:self-auto hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" /> Create Patient Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoices List (1 col) - Hidden on Print */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-3 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-400" /> Clinic Receipts ({invoices.length})
            </h3>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Bill
            </button>
          </div>

          {/* Search Receipts */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={invoiceSearchQuery}
              onChange={(e) => setInvoiceSearchQuery(e.target.value)}
              placeholder="Search by invoice # or patient..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-purple-900/40 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    selectedInvoice?.id === inv.id
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white shadow-md'
                      : 'bg-slate-950/60 border-purple-900/20 hover:border-purple-500/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">{inv.invoiceNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-purple-200 mt-1">{inv.patientName}</div>
                  <div className="flex items-center justify-between text-xs font-bold text-white mt-1 pt-1 border-t border-purple-900/20">
                    <span className="text-[10px] text-slate-400 font-normal">{inv.date}</span>
                    <span className="font-mono">NPR {inv.total.toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                No matching receipts found.
              </div>
            )}
          </div>
        </div>

        {/* Invoice Statement Inspector (2 cols) */}
        {selectedInvoice ? (
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-6 print:bg-white print:text-slate-900 print:border-none print:p-0 print:m-0 print:col-span-3">
            
            {/* Print Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/30 print:hidden">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Business PAN: {selectedInvoice.panNumber || '609823412'}
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Printer className="w-4 h-4" /> Print Official Bill
              </button>
            </div>

            {/* Print Header Block */}
            <div className="border-b pb-4 print:border-slate-300 border-purple-900/30">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-['Poppins'] text-white print:text-black">
                    DentaPlus Care &amp; Implant Center
                  </h1>
                  <p className="text-xs text-slate-300 print:text-slate-600 mt-1">
                    Lazimpat-02, Kathmandu, Nepal • Regd. PAN No: 609823412
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-500">
                    Phone: +977 01-4420999 | Email: billing@dentaplus.com
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <div className="text-xs font-mono font-bold text-purple-400 print:text-purple-800">OFFICIAL RECEIPT / BILL</div>
                  <div className="text-lg font-bold text-white print:text-black mt-0.5">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-slate-400 print:text-slate-600">Date: {selectedInvoice.date}</div>
                </div>
              </div>
            </div>

            {/* Patient & Doctor Info Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 print:bg-slate-100 border border-purple-900/20 print:border-slate-300 text-xs">
              <div>
                <span className="text-purple-400 print:text-slate-500 font-semibold text-[10px] uppercase block">Patient Details:</span>
                <div className="font-bold text-white print:text-black text-sm mt-0.5">{selectedInvoice.patientName}</div>
                <div className="text-slate-300 print:text-slate-700">{selectedInvoice.patientGender || 'Male'}, {selectedInvoice.patientAge || 34} Yrs • ID: {selectedInvoice.patientId}</div>
                <div className="text-slate-400 print:text-slate-600">{selectedInvoice.patientPhone || '+977 9841234567'}</div>
              </div>

              <div>
                <span className="text-purple-400 print:text-slate-500 font-semibold text-[10px] uppercase block">Attending Specialist:</span>
                <div className="font-bold text-white print:text-black text-sm mt-0.5">{selectedInvoice.doctorName || 'Dr. Sameer Joshi (Endodontist)'}</div>
                <div className="text-slate-300 print:text-slate-700">
                  Payment Status: <strong className={`px-2 py-0.5 rounded text-[11px] ${
                    selectedInvoice.paymentStatus === 'Paid' ? 'text-emerald-400 print:text-emerald-700 font-bold' : 
                    selectedInvoice.paymentStatus === 'Partial' ? 'text-amber-400 print:text-amber-700 font-bold' : 'text-rose-400 print:text-rose-700 font-bold'
                  }`}>{selectedInvoice.paymentStatus}</strong>
                </div>
                {selectedInvoice.paymentMethod && (
                  <div className="text-slate-400 print:text-slate-600">Method: {selectedInvoice.paymentMethod}</div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-purple-300 print:text-slate-700 uppercase tracking-wider">Itemized Dental Procedures</div>
              <div className="rounded-2xl bg-slate-950/60 print:bg-white border border-purple-900/20 print:border-slate-300 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-950/40 print:bg-slate-200 text-purple-200 print:text-slate-800 font-semibold border-b border-purple-900/30 print:border-slate-300">
                    <tr>
                      <th className="p-3">SN</th>
                      <th className="p-3">Procedure Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Rate (NPR)</th>
                      <th className="p-3 text-right">Total (NPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20 print:divide-slate-200">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="text-slate-200 print:text-slate-800">
                        <td className="p-3 font-mono">{idx + 1}</td>
                        <td className="p-3 font-medium">{item.description}</td>
                        <td className="p-3 text-center">{item.quantity || 1}</td>
                        <td className="p-3 text-right font-mono">{item.rate ? item.rate.toLocaleString() : item.amount.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-white print:text-black font-mono">{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="p-4 rounded-2xl bg-purple-950/30 print:bg-slate-100 border border-purple-800/30 print:border-slate-300 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300 print:text-slate-700">
                <span>Subtotal Amount:</span>
                <span className="font-mono font-semibold">NPR {selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300 print:text-slate-700">
                <span>Discount Allowed:</span>
                <span className="text-emerald-400 print:text-emerald-700 font-mono font-semibold">- NPR {selectedInvoice.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white print:text-black pt-2 border-t border-purple-800/40 print:border-slate-300">
                <span>Total Net Amount:</span>
                <span className="text-purple-300 print:text-black text-base font-mono">NPR {selectedInvoice.total.toLocaleString()}</span>
              </div>

              {/* Partial / Paid / Due Breakdown */}
              {(selectedInvoice.paidAmount !== undefined || selectedInvoice.paymentStatus === 'Partial') && (
                <div className="pt-2 border-t border-purple-800/30 print:border-slate-300 space-y-1">
                  <div className="flex justify-between text-xs text-emerald-300 print:text-emerald-700">
                    <span>Paid Amount (Advance/Settled):</span>
                    <span className="font-mono font-bold">NPR {(selectedInvoice.paidAmount ?? (selectedInvoice.paymentStatus === 'Paid' ? selectedInvoice.total : 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-300 print:text-amber-800 font-bold">
                    <span>Remaining Balance Due:</span>
                    <span className="font-mono">NPR {(selectedInvoice.dueAmount ?? (selectedInvoice.paymentStatus === 'Paid' ? 0 : selectedInvoice.total - (selectedInvoice.paidAmount || 0))).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Verification & Signature Block */}
            <div className="pt-6 mt-6 border-t border-purple-900/30 print:border-slate-300 flex items-end justify-between text-xs">
              <div>
                <div className="text-[10px] text-slate-400 print:text-slate-500 font-mono">
                  Printed Date: {new Date().toLocaleString()} NPT
                </div>
                <div className="text-[10px] text-slate-400 print:text-slate-500 mt-0.5">
                  Thank you for visiting DentaPlus Dental Care. Get well soon!
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="w-48 border-b border-slate-400 print:border-black mb-1"></div>
                <div className="font-bold text-white print:text-black text-xs">Authorized Signatory / Cashier</div>
                <div className="text-[10px] text-purple-300 print:text-slate-600 font-mono">Verified Clinic Seal</div>
              </div>
            </div>

            {/* Settlement Buttons (Hidden on Print) */}
            {selectedInvoice.paymentStatus !== 'Paid' && (
              <div className="space-y-3 pt-4 border-t border-purple-900/30 print:hidden">
                <div className="text-xs font-semibold text-slate-300">Settle Payment Via Digital Wallet or Cash:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['eSewa', 'Khalti', 'Fonepay', 'Cash'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => onMarkPaid(selectedInvoice.id, method)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-md transition-all hover:scale-105"
                    >
                      Pay with {method}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-purple-900/30">
            Select an invoice to inspect line items or print tax statement.
          </div>
        )}

      </div>

      {/* Create Patient Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        patients={patients}
        doctors={doctors}
        onAddInvoice={handleAddNewInvoice}
      />

    </div>
  );
};
