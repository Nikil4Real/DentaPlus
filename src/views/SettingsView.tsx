import React, { useState, useRef } from 'react';
import { Settings, ShieldCheck, Building2, Lock, Save, CheckCircle2, Image, FileText, Phone, Mail, MapPin, Upload, Trash2, Link, Users, UserPlus, UserCheck, PlusCircle } from 'lucide-react';
import { Role, ClinicInfo } from '../types';
import { getRegisteredUsers, registerClinicUser, deleteRegisteredUser, RegisteredClinicUser } from '../utils/userRegistry';

interface SettingsViewProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  clinicInfo: ClinicInfo;
  onUpdateClinicInfo: (info: ClinicInfo) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  setCurrentRole,
  clinicInfo,
  onUpdateClinicInfo
}) => {
  const [form, setForm] = useState<ClinicInfo>({ ...clinicInfo });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Registered Users Directory State
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredClinicUser[]>(() => getRegisteredUsers());
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('Doctor');
  const [userAddedNotice, setUserAddedNotice] = useState('');

  // Synchronize if parent clinicInfo changes
  React.useEffect(() => {
    setForm({ ...clinicInfo });
  }, [clinicInfo]);

  const isSuperAdmin = currentRole === 'Super Admin';
  const isAdmin = currentRole === 'Admin' || isSuperAdmin;

  const handleAddRegisteredUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    const updated = registerClinicUser({
      email: newEmail,
      name: newName.trim() || newEmail.split('@')[0],
      role: newRole,
      department: `${newRole} Department`
    });

    setRegisteredUsers(updated);
    setUserAddedNotice(`Clinic email '${newEmail}' registered with integrated role '${newRole}'!`);
    setNewEmail('');
    setNewName('');
    setTimeout(() => setUserAddedNotice(''), 4000);
  };

  const handleDeleteUser = (email: string) => {
    if (confirm(`Remove registered email '${email}'?`)) {
      const updated = deleteRegisteredUser(email);
      setRegisteredUsers(updated);
    }
  };

  const handleChange = (field: keyof ClinicInfo, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleChange('logoUrl', e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClinicInfo(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Poppins'] flex items-center gap-3">
            <Settings className="w-7 h-7 text-purple-400" /> DentaPlus System Configurations
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Dental clinic profile, identity badge, role permissions, and system preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in slide-in-from-right duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clinic Profile Saved!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hospital / Clinic Identity Editor Form (Spans 2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" /> Clinic &amp; Hospital Identity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdmin 
                  ? 'Update dental clinic name, tagline, address, contact details, and custom logo.'
                  : `Read-only view for ${currentRole} role. Clinic identity can be modified by Admin or Super Admin.`}
              </p>
            </div>
            {!isAdmin && (
              <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Restricted to Admin
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={!isAdmin} className="space-y-4 disabled:opacity-80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinic / Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Kathmandu Dental Hospital & Implant Center"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-900/40 text-white font-bold text-sm focus:outline-none focus:border-[#7C3AED] transition-colors disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              {/* Tagline */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline / Speciality Description
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="e.g. Advanced Dental Care, Orthodontics & Implantology"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-purple-200 text-xs focus:outline-none focus:border-[#7C3AED] disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              {/* License Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registration / License No.
                </label>
                <input
                  type="text"
                  value={form.licenseCode}
                  onChange={(e) => handleChange('licenseCode', e.target.value)}
                  placeholder="e.g. NMC-REG-2026-8891-KTM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-purple-300 font-mono text-xs focus:outline-none focus:border-[#7C3AED] disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              {/* PAN Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PAN / TAX ID Number
                </label>
                <input
                  type="text"
                  value={form.panNumber}
                  onChange={(e) => handleChange('panNumber', e.target.value)}
                  placeholder="e.g. 609823412"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-amber-300 font-mono text-xs focus:outline-none focus:border-[#7C3AED] disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Address &amp; Location
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g. Lazimpat, Kathmandu, Nepal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-slate-200 text-xs focus:outline-none focus:border-[#7C3AED] disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +977 01-4410000 / +977 9801234567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-emerald-300 text-xs focus:outline-none focus:border-[#7C3AED] disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="e.g. info@kathmandudental.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-slate-200 text-xs focus:outline-none focus:border-[#7C3AED] disabled:bg-slate-900 disabled:cursor-not-allowed"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Clinic Logo Image
                  </label>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Link className="w-3 h-3" />
                      {showUrlInput ? 'Use File Upload' : 'Paste Image URL instead'}
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {showUrlInput && isAdmin ? (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.logoUrl || ''}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/clinic-logo.png"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-900/30 text-slate-200 text-xs focus:outline-none focus:border-[#7C3AED]"
                    />
                    {form.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('logoUrl', '')}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {form.logoUrl ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={form.logoUrl}
                            alt="Clinic Logo Preview"
                            className="w-14 h-14 object-contain rounded-xl bg-slate-900 p-1 border border-purple-500/30 shadow-md"
                          />
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Active Logo Attached
                            </span>
                            <p className="text-xs text-slate-300 mt-1">Logo image attached and ready</p>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white text-xs font-semibold border border-purple-900/30 flex items-center gap-1.5 transition-all"
                            >
                              <Upload className="w-3.5 h-3.5" /> Change Image
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('logoUrl', '')}
                              className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 text-xs border border-rose-500/20 transition-all"
                              title="Remove Logo & Reset to Default Emblem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onDragOver={isAdmin ? handleDragOver : undefined}
                        onDragLeave={isAdmin ? handleDragLeave : undefined}
                        onDrop={isAdmin ? handleDrop : undefined}
                        onClick={isAdmin ? () => fileInputRef.current?.click() : undefined}
                        className={`group relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                          isAdmin ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-950' : 'cursor-not-allowed opacity-75'
                        } ${
                          isDragging
                            ? 'border-[#7C3AED] bg-[#7C3AED]/10 scale-[1.01]'
                            : 'border-purple-900/40 bg-slate-950/60'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 transition-all">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {isAdmin ? 'Click to upload clinic logo' : 'Default emblem active'} <span className="text-purple-400 font-normal">{isAdmin ? 'or drag & drop' : ''}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Supports PNG, JPG, WEBP, SVG
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  If empty, DentaPlus displays the built-in modern dental shield emblem automatically.
                </p>
              </div>

            </div>

            {/* Save Button */}
            {isAdmin && (
              <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  All changes sync automatically across invoices, headers, and reports.
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold shadow-lg shadow-purple-900/50 border border-purple-400/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4" /> Save Clinic Identity
                </button>
              </div>
            )}
            </fieldset>
          </form>
        </div>

        {/* Right Side: Real-time Live Preview & Super Admin/Admin Email Management */}
        <div className="space-y-6">
          
          {/* Live Identity Badge Preview */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Identity Badge Preview
            </h4>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#2E1065] border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-xl bg-slate-900 p-1 border border-purple-400/30" />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] p-2 text-white">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-current stroke-2">
                      <path d="M12 4c-3.5 0-6 2-6 5.5 0 2.5 1.2 5 2 7.5.5 1.5 1 3.5 2 3.5s1.2-1.5 2-3.5c.8 2 1.2 3.5 2 3.5s1.5-2 2-3.5c.8-2.5 2-5 2-7.5C18 6 15.5 4 12 4z" fill="rgba(255,255,255,0.2)" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">{form.name || 'Clinic Name'}</h4>
                  <p className="text-[11px] text-purple-200 truncate">{form.tagline || 'Tagline'}</p>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300 pt-2 border-t border-purple-900/40">
                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-purple-400 shrink-0" /> <span className="truncate">{form.address || 'Address'}</span></div>
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-400 shrink-0" /> <span>{form.phone || 'Phone'}</span></div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" /> <span className="font-mono">{form.licenseCode || 'License'}</span></div>
              </div>
            </div>
          </div>

          {/* Registered Clinic Email & Integrated Role Directory (Restricted to Admin & Super Admin) */}
          {isAdmin && (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-900/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> Registered Clinic Email Roles
                </h3>
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 border border-purple-400/40 text-[10px] font-bold">
                      Super Admin Access
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                    {registeredUsers.length} Mapped
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-slate-400">
                Map clinic email addresses directly to access roles in database. When staff sign in with their registered email, their integrated role is assigned automatically.
              </p>

              {userAddedNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{userAddedNotice}</span>
                </div>
              )}

              {/* Quick Email Registration Form */}
              <form onSubmit={handleAddRegisteredUser} className="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/40 space-y-3">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Register New Staff Email
                </div>

                <div>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Clinic Email (e.g. dr.sita@familydental.com.np)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Staff Name / Title"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />

                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-purple-900/40 text-xs font-semibold text-purple-200 focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Patient">Patient</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Register &amp; Integrate Role
                </button>
              </form>

              {/* Registered Users List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {registeredUsers.map((u) => (
                  <div
                    key={u.email}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-purple-900/20 flex items-center justify-between gap-2 text-xs hover:border-purple-500/30 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                        u.role === 'Super Admin' ? 'bg-amber-950/90 text-amber-300 border-amber-500/50' :
                        u.role === 'Admin' ? 'bg-purple-950/80 text-purple-300 border-purple-500/40' :
                        u.role === 'Doctor' ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40' :
                        u.role === 'Receptionist' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                        u.role === 'Pharmacist' ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                        'bg-sky-950/80 text-sky-300 border-sky-500/40'
                      }`}>
                        {u.role}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.email)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Remove Registration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
