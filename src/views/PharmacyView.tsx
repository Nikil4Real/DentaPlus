import React, { useState } from 'react';
import { Pill, AlertTriangle, RefreshCw, Plus, Calendar, X, Package } from 'lucide-react';
import { PharmacyItem } from '../types';

interface PharmacyViewProps {
  pharmacy: PharmacyItem[];
  onRestockItem: (id: string, amount: number, newBatch?: string, newExpiry?: string) => void;
  onAddNewMedicine: (item: PharmacyItem) => void;
}

export const PharmacyView: React.FC<PharmacyViewProps> = ({
  pharmacy,
  onRestockItem,
  onAddNewMedicine
}) => {
  const [selectedRestockItem, setSelectedRestockItem] = useState<PharmacyItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [useNewExpiry, setUseNewExpiry] = useState<boolean>(false);
  const [newExpiryDate, setNewExpiryDate] = useState<string>('2028-12-31');
  const [newBatchNo, setNewBatchNo] = useState<string>('');

  // Add New Medicine Modal State
  const [showAddMedicineModal, setShowAddMedicineModal] = useState<boolean>(false);
  const [medName, setMedName] = useState<string>('');
  const [medCategory, setMedCategory] = useState<string>('Local Anesthesia');
  const [medStock, setMedStock] = useState<number>(100);
  const [medMinThreshold, setMedMinThreshold] = useState<number>(20);
  const [medUnitPrice, setMedUnitPrice] = useState<number>(150);
  const [medExpiryDate, setMedExpiryDate] = useState<string>('2028-06-30');
  const [medBatchNumber, setMedBatchNumber] = useState<string>('DENT-2026-01');
  const [medManufacturer, setMedManufacturer] = useState<string>('Septodont Dental');

  const handleOpenRestockModal = (item: PharmacyItem) => {
    setSelectedRestockItem(item);
    setRestockQty(50);
    setUseNewExpiry(false);
    setNewExpiryDate(item.expiryDate);
    setNewBatchNo(item.batchNumber);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockItem) return;

    onRestockItem(
      selectedRestockItem.id,
      restockQty,
      newBatchNo || selectedRestockItem.batchNumber,
      useNewExpiry ? newExpiryDate : selectedRestockItem.expiryDate
    );

    setSelectedRestockItem(null);
  };

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;

    const newItem: PharmacyItem = {
      id: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name: medName,
      category: medCategory,
      stock: medStock,
      minStockThreshold: medMinThreshold,
      unitPrice: medUnitPrice,
      expiryDate: medExpiryDate,
      batchNumber: medBatchNumber,
      manufacturer: medManufacturer
    };

    onAddNewMedicine(newItem);
    setShowAddMedicineModal(false);
    setMedName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins'] flex items-center gap-3">
            <Pill className="w-7 h-7 text-purple-400" /> Dental Pharmacy & Clinic Supplies
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Local anesthetics, dental antibiotics, restorative materials, impression compounds, and restock management.
          </p>
        </div>
        <button
          onClick={() => setShowAddMedicineModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-900/40 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      {/* Stock Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pharmacy.map((item) => {
          const isLowStock = item.stock <= item.minStockThreshold;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl bg-slate-900/80 border space-y-4 transition-all flex flex-col justify-between ${
                isLowStock ? 'border-rose-800/60 bg-rose-950/10' : 'border-purple-900/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <div className="text-[10px] font-semibold text-purple-300">{item.category}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.manufacturer}</div>
                  </div>
                  {isLowStock && (
                    <span className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 shrink-0">
                      <AlertTriangle className="w-4 h-4 animate-bounce" />
                    </span>
                  )}
                </div>

                <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-purple-900/20 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Stock:</span>
                    <span className={`font-bold font-mono ${isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.stock} Units
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Unit Price:</span>
                    <span className="text-white font-semibold">NPR {item.unitPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Batch Expiry:</span>
                    <span className="text-purple-300 font-mono text-[11px]">{item.expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
                <span className="text-[10px] font-mono text-slate-500">Batch: {item.batchNumber}</span>
                <button
                  onClick={() => handleOpenRestockModal(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-[#7C3AED] text-purple-200 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-300" /> Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pharmacy.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-purple-900/30">
          <Pill className="w-10 h-10 text-purple-400/50 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">No pharmacy items or supplies registered yet for this clinic.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Add New Medicine" to populate your clinic pharmacy inventory.</p>
        </div>
      )}

      {/* Restock Modal */}
      {selectedRestockItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-purple-500/30 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" /> Restock Medicine Stock
              </h2>
              <button onClick={() => setSelectedRestockItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/30 text-xs">
              <div className="font-bold text-white text-sm">{selectedRestockItem.name}</div>
              <div className="text-purple-300 text-[11px]">{selectedRestockItem.category} • Current: {selectedRestockItem.stock} Units</div>
            </div>

            <form onSubmit={handleConfirmRestock} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Restock Quantity to Add:</label>
                <input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono text-sm focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Batch Number:</label>
                <input
                  type="text"
                  value={newBatchNo}
                  onChange={(e) => setNewBatchNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono text-xs focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="expiryToggle"
                    checked={useNewExpiry}
                    onChange={(e) => setUseNewExpiry(e.target.checked)}
                    className="rounded bg-slate-900 border-purple-900 text-[#7C3AED]"
                  />
                  <label htmlFor="expiryToggle" className="text-slate-300 font-medium">
                    This shipment has a NEW expiry date
                  </label>
                </div>

                {useNewExpiry ? (
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">New Batch Expiry Date:</label>
                    <input
                      type="date"
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                      required
                    />
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-purple-900/20">
                    Retaining existing batch expiry date: <span className="font-mono text-purple-300 font-bold">{selectedRestockItem.expiryDate}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setSelectedRestockItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white font-semibold shadow-lg shadow-purple-900/40"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-purple-500/30 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" /> Add New Medicine / Material
              </h2>
              <button onClick={() => setShowAddMedicineModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Item Name:</label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Lidocaine 2% Cartridge, Composite Resin Shade A2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category:</label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Local Anesthesia">Local Anesthesia</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antiseptic Rinse">Antiseptic Rinse</option>
                    <option value="Restorative Material">Restorative Material</option>
                    <option value="Endodontic Supply">Endodontic Supply</option>
                    <option value="Impression Material">Impression Material</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Manufacturer:</label>
                  <input
                    type="text"
                    value={medManufacturer}
                    onChange={(e) => setMedManufacturer(e.target.value)}
                    placeholder="e.g. Septodont Dental"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Initial Stock:</label>
                  <input
                    type="number"
                    min={1}
                    value={medStock}
                    onChange={(e) => setMedStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Threshold:</label>
                  <input
                    type="number"
                    min={1}
                    value={medMinThreshold}
                    onChange={(e) => setMedMinThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Unit Price (NPR):</label>
                  <input
                    type="number"
                    min={1}
                    value={medUnitPrice}
                    onChange={(e) => setMedUnitPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Batch Number:</label>
                  <input
                    type="text"
                    value={medBatchNumber}
                    onChange={(e) => setMedBatchNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white font-mono focus:outline-none focus:border-[#7C3AED]"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    value={medExpiryDate}
                    onChange={(e) => setMedExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-900/40 text-white focus:outline-none focus:border-[#7C3AED]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setShowAddMedicineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white font-semibold shadow-lg shadow-purple-900/40"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
