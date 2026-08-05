import { Patient, Appointment, Doctor, DentalXRay, PharmacyItem, Invoice, ClinicInfo } from '../types';

export const DEFAULT_CLINIC_INFO: ClinicInfo = {
  name: 'Kathmandu Dental Hospital & Implant Center',
  tagline: 'Advanced Dental Care, Orthodontics & Implantology',
  licenseCode: 'NMC-REG-2026-8891-KTM',
  panNumber: '609823412',
  address: 'Lazimpat, Kathmandu, Nepal',
  phone: '+977 01-4410000 / +977 9801234567',
  email: 'info@kathmandudental.com',
  logoUrl: '/dentaplus-logo.png',
  establishedYear: '2015'
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'P-101',
    registrationNumber: 'REGD-1001',
    uhid: 'REGD-1001',
    name: 'Aarav Shrestha',
    age: 34,
    gender: 'Male',
    phone: '+977 9841234567',
    email: 'aarav.shrestha@example.com',
    bloodGroup: 'A+',
    address: 'Lazimpat, Kathmandu',
    registeredDate: '2026-01-15',
    lastVisit: '2026-08-01',
    status: 'Active',
    assignedDoctor: 'Dr. Sameer Joshi (Endodontist)',
    department: 'Endodontics',
    allergies: ['Penicillin'],
    vitals: {
      bp: '120/80',
      pulse: 72,
      spo2: 98,
      temp: 98.6,
      weight: 70
    },
    dentalNotes: 'Tooth #36: Irreversible Pulpitis, Root Canal Treatment Step 2 complete.',
    medicalHistory: ['Mild Hypertension', 'Allergic to Penicillin']
  },
  {
    id: 'P-102',
    registrationNumber: 'REGD-1002',
    uhid: 'REGD-1002',
    name: 'Sujata Karki',
    age: 24,
    gender: 'Female',
    phone: '+977 9851098765',
    email: 'sujata.karki@example.com',
    bloodGroup: 'O+',
    address: 'Jhamsikhel, Lalitpur',
    registeredDate: '2026-02-10',
    lastVisit: '2026-08-02',
    status: 'Active',
    assignedDoctor: 'Dr. Priya Sharma (Orthodontist)',
    department: 'Orthodontics',
    allergies: ['Latex'],
    vitals: {
      bp: '110/75',
      pulse: 78,
      spo2: 99,
      temp: 98.4,
      weight: 58
    },
    dentalNotes: 'Class II Malocclusion, Metallic Braces alignment monthly activation.',
    medicalHistory: ['No systemic medical conditions']
  },
  {
    id: 'P-103',
    registrationNumber: 'REGD-1003',
    uhid: 'REGD-1003',
    name: 'Bikash Thapa',
    age: 52,
    gender: 'Male',
    phone: '+977 9813456789',
    email: 'bikash.thapa@example.com',
    bloodGroup: 'B+',
    address: 'Baneshwor, Kathmandu',
    registeredDate: '2025-11-20',
    lastVisit: '2026-08-03',
    status: 'Follow-up Required',
    assignedDoctor: 'Dr. Ramesh Adhikari (Oral Surgeon)',
    department: 'Oral Surgery',
    allergies: ['None'],
    vitals: {
      bp: '130/85',
      pulse: 80,
      spo2: 96,
      temp: 98.4,
      weight: 82
    },
    dentalNotes: 'Impacted Tooth #48 Mesioangular, scheduled for surgical disimpaction.',
    medicalHistory: ['Controlled Type 2 Diabetes']
  },
  {
    id: 'P-104',
    registrationNumber: 'REGD-1004',
    uhid: 'REGD-1004',
    name: 'Anjali Gurung',
    age: 41,
    gender: 'Female',
    phone: '+977 9801122334',
    email: 'anjali.gurung@example.com',
    bloodGroup: 'AB+',
    address: 'Pokhara-8, Kaski',
    registeredDate: '2026-03-05',
    lastVisit: '2026-07-28',
    status: 'Active',
    assignedDoctor: 'Dr. Sunita Mahajan (Periodontist)',
    department: 'Periodontics',
    allergies: ['Aspirin'],
    vitals: {
      bp: '128/82',
      pulse: 74,
      spo2: 97,
      temp: 98.6,
      weight: 64
    },
    dentalNotes: 'Generalized Periodontitis Grade II, Deep Scaling & Curettage performed.',
    medicalHistory: ['Bleeding Tendency - Controlled']
  },
  {
    id: 'P-105',
    registrationNumber: 'REGD-1005',
    uhid: 'REGD-1005',
    name: 'Rohan Chaudhary',
    age: 9,
    gender: 'Male',
    phone: '+977 9845566778',
    email: 'parent.rohan@example.com',
    bloodGroup: 'O-',
    address: 'Thamel, Kathmandu',
    registeredDate: '2026-05-18',
    lastVisit: '2026-08-03',
    status: 'Active',
    assignedDoctor: 'Dr. Niraj Bhattarai (Pedodontist)',
    department: 'Pediatric Dentistry',
    allergies: ['Dust'],
    vitals: {
      bp: '100/65',
      pulse: 88,
      spo2: 98,
      temp: 98.2,
      weight: 28
    },
    dentalNotes: 'Primary Molars #74, #84 Pit & Fissure Sealant application complete.',
    medicalHistory: ['Childhood Asthma (Mild)']
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'DOC-1',
    name: 'Dr. Sameer Joshi',
    specialization: 'Consultant Endodontist & Root Canal Specialist',
    department: 'Endodontics',
    experienceYears: 14,
    consultationFee: 0,
    nmcNo: 'NMC-D-1824',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    timeSlot: '09:00 AM - 02:00 PM',
    status: 'Available',
    phone: '+977 9841000001'
  },
  {
    id: 'DOC-2',
    name: 'Dr. Priya Sharma',
    specialization: 'Consultant Orthodontist (Braces & Aligners)',
    department: 'Orthodontics',
    experienceYears: 11,
    consultationFee: 0,
    nmcNo: 'NMC-D-2104',
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    timeSlot: '10:00 AM - 04:00 PM',
    status: 'In Procedure',
    phone: '+977 9841000002'
  },
  {
    id: 'DOC-3',
    name: 'Dr. Ramesh Adhikari',
    specialization: 'Oral & Maxillofacial Surgeon',
    department: 'Oral Surgery',
    experienceYears: 16,
    consultationFee: 0,
    nmcNo: 'NMC-D-1492',
    availableDays: ['Tue', 'Thu', 'Sat'],
    timeSlot: '11:00 AM - 05:00 PM',
    status: 'On Leave',
    phone: '+977 9841000003'
  },
  {
    id: 'DOC-4',
    name: 'Dr. Sunita Mahajan',
    specialization: 'Periodontist & Dental Implantologist',
    department: 'Periodontics',
    experienceYears: 12,
    consultationFee: 0,
    nmcNo: 'NMC-D-3021',
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    timeSlot: '08:00 AM - 01:00 PM',
    status: 'Break Time',
    phone: '+977 9841000004'
  },
  {
    id: 'DOC-5',
    name: 'Dr. Niraj Bhattarai',
    specialization: 'Consultant Pediatric Dentist (Pedodontist)',
    department: 'Pediatric Dentistry',
    experienceYears: 9,
    consultationFee: 0,
    nmcNo: 'NMC-D-2550',
    availableDays: ['Mon', 'Wed', 'Fri'],
    timeSlot: '01:00 PM - 06:00 PM',
    status: 'Busy',
    phone: '+977 9841000005'
  }
];

