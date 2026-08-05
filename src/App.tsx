import React, { useState, useEffect } from 'react';
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

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { AppointmentsView } from './views/AppointmentsView';
import { DoctorsView } from './views/DoctorsView';
import { LabDiagnosticsView } from './views/LabDiagnosticsView';
import { PharmacyView } from './views/PharmacyView';
import { BillingView } from './views/BillingView';
import { SettingsView } from './views/SettingsView';
import { getClinicIdFromEmail, loadClinicData, saveClinicDataField } from './utils/clinicStore';
import { findUserByEmail } from './utils/userRegistry';

export default function App() {
  // Authentication & Login State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Global Workspace State
  const [currentRole, setCurrentRole] = useState<Role>('Admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Active Clinic Identifier
  const currentClinicId = currentUser ? getClinicIdFromEmail(currentUser.email) : 'familydental.com.np';

  // Entities Data State
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(DEFAULT_CLINIC_INFO);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [labTests, setLabTests] = useState<DentalXRay[]>(INITIAL_LAB_TESTS);
  const [pharmacy, setPharmacy] = useState<PharmacyItem[]>(INITIAL_PHARMACY);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Load isolated clinic data when user logs in
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
      const userRecord = findUserByEmail(currentUser.email);
      const data = loadClinicData(currentClinicId, userRecord);
      setClinicInfo(data.clinicInfo);
      setPatients(data.patients);
      setDoctors(data.doctors);
      setAppointments(data.appointments);
      setLabTests(data.labTests);
      setPharmacy(data.pharmacy);
      setInvoices(data.invoices);
      setPrescriptions(data.prescriptions);
    }
  }, [currentUser, currentClinicId]);

  // Persist state changes to isolated clinic store
  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'clinicInfo', clinicInfo);
    }
  }, [clinicInfo, currentClinicId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'patients', patients);
    }
  }, [patients, currentClinicId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'doctors', doctors);
    }
  }, [doctors, currentClinicId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'appointments', appointments);
    }
  }, [appointments, currentClinicId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'labTests', labTests);
    }
  }, [labTests, currentClinicId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'pharmacy', pharmacy);
    }
  }, [pharmacy, currentClinicId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'invoices', invoices);
    }
  }, [invoices, currentClinicId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'prescriptions', prescriptions);
    }
  }, [prescriptions, currentClinicId, currentUser]);

  const handleUpdateClinicInfo = (updated: ClinicInfo) => {
    setClinicInfo(updated);
    if (currentUser) {
      saveClinicDataField(currentClinicId, 'clinicInfo', updated);
    }
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
  };

  const handleAddAppointment = (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
  };

  const handleAddPrescription = (newPrescription: Prescription) => {
    setPrescriptions((prev) => [newPrescription, ...prev]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const handleSaveDoctor = (savedDoctor: Doctor) => {
    setDoctors((prev) => {
      const exists = prev.some(d => d.id === savedDoctor.id);
      if (exists) {
        return prev.map(d => d.id === savedDoctor.id ? savedDoctor : d);
      }
      return [savedDoctor, ...prev];
    });
  };

  const handleToggleDoctorStatus = (id: string, newStatus?: Doctor['status']) => {
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          if (newStatus) {
            return { ...d, status: newStatus };
          }
          const statuses: Doctor['status'][] = ['Available', 'In Procedure', 'Break Time', 'On Leave', 'Busy'];
          const currIdx = statuses.indexOf(d.status);
          const nextStatus = statuses[(currIdx + 1) % statuses.length];
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  const handleAddXRay = (newXRay: DentalXRay) => {
    setLabTests((prev) => [newXRay, ...prev]);
  };

  const handleRestockItem = (id: string, amount: number, newBatch?: string, newExpiry?: string) => {
    setPharmacy((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            stock: m.stock + amount,
            batchNumber: newBatch || m.batchNumber,
            expiryDate: newExpiry || m.expiryDate
          };
        }
        return m;
      })
    );
  };

  const handleAddNewMedicine = (newItem: PharmacyItem) => {
    setPharmacy((prev) => [newItem, ...prev]);
  };

  const handleMarkInvoicePaid = (id: string, paymentMethod: Invoice['paymentMethod']) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, paymentStatus: 'Paid', paymentMethod } : inv
      )
    );
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  // Render Login Dashboard if unauthenticated
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentRole(user.role);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-100 font-['Poppins',sans-serif] selection:bg-[#7C3AED] selection:text-white flex overflow-x-hidden relative">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
        onLogout={() => setCurrentUser(null)}
        onNavigateToSettings={() => setActiveTab('settings')}
      />

      {/* Main View Area */}
      <main 
        className={`min-h-screen pt-24 pb-12 px-3 sm:px-6 md:px-8 transition-all duration-300 min-w-0 ${
          collapsed ? 'ml-20 w-[calc(100%-5rem)]' : 'ml-64 w-[calc(100%-16rem)]'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              patients={patients}
              appointments={appointments}
              doctors={doctors}
              labTests={labTests}
              pharmacy={pharmacy}
              clinicInfo={clinicInfo}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onSelectPatient={(p) => setSelectedPatientForDetails(p)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}


          {activeTab === 'patients' && (
            <PatientsView
              patients={patients}
              onSelectPatient={(p) => setSelectedPatientForDetails(p)}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenFollowUp={(p) => {
                setFollowUpPatient(p || null);
                setIsFollowUpOpen(true);
              }}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              doctors={doctors}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            />
          )}

          {activeTab === 'doctors' && (
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
          )}

          {activeTab === 'lab' && (
            <LabDiagnosticsView
              labTests={labTests}
              patients={patients}
              onAddXRay={handleAddXRay}
            />
          )}

          {activeTab === 'pharmacy' && (
            <PharmacyView
              pharmacy={pharmacy}
              onRestockItem={handleRestockItem}
              onAddNewMedicine={handleAddNewMedicine}
            />
          )}

          {activeTab === 'billing' && (
            <BillingView
              invoices={invoices}
              patients={patients}
              doctors={doctors}
              onMarkPaid={handleMarkInvoicePaid}
              onAddInvoice={handleAddInvoice}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              clinicInfo={clinicInfo}
              onUpdateClinicInfo={handleUpdateClinicInfo}
            />
          )}

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
