// src/lib/dataService.ts
// Central data service — reads from and writes to Supabase for every table.
// Replaces the localStorage-based clinicStore.ts for all data operations.
//
// Architecture:
//   READS  → frontend (anon key) + .eq('clinic_id', clinicId)
//   WRITES → /api/data route (service role key, enforces session auth)
//
// Every row in every table has clinic_id so data is fully isolated per clinic.

import { supabase } from './supabaseClient';
import {
  Patient, Doctor, Appointment, DentalXRay,
  PharmacyItem, Invoice, Prescription,
} from '../types';

// ---------------------------------------------------------------------------
// Generic write helper — all mutations go through the server-side API
// so the service role key is never exposed to the browser.
// ---------------------------------------------------------------------------
async function apiWrite(action: string, table: string, payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, table, payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`apiWrite ${action}/${table} error:`, err);
    return false;
  }
  return true;
}

async function apiList(table: string): Promise<Record<string, unknown>[]> {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', table, payload: {} }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) throw new Error(body.error || `Failed to load ${table}`);
  return Array.isArray(body.data) ? body.data : [];
}

// ---------------------------------------------------------------------------
// Shape mappers: Supabase snake_case → frontend camelCase types
// ---------------------------------------------------------------------------
function patientFromRow(r: Record<string, unknown>): Patient {
  return {
    id: String(r.id ?? ''),
    registrationNumber: String(r.registration_number ?? ''),
    uhid: String(r.uhid ?? r.registration_number ?? ''),
    name: String(r.name ?? ''),
    age: Number(r.age ?? 0),
    gender: (r.gender as Patient['gender']) ?? 'Male',
    phone: String(r.phone ?? ''),
    email: String(r.email ?? ''),
    bloodGroup: String(r.blood_group ?? ''),
    address: String(r.address ?? ''),
    registeredDate: String(r.registered_date ?? ''),
    lastVisit: String(r.last_visit ?? ''),
    status: (r.status as Patient['status']) ?? 'Active',
    assignedDoctor: String(r.assigned_doctor ?? ''),
    department: String(r.department ?? ''),
    allergies: (r.allergies as string[]) ?? [],
    vitals: (r.vitals as Patient['vitals']) ?? { bp: '', pulse: 0, temp: 0, spo2: 0, weight: 0 },
    dentalNotes: String(r.dental_notes ?? ''),
    medicalHistory: (r.medical_history as string[]) ?? [],
  };
}

function doctorFromRow(r: Record<string, unknown>): Doctor {
  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    specialization: String(r.specialization ?? ''),
    department: String(r.department ?? ''),
    experienceYears: Number(r.experience_years ?? 0),
    consultationFee: Number(r.consultation_fee ?? 0),
    nmcNo: String(r.nmc_no ?? ''),
    availableDays: (r.available_days as string[]) ?? [],
    timeSlot: String(r.time_slot ?? ''),
    status: (r.status as Doctor['status']) ?? 'Available',
    phone: String(r.phone ?? ''),
  };
}

function appointmentFromRow(r: Record<string, unknown>): Appointment {
  return {
    id: String(r.id ?? ''),
    patientId: String(r.patient_id ?? ''),
    patientName: String(r.patient_name ?? ''),
    doctorId: String(r.doctor_id ?? ''),
    doctorName: String(r.doctor_name ?? ''),
    department: String(r.department ?? ''),
    date: String(r.date ?? ''),
    time: String(r.time ?? ''),
    tokenNumber: Number(r.token_number ?? 0),
    status: (r.status as Appointment['status']) ?? 'Scheduled',
    type: (r.type as Appointment['type']) ?? 'OPD',
    notes: String(r.notes ?? ''),
  };
}

function xrayFromRow(r: Record<string, unknown>): DentalXRay {
  return {
    id: String(r.id ?? ''),
    patientId: String(r.patient_id ?? ''),
    patientName: String(r.patient_name ?? ''),
    xrayType: String(r.xray_type ?? ''),
    toothNumber: String(r.tooth_number ?? ''),
    orderDate: String(r.order_date ?? ''),
    status: (r.status as DentalXRay['status']) ?? 'Pending',
    findings: String(r.findings ?? ''),
    doctorName: String(r.doctor_name ?? ''),
    imageUrl: String(r.image_url ?? ''),
    urgent: Boolean(r.urgent ?? false),
  };
}