export const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

const getTomorrowDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-501',
    patientId: 'P-101',
    patientName: 'Aarav Shrestha',
    doctorId: 'DOC-1',
    doctorName: 'Dr. Sameer Joshi',
    department: 'Endodontics',
    date: getTodayDateString(),
    time: '09:30 AM',
    tokenNumber: 1,
    status: 'In Consultation',
    type: 'Procedure',
    notes: 'Root Canal Treatment Step 2 obturation Tooth #36.'
  },
  {
    id: 'APT-502',
    patientId: 'P-103',
    patientName: 'Bikash Thapa',
    doctorId: 'DOC-3',
    doctorName: 'Dr. Ramesh Adhikari',
    department: 'Oral Surgery',
    date: getTodayDateString(),
    time: '11:15 AM',
    tokenNumber: 2,
    status: 'Scheduled',
    type: 'OPD',
    notes: 'Pre-surgery evaluation for impacted 3rd molar #48.'
  },
  {
    id: 'APT-503',
    patientId: 'P-102',
    patientName: 'Sujata Karki',
    doctorId: 'DOC-2',
    doctorName: 'Dr. Priya Sharma',
    department: 'Orthodontics',
    date: getTodayDateString(),
    time: '12:00 PM',
    tokenNumber: 3,
    status: 'Scheduled',
    type: 'Follow-up',
    notes: 'Monthly wire adjustment and elastic change.'
  },
  {
    id: 'APT-504',
    patientId: 'P-105',
    patientName: 'Rohan Chaudhary',
    doctorId: 'DOC-5',
    doctorName: 'Dr. Niraj Bhattarai',
    department: 'Pediatric Dentistry',
    date: getTodayDateString(),
    time: '02:30 PM',
    tokenNumber: 4,
    status: 'Scheduled',
    type: 'OPD',
    notes: 'Primary dentition caries screening & fluoride varnish.'
  }
];

