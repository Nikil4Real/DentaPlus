import React, { useState, useRef, useEffect } from 'react';
import {
  Settings, ShieldCheck, Building2, Lock, Save,
  CheckCircle2, Phone, MapPin, Upload, Trash2, Link, AlertTriangle
} from 'lucide-react';
import { Role, ClinicInfo } from '../types';

interface SettingsViewProps {
  currentRole: Role;
  clinicInfo: ClinicInfo;
  onUpdateClinicInfo: (info: ClinicInfo) => Promise<boolean>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  clinicInfo,
  onUpdateClinicInfo,
}) => {
  const [form, setForm] = useState<ClinicInfo>({ ...clinicInfo });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = currentRole === 'Super Admin';

  // Sync form if clinicInfo loads from Supabase after mount
  useEffect(() => {
    setForm({ ...clinicInfo });
  }, [clinicInfo]);

  const handleChange = (field: keyof ClinicInfo, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
    setSaveError('');
  };

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) handleChange('logoUrl', e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
  };

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleProcessFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    setSaveError('');
    const ok = await onUpdateClinicInfo(form);
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      setSaveError('Save failed. Your account may not have Super Admin privileges, or there was a network error.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-purple-400" />
              System Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your clinic identity and system configuration.
            </p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-sm font-semibold animate-in fade-in slide-in-from-right duration-300">
              <CheckCircle2 className="w-4 h-4" /> Saved successfully
            </div>
          )}
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Identity Form — 2 cols */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-purple-900/30 overflow-hidden">

          {/* Card header */}
          <div className="px-6 pt-6 pb-4 border-b border-purple-900/20 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Clinic &amp; Hospital Identity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isSuperAdmin
                  ? 'Updates are saved to the database and reflected across all devices instantly.'
                  : 'View only — only Super Admin can edit clinic identity.'}
              </p>
            </div>
            {!isSuperAdmin && (
              <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Super Admin Only
              </span>
            )}
          </div>

          {/* Error banner */}
          {saveError && (
            <div className="mx-6 mt-4 flex items-start gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {saveError}
            </div>
          )}

          {/* Form body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <fieldset disabled={!isSuperAdmin} className="space-y-4 disabled:opacity-60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Clinic Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Clinic / Hospital Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required type="text" value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Kathmandu Dental Hospital & Implant Center"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/40 text-white font-semibold text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* Tagline */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagline / Speciality</label>
                  <input
                    type="text" value={form.tagline}
                    onChange={e => handleChange('tagline', e.target.value)}
                    placeholder="e.g. Advanced Dental Care, Orthodontics & Implantology"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-purple-200 text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* License */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration / License No.</label>
                  <input
                    type="text" value={form.licenseCode}
                    onChange={e => handleChange('licenseCode', e.target.value)}
                    placeholder="e.g. NMC-REG-2026-8891"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-cyan-300 font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* PAN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">PAN / TAX Number</label>
                  <input
                    type="text" value={form.panNumber}
                    onChange={e => handleChange('panNumber', e.target.value)}
                    placeholder="e.g. 609823412"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-amber-300 font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Address</label>
                  <input
                    type="text" value={form.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="e.g. Lazimpat, Kathmandu, Nepal"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone</label>
                  <input
                    type="text" value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+977 01-4410000"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-emerald-300 text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email</label>
                  <input
                    type="email" value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="info@clinic.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* Established Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Established Year</label>
                  <input
                    type="text" value={form.establishedYear}
                    onChange={e => handleChange('establishedYear', e.target.value)}
                    placeholder="e.g. 2015"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors disabled:cursor-not-allowed"
                  />
                </div>

                {/* Logo Upload */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">Clinic Logo</label>
                    {isSuperAdmin && (
                      <button type="button" onClick={() => setShowUrlInput(v => !v)}
                        className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition-colors">
                        <Link className="w-3 h-3" />
                        {showUrlInput ? 'Use file upload' : 'Paste URL instead'}
                      </button>
                    )}
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                  {showUrlInput && isSuperAdmin ? (
                    <input
                      type="url" value={form.logoUrl}
                      onChange={e => handleChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  ) : form.logoUrl ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-purple-500/20">
                      <div className="flex items-center gap-3">
                        <img src={form.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-lg bg-slate-900 p-1 border border-purple-500/20" />
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5">Logo attached</p>
                        </div>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5" /> Change
                          </button>
                          <button type="button" onClick={() => handleChange('logoUrl', '')}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onDragOver={isSuperAdmin ? handleDragOver : undefined}
                      onDragLeave={isSuperAdmin ? handleDragLeave : undefined}
                      onDrop={isSuperAdmin ? handleDrop : undefined}
                      onClick={isSuperAdmin ? () => fileInputRef.current?.click() : undefined}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        isSuperAdmin ? 'cursor-pointer hover:border-purple-500/50 hover:bg-slate-950' : 'opacity-50 cursor-not-allowed'
                      } ${isDragging ? 'border-purple-500 bg-purple-950/10' : 'border-purple-900/40'}`}
                    >
                      <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">
                        {isSuperAdmin ? 'Click or drag & drop to upload logo' : 'No logo uploaded'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">PNG, JPG, SVG, WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save button — Super Admin only */}
              {isSuperAdmin && (
                <div className="pt-4 border-t border-purple-900/20 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Changes sync to the database and are visible across all devices.
                  </p>
                  <button
                    type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save Identity'}
                  </button>
                </div>
              )}
            </fieldset>
          </form>
        </div>

        {/* Right col — Live Badge Preview */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-900/80 border border-purple-900/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-purple-900/20">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Live Preview
              </h3>
            </div>
            <div className="p-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#2E1065] border border-purple-500/20 space-y-3">
                {/* Logo + Name */}
                <div className="flex items-center gap-3">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="w-11 h-11 object-contain rounded-xl bg-slate-900 p-1 border border-purple-400/20" />
                  ) : (
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-700 to-purple-500 text-white">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                        <path d="M12 4c-3.5 0-6 2-6 5.5 0 2.5 1.2 5 2 7.5.5 1.5 1 3.5 2 3.5s1.2-1.5 2-3.5c.8 2 1.2 3.5 2 3.5s1.5-2 2-3.5c.8-2.5 2-5 2-7.5C18 6 15.5 4 12 4z" fill="rgba(255,255,255,0.15)" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{form.name || 'Clinic Name'}</h4>
                    <p className="text-[11px] text-purple-300 truncate">{form.tagline || 'Tagline'}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 pt-2 border-t border-purple-900/30 text-[11px] text-slate-300">
                  {form.address && (
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-purple-400 shrink-0" /><span className="truncate">{form.address}</span></div>
                  )}
                  {form.phone && (
                    <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-400 shrink-0" /><span>{form.phone}</span></div>
                  )}
                  {form.licenseCode && (
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" /><span className="font-mono">{form.licenseCode}</span></div>
                  )}
                  {(form.establishedYear) && (
                    <div className="text-[10px] text-slate-500 pt-1">Est. {form.establishedYear}</div>
                  )}
                </div>
              </div>

              {!isSuperAdmin && (
                <p className="mt-3 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Contact your Super Admin to update clinic identity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
