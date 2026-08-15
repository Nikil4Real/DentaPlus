import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { 
  Patient, 
  Appointment, 
  Doctor, 
  Prescription, 
  DentalXRay, 
  PharmacyItem, 
  Invoice, 
  Role,
  ClinicInfo,
  AuthUser 
} from './types';
import { 
  INITIAL_PATIENTS, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_LAB_TESTS, 
  INITIAL_PHARMACY, 
  INITIAL_INVOICES,
  DEFAULT_CLINIC_INFO 
} from './data/mockData';

import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickAddModal } from './components/QuickAddModal';
import { SearchModal } from './components/SearchModal';
import { PatientDetailsModal } from './components/PatientDetailsModal';
import { NewPrescriptionModal } from './components/NewPrescriptionModal';
import { FollowUpModal } from './components/FollowUpModal';
import { DoctorModal } from './components/DoctorModal';

import LoginView from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { AppointmentsView } from './views/AppointmentsView';
import { DoctorsView } from './views/DoctorsView';
import { LabDiagnosticsView } from './views/LabDiagnosticsView';
import { PharmacyView } from './views/PharmacyView';
import { BillingView } from './views/BillingView';
import { SettingsView } from './views/SettingsView';
import { fetchClinicInfoWithId, saveClinicInfo } from './lib/clinicInfoService';
import {
  fetchPatients, fetchDoctors, fetchAppointments, fetchLabTests,
  fetchPharmacy, fetchInvoices, fetchPrescriptions,
  addPatient, updatePatient,
  addDoctor, updateDoctor,
  addAppointment, updateAppointmentStatus as dbUpdateAppointmentStatus,
  addLabTest,
  addPharmacyItem, updatePharmacyStock,
  addInvoice, updateInvoicePayment,
  addPrescription,
} from './lib/dataService';