export const INITIAL_LAB_TESTS: DentalXRay[] = [
  {
    id: 'XRAY-801',
    patientId: 'P-101',
    patientName: 'Aarav Shrestha',
    xrayType: 'Dental X-Ray (RVG)',
    toothNumber: 'Tooth #36',
    orderDate: getTodayDateString(),
    status: 'Completed',
    findings: 'Well defined periapical radiolucency at mesial root tip of Tooth #36. Canal length measured 21mm.',
    doctorName: 'Dr. Sameer Joshi',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    urgent: false
  },
  {
    id: 'XRAY-802',
    patientId: 'P-103',
    patientName: 'Bikash Thapa',
    xrayType: 'Full Mouth (OPG)',
    toothNumber: 'Full Mouth / Quadrant 4',
    orderDate: getTodayDateString(),
    status: 'Completed',
    findings: 'Mesioangular impaction of Tooth #48 encroaching inferior alveolar nerve canal.',
    doctorName: 'Dr. Ramesh Adhikari',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    urgent: true
  },
  {
    id: 'XRAY-803',
    patientId: 'P-102',
    patientName: 'Sujata Karki',
    xrayType: 'Images',
    toothNumber: 'Full Facial / Cephalometric',
    orderDate: getTodayDateString(),
    status: 'Completed',
    findings: 'ANB angle 5 degrees indicating Class II skeletal profile.',
    doctorName: 'Dr. Priya Sharma',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    urgent: false
  }
];

export const INITIAL_PHARMACY: PharmacyItem[] = [
  {
    id: 'MED-1',
    name: 'Lidocaine 2% + Adrenaline Cartridges',
    category: 'Local Anesthesia',
    stock: 250,
    minStockThreshold: 50,
    unitPrice: 45.0,
    expiryDate: '2027-11-30',
    batchNumber: 'LA-2025-09',
    manufacturer: 'Septodont'
  },
  {
    id: 'MED-2',
    name: 'Amoxicillin 500mg Capsules',
    category: 'Antibiotics',
    stock: 80,
    minStockThreshold: 100,
    unitPrice: 12.0,
    expiryDate: '2026-12-15',
    batchNumber: 'BT-2025-11',
    manufacturer: 'Deurali-Janta Pharma'
  },
  {
    id: 'MED-3',
    name: 'Chlorhexidine 0.2% Mouthwash (150ml)',
    category: 'Antiseptic Rinse',
    stock: 140,
    minStockThreshold: 30,
    unitPrice: 180.0,
    expiryDate: '2028-03-20',
    batchNumber: 'CHX-2026-01',
    manufacturer: 'Cipla Dental'
  },
  {
    id: 'MED-4',
    name: 'Ketorolac DT 10mg (Dispersible)',
    category: 'Analgesics',
    stock: 320,
    minStockThreshold: 60,
    unitPrice: 15.0,
    expiryDate: '2027-08-10',
    batchNumber: 'KTR-2025-08',
    manufacturer: 'Lomus Pharmaceuticals'
  },
  {
    id: 'MED-5',
    name: 'Composite Resin Universal Shade A2',
    category: 'Restorative Material',
    stock: 25,
    minStockThreshold: 10,
    unitPrice: 1800.0,
    expiryDate: '2028-01-15',
    batchNumber: '3M-A2-998',
    manufacturer: '3M ESPE Dental'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-9001',
    invoiceNumber: 'INV-DENT-2026-089',
    patientId: 'P-101',
    patientName: 'Aarav Shrestha',
    patientAge: 34,
    patientGender: 'Male',
    patientPhone: '+977 9841234567',
    doctorName: 'Dr. Sameer Joshi (Endodontist)',
    date: '2026-08-03',
    panNumber: '609823412',
    items: [
      { description: 'Dental OPD Consultation & Oral Examination (Free Consultation)', quantity: 1, rate: 0, amount: 0 },
      { description: 'Root Canal Treatment (Molar RCT)', quantity: 1, rate: 6500, amount: 6500 },
      { description: 'Digital IOPA Periapical X-Ray (x2)', quantity: 2, rate: 350, amount: 700 }
    ],
    subtotal: 7200,
    discount: 0,
    tax: 0,
    total: 7200,
    paidAmount: 7200,
    dueAmount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'eSewa'
  },
  {
    id: 'INV-9002',
    invoiceNumber: 'INV-DENT-2026-090',
    patientId: 'P-103',
    patientName: 'Bikash Thapa',
    patientAge: 52,
    patientGender: 'Male',
    patientPhone: '+977 9813456789',
    doctorName: 'Dr. Ramesh Adhikari (Oral Surgeon)',
    date: '2026-08-03',
    panNumber: '609823412',
    items: [
      { description: 'Surgical Disimpaction Molar Extraction', quantity: 1, rate: 8500, amount: 8500 },
      { description: 'Digital OPG Panoramic Dental Scan', quantity: 1, rate: 1500, amount: 1500 }
    ],
    subtotal: 10000,
    discount: 500,
    tax: 0,
    total: 9500,
    paidAmount: 4000,
    dueAmount: 5500,
    paymentStatus: 'Partial',
    paymentMethod: 'Fonepay'
  }
];