function pharmacyFromRow(r: Record<string, unknown>): PharmacyItem {
  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    category: String(r.category ?? ''),
    stock: Number(r.stock ?? 0),
    minStockThreshold: Number(r.min_stock_threshold ?? 10),
    unitPrice: Number(r.unit_price ?? 0),
    expiryDate: String(r.expiry_date ?? ''),
    batchNumber: String(r.batch_number ?? ''),
    manufacturer: String(r.manufacturer ?? ''),
  };
}

function invoiceFromRow(r: Record<string, unknown>): Invoice {
  return {
    id: String(r.id ?? ''),
    invoiceNumber: String(r.invoice_number ?? ''),
    patientId: String(r.patient_id ?? ''),
    patientName: String(r.patient_name ?? ''),
    patientAge: Number(r.patient_age ?? 0),
    patientGender: String(r.patient_gender ?? ''),
    patientPhone: String(r.patient_phone ?? ''),
    doctorName: String(r.doctor_name ?? ''),
    date: String(r.date ?? ''),
    items: (r.items as Invoice['items']) ?? [],
    subtotal: Number(r.subtotal ?? 0),
    discount: Number(r.discount ?? 0),
    tax: Number(r.tax ?? 0),
    total: Number(r.total ?? 0),
    paidAmount: Number(r.paid_amount ?? 0),
    dueAmount: Number(r.due_amount ?? 0),
    paymentStatus: (r.payment_status as Invoice['paymentStatus']) ?? 'Pending',
    paymentMethod: (r.payment_method as Invoice['paymentMethod']) ?? 'Cash',
    panNumber: String(r.pan_number ?? ''),
  };
}

function prescriptionFromRow(r: Record<string, unknown>): Prescription {
  return {
    id: String(r.id ?? ''),
    patientId: String(r.patient_id ?? ''),
    patientName: String(r.patient_name ?? ''),
    doctorId: String(r.doctor_id ?? ''),
    doctorName: String(r.doctor_name ?? ''),
    date: String(r.date ?? ''),
    diagnosis: String(r.diagnosis ?? ''),
    medicines: (r.medicines as Prescription['medicines']) ?? [],
    notes: String(r.notes ?? ''),
  };
}

// ---------------------------------------------------------------------------
// READ operations — all filtered by clinic_id
// ---------------------------------------------------------------------------
export async function fetchPatients(_clinicId: string): Promise<Patient[]> {
  return (await apiList('patients')).map(patientFromRow);
}

export async function fetchDoctors(_clinicId: string): Promise<Doctor[]> {
  return (await apiList('doctors')).map(doctorFromRow);
}

export async function fetchAppointments(_clinicId: string): Promise<Appointment[]> {
  return (await apiList('appointments')).map(appointmentFromRow);
}

export async function fetchLabTests(_clinicId: string): Promise<DentalXRay[]> {
  return (await apiList('dental_xrays')).map(xrayFromRow);
}

export async function fetchPharmacy(_clinicId: string): Promise<PharmacyItem[]> {
  return (await apiList('pharmacy_items')).map(pharmacyFromRow);
}

export async function fetchInvoices(_clinicId: string): Promise<Invoice[]> {
  return (await apiList('invoices')).map(invoiceFromRow);
}

export async function fetchPrescriptions(_clinicId: string): Promise<Prescription[]> {
  return (await apiList('prescriptions')).map(prescriptionFromRow);
}

// ---------------------------------------------------------------------------
// WRITE operations — all go through /api/data (service role, server-side)
// ---------------------------------------------------------------------------

// PATIENTS
export const addPatient       = (p: Patient,  clinicId: string) => apiWrite('insert', 'patients', { ...toPatientRow(p), clinic_id: clinicId });
export const updatePatient    = (p: Patient,  clinicId: string) => apiWrite('update', 'patients', { ...toPatientRow(p), clinic_id: clinicId });
export const deletePatient    = (id: string,  clinicId: string) => apiWrite('delete', 'patients', { id, clinic_id: clinicId });

// DOCTORS
export const addDoctor        = (d: Doctor,   clinicId: string) => apiWrite('insert', 'doctors', { ...toDoctorRow(d), clinic_id: clinicId });
export const updateDoctor     = (d: Doctor,   clinicId: string) => apiWrite('update', 'doctors', { ...toDoctorRow(d), clinic_id: clinicId });
export const deleteDoctor     = (id: string,  clinicId: string) => apiWrite('delete', 'doctors', { id, clinic_id: clinicId });

// APPOINTMENTS
export const addAppointment        = (a: Appointment, clinicId: string) => apiWrite('insert', 'appointments', { ...toAppointmentRow(a), clinic_id: clinicId });
export const updateAppointmentStatus = (id: string, status: string, clinicId: string) => apiWrite('update', 'appointments', { id, status, clinic_id: clinicId });

