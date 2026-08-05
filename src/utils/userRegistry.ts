import { Role } from '../types';

export interface RegisteredClinicUser {
  email: string;
  name: string;
  role: Role;
  clinicName?: string;
  department?: string;
  createdAt?: string;
}

export const DEFAULT_REGISTERED_USERS: RegisteredClinicUser[] = [
  {
    email: 'superadmin@familydental.com.np',
    name: 'Super Admin',
    role: 'Super Admin',
    clinicName: 'Family Dental Hospital',
    department: 'Executive Administration',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'admin@familydental.com.np',
    name: 'Dr. Admin Sharma',
    role: 'Admin',
    clinicName: 'Family Dental Hospital',
    department: 'Practice Management',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'doctor@familydental.com.np',
    name: 'Dr. Rajesh Sharma',
    role: 'Doctor',
    clinicName: 'Family Dental Hospital',
    department: 'Orthodontics & Implants',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'reception@familydental.com.np',
    name: 'Anjali Thapa',
    role: 'Receptionist',
    clinicName: 'Family Dental Hospital',
    department: 'Front Desk & Scheduling',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'pharmacy@familydental.com.np',
    name: 'Bikash Shrestha',
    role: 'Pharmacist',
    clinicName: 'Family Dental Hospital',
    department: 'Pharmacy Services',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'patient@familydental.com.np',
    name: 'Aarav Sharma',
    role: 'Patient',
    clinicName: 'Family Dental Hospital',
    department: 'Patient Portal',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'staff@familydental.com.np',
    name: 'Suman Adhikari',
    role: 'Receptionist',
    clinicName: 'Family Dental Hospital',
    department: 'General Staff',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'admin@dentaplus.com',
    name: 'System Administrator',
    role: 'Admin',
    clinicName: 'DentaPlus Portal',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'doctor@dentaplus.com',
    name: 'Dr. S. K. Gurung',
    role: 'Doctor',
    clinicName: 'DentaPlus Portal',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'receptionist@dentaplus.com',
    name: 'Pooja Rai',
    role: 'Receptionist',
    clinicName: 'DentaPlus Portal',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'pharmacist@dentaplus.com',
    name: 'Sujan Adhikari',
    role: 'Pharmacist',
    clinicName: 'DentaPlus Portal',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    email: 'patient@dentaplus.com',
    name: 'Ramesh Karki',
    role: 'Patient',
    clinicName: 'DentaPlus Portal',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export function getRegisteredUsers(): RegisteredClinicUser[] {
  try {
    const saved = localStorage.getItem('dentaplus_registered_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading registered users from localStorage', e);
  }
  return DEFAULT_REGISTERED_USERS;
}

export function registerClinicUser(newUser: Omit<RegisteredClinicUser, 'createdAt'>): RegisteredClinicUser[] {
  const currentUsers = getRegisteredUsers();
  const normalizedEmail = newUser.email.trim().toLowerCase();
  
  // Exclude existing user if re-registering or updating
  const filtered = currentUsers.filter(u => u.email.toLowerCase() !== normalizedEmail);
  const createdRecord: RegisteredClinicUser = {
    ...newUser,
    email: normalizedEmail,
    name: newUser.name.trim() || normalizedEmail.split('@')[0].toUpperCase(),
    clinicName: newUser.clinicName || 'Family Dental Hospital',
    department: newUser.department || `${newUser.role} Department`,
    createdAt: new Date().toISOString()
  };

  const updated = [createdRecord, ...filtered];

  try {
    localStorage.setItem('dentaplus_registered_users', JSON.stringify(updated));
  } catch (e) {
    console.error('Error storing registered users in localStorage', e);
  }

  return updated;
}

export function deleteRegisteredUser(email: string): RegisteredClinicUser[] {
  const currentUsers = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const updated = currentUsers.filter(u => u.email.toLowerCase() !== normalizedEmail);

  try {
    localStorage.setItem('dentaplus_registered_users', JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting registered user from localStorage', e);
  }

  return updated;
}

export function findUserByEmail(email: string): RegisteredClinicUser | undefined {
  if (!email || !email.trim()) return undefined;
  const users = getRegisteredUsers();
  const normalized = email.trim().toLowerCase();
  
  const exactMatch = users.find(u => u.email.toLowerCase() === normalized);
  if (exactMatch) return exactMatch;

  // Domain fallback heuristic if email starts with doctor, admin, reception, pharmacy, patient
  if (normalized.includes('superadmin')) {
    return {
      email: normalized,
      name: 'Super Admin',
      role: 'Super Admin',
      department: 'Executive Management'
    };
  } else if (normalized.includes('doctor')) {
    return {
      email: normalized,
      name: `Dr. ${normalized.split('@')[0].replace(/[^a-zA-Z]/g, ' ').toUpperCase()}`,
      role: 'Doctor',
      department: 'Clinical Dental Care'
    };
  } else if (normalized.includes('reception') || normalized.includes('desk')) {
    return {
      email: normalized,
      name: normalized.split('@')[0].toUpperCase(),
      role: 'Receptionist',
      department: 'Front Desk'
    };
  } else if (normalized.includes('pharma')) {
    return {
      email: normalized,
      name: normalized.split('@')[0].toUpperCase(),
      role: 'Pharmacist',
      department: 'Pharmacy'
    };
  } else if (normalized.includes('patient')) {
    return {
      email: normalized,
      name: normalized.split('@')[0].toUpperCase(),
      role: 'Patient',
      department: 'Patient Care'
    };
  } else if (normalized.includes('admin')) {
    return {
      email: normalized,
      name: normalized.split('@')[0].toUpperCase(),
      role: 'Admin',
      department: 'Administration'
    };
  }

  return undefined;
}
