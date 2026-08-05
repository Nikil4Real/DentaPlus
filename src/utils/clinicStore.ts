import { 
  ClinicInfo, 
  Patient, 
  Doctor, 
  Appointment, 
  DentalXRay, 
  PharmacyItem, 
  Invoice, 
  Prescription 
} from '../types';
import { 
  DEFAULT_CLINIC_INFO, 
  INITIAL_PATIENTS, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_LAB_TESTS, 
  INITIAL_PHARMACY, 
  INITIAL_INVOICES 
} from '../data/mockData';
import { RegisteredClinicUser } from './userRegistry';

export interface IsolatedClinicData {
  clinicInfo: ClinicInfo;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  labTests: DentalXRay[];
  pharmacy: PharmacyItem[];
  invoices: Invoice[];
  prescriptions: Prescription[];
}

export const DEMO_CLINIC_ID = 'familydental.com.np';

export function getClinicIdFromEmail(email: string): string {
  if (!email || !email.includes('@')) return DEMO_CLINIC_ID;
  const parts = email.trim().toLowerCase().split('@');
  return parts[1] || DEMO_CLINIC_ID;
}

export function loadClinicData(clinicId: string, userRecord?: RegisteredClinicUser): IsolatedClinicData {
  const safeId = clinicId.toLowerCase().trim() || DEMO_CLINIC_ID;
  const isDemo = safeId === DEMO_CLINIC_ID;

  const getItem = <T>(key: string): T | null => {
    try {
      const val = localStorage.getItem(`dentaplus_${key}_${safeId}`);
      if (val) return JSON.parse(val);
    } catch (e) {
      console.error(`Error loading key ${key} for clinic ${safeId}:`, e);
    }
    return null;
  };

  // 1. Clinic Info
  let clinicInfo = getItem<ClinicInfo>('clinicInfo');
  if (!clinicInfo) {
    if (isDemo) {
      clinicInfo = DEFAULT_CLINIC_INFO;
    } else {
      // Pre-fill only specific institutional name/email if known, or leave blank configuration
      const formattedDomainName = safeId.split('.')[0];
      const capitalizedDomain = formattedDomainName.charAt(0).toUpperCase() + formattedDomainName.slice(1);
      const cleanName = userRecord?.clinicName || `${capitalizedDomain} Dental Care`;

      clinicInfo = {
        name: cleanName,
        tagline: '',
        licenseCode: '',
        panNumber: '',
        address: '',
        phone: '',
        email: userRecord?.email || `info@${safeId}`,
        logoUrl: '',
        establishedYear: ''
      };
    }
  }

  // 2. Patients (Isolated)
  let patients = getItem<Patient[]>('patients');
  if (!patients) {
    patients = isDemo ? INITIAL_PATIENTS : [];
  }

  // 3. Doctors (Isolated)
  let doctors = getItem<Doctor[]>('doctors');
  if (!doctors) {
    doctors = isDemo ? INITIAL_DOCTORS : [];
  }

  // 4. Appointments (Isolated)
  let appointments = getItem<Appointment[]>('appointments');
  if (!appointments) {
    appointments = isDemo ? INITIAL_APPOINTMENTS : [];
  }

  // 5. Lab Tests (Isolated)
  let labTests = getItem<DentalXRay[]>('labTests');
  if (!labTests) {
    labTests = isDemo ? INITIAL_LAB_TESTS : [];
  }

  // 6. Pharmacy Items (Isolated)
  let pharmacy = getItem<PharmacyItem[]>('pharmacy');
  if (!pharmacy) {
    pharmacy = isDemo ? INITIAL_PHARMACY : [];
  }

  // 7. Invoices (Isolated)
  let invoices = getItem<Invoice[]>('invoices');
  if (!invoices) {
    invoices = isDemo ? INITIAL_INVOICES : [];
  }

  // 8. Prescriptions (Isolated)
  let prescriptions = getItem<Prescription[]>('prescriptions');
  if (!prescriptions) {
    prescriptions = [];
  }

  return {
    clinicInfo,
    patients,
    doctors,
    appointments,
    labTests,
    pharmacy,
    invoices,
    prescriptions
  };
}

export function saveClinicDataField<T>(clinicId: string, field: keyof IsolatedClinicData, data: T): void {
  const safeId = clinicId.toLowerCase().trim() || DEMO_CLINIC_ID;
  try {
    localStorage.setItem(`dentaplus_${field}_${safeId}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${field} for clinic ${safeId}:`, e);
  }
}