// LAB / XRAYS
export const addLabTest       = (x: DentalXRay, clinicId: string) => apiWrite('insert', 'dental_xrays', { ...toXrayRow(x), clinic_id: clinicId });

// PHARMACY
export const addPharmacyItem     = (item: PharmacyItem, clinicId: string) => apiWrite('insert', 'pharmacy_items', { ...toPharmacyRow(item), clinic_id: clinicId });
export const updatePharmacyStock = (id: string, stock: number, clinicId: string) => apiWrite('update', 'pharmacy_items', { id, stock, clinic_id: clinicId });

// INVOICES
export const addInvoice       = (inv: Invoice, clinicId: string) => apiWrite('insert', 'invoices', { ...toInvoiceRow(inv), clinic_id: clinicId });
export const updateInvoicePayment = (id: string, paymentMethod: Invoice['paymentMethod'], clinicId: string) =>
  apiWrite('update', 'invoices', { id, payment_status: 'Paid', payment_method: paymentMethod, clinic_id: clinicId });

// PRESCRIPTIONS
export const addPrescription  = (rx: Prescription, clinicId: string) => apiWrite('insert', 'prescriptions', { ...toPrescriptionRow(rx), clinic_id: clinicId });

// ---------------------------------------------------------------------------
// Shape mappers: frontend camelCase → Supabase snake_case
// ---------------------------------------------------------------------------
function toPatientRow(p: Patient) {
  return {
    id: p.id, registration_number: p.registrationNumber, uhid: p.uhid,
    name: p.name, age: p.age, gender: p.gender, phone: p.phone,
    email: p.email, blood_group: p.bloodGroup, address: p.address,
    registered_date: p.registeredDate, last_visit: p.lastVisit,
    status: p.status, assigned_doctor: p.assignedDoctor, department: p.department,
    allergies: p.allergies, vitals: p.vitals,
    dental_notes: p.dentalNotes, medical_history: p.medicalHistory,
  };
}

function toDoctorRow(d: Doctor) {
  return {
    id: d.id, name: d.name, specialization: d.specialization,
    department: d.department, experience_years: d.experienceYears,
    consultation_fee: d.consultationFee, nmc_no: d.nmcNo,
    available_days: d.availableDays, time_slot: d.timeSlot,
    status: d.status, phone: d.phone,
  };
}

function toAppointmentRow(a: Appointment) {
  return {
    id: a.id, patient_id: a.patientId, patient_name: a.patientName,
    doctor_id: a.doctorId, doctor_name: a.doctorName, department: a.department,
    date: a.date, time: a.time, token_number: a.tokenNumber,
    status: a.status, type: a.type, notes: a.notes,
  };
}

function toXrayRow(x: DentalXRay) {
  return {
    id: x.id, patient_id: x.patientId, patient_name: x.patientName,
    xray_type: x.xrayType, tooth_number: x.toothNumber,
    order_date: x.orderDate, status: x.status, findings: x.findings,
    doctor_name: x.doctorName, image_url: x.imageUrl, urgent: x.urgent,
  };
}

function toPharmacyRow(item: PharmacyItem) {
  return {
    id: item.id, name: item.name, category: item.category, stock: item.stock,
    min_stock_threshold: item.minStockThreshold, unit_price: item.unitPrice,
    expiry_date: item.expiryDate, batch_number: item.batchNumber,
    manufacturer: item.manufacturer,
  };
}

function toInvoiceRow(inv: Invoice) {
  return {
    id: inv.id, invoice_number: inv.invoiceNumber,
    patient_id: inv.patientId, patient_name: inv.patientName,
    patient_age: inv.patientAge, patient_gender: inv.patientGender,
    patient_phone: inv.patientPhone, doctor_name: inv.doctorName,
    date: inv.date, items: inv.items, subtotal: inv.subtotal,
    discount: inv.discount, tax: inv.tax, total: inv.total,
    paid_amount: inv.paidAmount, due_amount: inv.dueAmount,
    payment_status: inv.paymentStatus, payment_method: inv.paymentMethod,
    pan_number: inv.panNumber,
  };
}

function toPrescriptionRow(rx: Prescription) {
  return {
    id: rx.id, patient_id: rx.patientId, patient_name: rx.patientName,
    doctor_id: rx.doctorId, doctor_name: rx.doctorName, date: rx.date,
    diagnosis: rx.diagnosis, medicines: rx.medicines, notes: rx.notes,
  };
}