export default function App() {
  // Authentication & Login State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Restore the httpOnly browser-session cookie after refresh.
  useEffect(() => {
    let active = true;
    fetch('/api/session', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json().catch(() => null);
        return data?.success ? (data.user as AuthUser) : null;
      })
      .then((user) => {
        if (active && user) {
          setDataLoading(true);
          setCurrentUser(user);
          setCurrentRole(user.role);
        }
      })
      .catch(() => {
        // A missing or expired session simply leaves the login screen available.
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });

    return () => { active = false; };
  }, []);

  // Global Workspace State
  const [currentRole, setCurrentRole] = useState<Role>('Admin');
  const [collapsed, setCollapsed] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const location = useLocation();
  const navigate = useNavigate();

  const routeToTab: Record<string, ActiveTab> = {
    '/dashboard': 'dashboard',
    '/patients': 'patients',
    '/appointments': 'appointments',
    '/doctors': 'doctors',
    '/diagnostics': 'lab',
    '/inventory': 'pharmacy',
    '/billing': 'billing',
    '/settings': 'settings',
  };
  const activeTab = routeToTab[location.pathname] || 'dashboard';
  const navigateToTab = (tab: ActiveTab) => {
    const tabToRoute: Record<ActiveTab, string> = {
      dashboard: '/dashboard',
      patients: '/patients',
      appointments: '/appointments',
      doctors: '/doctors',
      lab: '/diagnostics',
      pharmacy: '/inventory',
      billing: '/billing',
      settings: '/settings',
    };
    navigate(tabToRoute[tab]);
  };

  // Entities Data State (loaded from Supabase on login)
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(DEFAULT_CLINIC_INFO);
  const [clinicInfoRowId, setClinicInfoRowId] = useState<string | undefined>(undefined);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labTests, setLabTests] = useState<DentalXRay[]>([]);
  const [pharmacy, setPharmacy] = useState<PharmacyItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Load only the active clinic's data before rendering the workspace.
  useEffect(() => {
    let active = true;
    const clinicId = currentUser?.clinicId;

    if (!clinicId) {
      setDataLoading(false);
      return () => { active = false; };
    }

    setCurrentRole(currentUser.role);
    setDataLoading(true);

    // Clear the previous clinic immediately so it cannot flash during a new request.
    setClinicInfo(DEFAULT_CLINIC_INFO);
    setClinicInfoRowId(undefined);
    setPatients([]);
    setDoctors([]);
    setAppointments([]);
    setLabTests([]);
    setPharmacy([]);
    setInvoices([]);
    setPrescriptions([]);

    Promise.all([
      fetchClinicInfoWithId(currentUser.email),
      fetchPatients(clinicId),
      fetchDoctors(clinicId),
      fetchAppointments(clinicId),
      fetchLabTests(clinicId),
      fetchPharmacy(clinicId),
      fetchInvoices(clinicId),
      fetchPrescriptions(clinicId),
    ])
      .then(([clinicResult, pts, drs, appts, labs, pharm, invs, rxs]) => {
        if (!active) return;
        setClinicInfo(clinicResult?.info || DEFAULT_CLINIC_INFO);
        setClinicInfoRowId(clinicResult?.id || undefined);
        setPatients(pts);
        setDoctors(drs);
        setAppointments(appts);
        setLabTests(labs);
        setPharmacy(pharm);
        setInvoices(invs);
        setPrescriptions(rxs);
      })
      .catch((error) => {
        if (active) console.error('Failed to load clinic workspace data:', error);
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });

    return () => { active = false; };
  }, [currentUser]);

  const handleUpdateClinicInfo = async (updated: ClinicInfo): Promise<boolean> => {
    const ok = await saveClinicInfo(updated, clinicInfoRowId!);
    if (ok) setClinicInfo(updated);
    return ok;
  };

  // Modals & Drawers State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState<boolean>(false);
  const [followUpPatient, setFollowUpPatient] = useState<Patient | null>(null);

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState<boolean>(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);

  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);
  const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState<Patient | null>(null);

  // Cmd+K / Ctrl+K keyboard shortcut listener for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    if (currentUser?.clinicId) addPatient(newPatient, currentUser.clinicId);
  };

  const handleAddAppointment = (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    if (currentUser?.clinicId) addAppointment(newAppointment, currentUser.clinicId);
  };

  const handleAddPrescription = (newPrescription: Prescription) => {
    setPrescriptions((prev) => [newPrescription, ...prev]);
    if (currentUser?.clinicId) addPrescription(newPrescription, currentUser.clinicId);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    if (currentUser?.clinicId) dbUpdateAppointmentStatus(id, status, currentUser.clinicId);
  };

  const handleSaveDoctor = (savedDoctor: Doctor) => {
    setDoctors((prev) => {
      const exists = prev.some(d => d.id === savedDoctor.id);
      if (exists) {
        if (currentUser?.clinicId) updateDoctor(savedDoctor, currentUser.clinicId);
        return prev.map(d => d.id === savedDoctor.id ? savedDoctor : d);
      }
      if (currentUser?.clinicId) addDoctor(savedDoctor, currentUser.clinicId);
      return [savedDoctor, ...prev];
    });
  };

  const handleToggleDoctorStatus = (id: string, newStatus?: Doctor['status']) => {
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const statuses: Doctor['status'][] = ['Available', 'In Procedure', 'Break Time', 'On Leave', 'Busy'];
        const currIdx = statuses.indexOf(d.status);
        const nextStatus = newStatus || statuses[(currIdx + 1) % statuses.length];
        const updated = { ...d, status: nextStatus };
        if (currentUser?.clinicId) updateDoctor(updated, currentUser.clinicId);
        return updated;
      })
    );
  };

  const handleAddXRay = (newXRay: DentalXRay) => {
    setLabTests((prev) => [newXRay, ...prev]);
    if (currentUser?.clinicId) addLabTest(newXRay, currentUser.clinicId);
  };

  const handleRestockItem = (id: string, amount: number, newBatch?: string, newExpiry?: string) => {
    setPharmacy((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStock = m.stock + amount;
          if (currentUser?.clinicId) updatePharmacyStock(id, newStock, currentUser.clinicId);
          return { ...m, stock: newStock, batchNumber: newBatch || m.batchNumber, expiryDate: newExpiry || m.expiryDate };
        }
        return m;
      })
    );
  };

  const handleAddNewMedicine = (newItem: PharmacyItem) => {
    setPharmacy((prev) => [newItem, ...prev]);
    if (currentUser?.clinicId) addPharmacyItem(newItem, currentUser.clinicId);
  };

  const handleMarkInvoicePaid = (id: string, paymentMethod: Invoice['paymentMethod']) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const updated = { ...inv, paymentStatus: 'Paid' as const, paymentMethod };
        if (currentUser?.clinicId) updateInvoicePayment(id, paymentMethod, currentUser.clinicId);
        return updated;
      })
    );
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    if (currentUser?.clinicId) addInvoice(newInvoice, currentUser.clinicId);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      setCurrentUser(null);
      setDataLoading(false);
      setPatients([]);
      setDoctors([]);
      setAppointments([]);
      setLabTests([]);
      setPharmacy([]);
      setInvoices([]);
      setPrescriptions([]);
    }
  };

  // Avoid flashing the login form while the browser-session cookie is restored.
  if (authChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 text-slate-600">
        <span className="text-sm">Restoring your session...</span>
      </div>
    );
  }

  // Render Login Dashboard if unauthenticated
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setDataLoading(true);
          setCurrentUser(user);
          setCurrentRole(user.role);
        }}
      />
    );
  }

  if (!currentUser.clinicId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 text-slate-700 px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Clinic workspace unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">This account is not linked to a clinic. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 text-slate-600">
        <span className="text-sm">Loading your clinic workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-100 font-['Poppins',sans-serif] selection:bg-[#7C3AED] selection:text-white flex overflow-x-hidden relative">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Header Bar */}
      <Header
        currentRole={currentRole}
        clinicInfo={clinicInfo}
        pharmacy={pharmacy}
        appointments={appointments}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        collapsed={collapsed}
        onLogout={handleLogout}
        onNavigateToSettings={() => navigateToTab('settings')}
      />

      {/* Main View Area */}
      <main 
        className={`min-h-screen pt-24 pb-12 px-3 sm:px-6 md:px-8 transition-all duration-300 min-w-0 ${
          collapsed ? 'ml-20 w-[calc(100%-5rem)]' : 'ml-64 w-[calc(100%-16rem)]'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <DashboardView
                patients={patients}
                appointments={appointments}
                doctors={doctors}
                labTests={labTests}
                pharmacy={pharmacy}
                clinicInfo={clinicInfo}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onSelectPatient={(p) => setSelectedPatientForDetails(p)}
                onNavigateTab={(tab) => navigateToTab(tab as ActiveTab)}
              />
            } />
            <Route path="/patients" element={
              <PatientsView
                patients={patients}
                onSelectPatient={(p) => setSelectedPatientForDetails(p)}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onOpenFollowUp={(p) => {
                  setFollowUpPatient(p || null);
                  setIsFollowUpOpen(true);
                }}
              />
            } />
            <Route path="/appointments" element={
              <AppointmentsView
                appointments={appointments}
                patients={patients}
                doctors={doctors}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              />
            } />
            <Route path="/doctors" element={
              <DoctorsView
                doctors={doctors}
                onToggleDoctorStatus={handleToggleDoctorStatus}
                onOpenAddDoctor={() => {
                  setDoctorToEdit(null);
                  setIsDoctorModalOpen(true);
                }}
                onEditDoctor={(doc) => {
                  setDoctorToEdit(doc);
                  setIsDoctorModalOpen(true);
                }}
              />
            } />
            <Route path="/diagnostics" element={
              <LabDiagnosticsView
                labTests={labTests}
                patients={patients}
                onAddXRay={handleAddXRay}
              />
            } />
            <Route path="/inventory" element={
              <PharmacyView
                pharmacy={pharmacy}
                onRestockItem={handleRestockItem}
                onAddNewMedicine={handleAddNewMedicine}
              />
            } />
            <Route path="/billing" element={
              <BillingView
                invoices={invoices}
                patients={patients}
                doctors={doctors}
                onMarkPaid={handleMarkInvoicePaid}
                onAddInvoice={handleAddInvoice}
              />
            } />
            <Route path="/settings" element={
              <SettingsView
                currentRole={currentRole}
                clinicInfo={clinicInfo}
                onUpdateClinicInfo={handleUpdateClinicInfo}
              />
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Global Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        doctors={doctors}
        onAddPatient={handleAddPatient}
        onAddAppointment={handleAddAppointment}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        patients={patients}
        doctors={doctors}
        appointments={appointments}
        labTests={labTests}
        pharmacy={pharmacy}
        onSelectPatient={(p) => setSelectedPatientForDetails(p)}
      />

      <PatientDetailsModal
        patient={selectedPatientForDetails}
        onClose={() => setSelectedPatientForDetails(null)}
        prescriptions={prescriptions}
        labTests={labTests}
        invoices={invoices}
        appointments={appointments}
        onOpenNewPrescription={(p) => {
          setSelectedPatientForDetails(null);
          setSelectedPatientForPrescription(p);
        }}
        onOpenFollowUp={(p) => {
          setFollowUpPatient(p);
          setIsFollowUpOpen(true);
        }}
      />

      <NewPrescriptionModal
        patient={selectedPatientForPrescription}
        onClose={() => setSelectedPatientForPrescription(null)}
        onAddPrescription={handleAddPrescription}
      />

      <FollowUpModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        patients={patients}
        doctors={doctors}
        initialPatient={followUpPatient}
        onAddAppointment={handleAddAppointment}
      />

      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        doctorToEdit={doctorToEdit}
        onSaveDoctor={handleSaveDoctor}
      />

    </div>
  );
}
