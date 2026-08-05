export type Role = 'Super Admin' | 'Admin' | 'Doctor' | 'Receptionist' | 'Pharmacist' | 'Patient';

export interface Patient {
  id: string;
  registrationNumber: string; // Registration Number e.g. REGD-1001
  uhid?: string; // Backwards compatibility alias if needed
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  registeredDate: string;
  lastVisit: string;
  status: 'Active' | 'Completed' | 'Follow-up Required';
  assignedDoctor: string;
  department: string; // e.g. General Dentistry, Orthodontics, Endodontics, etc.
  allergies: string[];
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    temp: number;
    weight: number;
  };
  dentalNotes?: string;
  medicalHistory: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  tokenNumber: number;
  status: 'Scheduled' | 'In Consultation' | 'Completed' | 'Cancelled';
  type: 'OPD' | 'Follow-up' | 'Procedure';
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  experienceYears: number;
  consultationFee: number;
  nmcNo: string; // Nepal Medical Council / Dental Council Reg No. e.g. NMC-D-1204
  availableDays: string[];
  timeSlot: string;
  status: 'Available' | 'In Procedure' | 'On Leave' | 'Break Time' | 'Busy';
  phone: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  notes?: string;
}

export interface DentalXRay {
  id: string;
  patientId: string;
  patientName: string;
  xrayType: 'Dental X-Ray (RVG)' | 'Full Mouth (OPG)' | 'Images' | 'Periapical (IOPA)' | 'Bitewing X-Ray' | 'CBCT 3D Scan' | 'Cephalometric' | string;
  toothNumber: string;
  orderDate: string;
  status: 'Completed' | 'Pending' | 'Scheduled';
  findings?: string;
  doctorName: string;
  imageUrl?: string;
  urgent: boolean;
}

// Alias for backwards compatibility
export type LabTest = DentalXRay;

export interface PharmacyItem {
  id: string;
  name: string;
  category: string; // e.g. Local Anesthesia, Antibiotics, Impression Material, Endodontic Material
  stock: number;
  minStockThreshold: number;
  unitPrice: number;
  expiryDate: string;
  batchNumber: string;
  manufacturer: string;
}

export interface InvoiceItem {
  description: string;
  toothNumber?: string;
  quantity?: number;
  rate?: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  doctorName?: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paymentMethod?: 'eSewa' | 'Khalti' | 'Fonepay' | 'Cash' | 'Card';
  panNumber?: string;
}

export interface ClinicInfo {
  name: string;
  tagline: string;
  licenseCode: string;
  panNumber: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  establishedYear?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatarUrl?: string;
}

