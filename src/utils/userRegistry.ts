export interface RegisteredClinicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  department?: string;
  clinicName?: string;
  createdAt?: string;
}

export const REGISTERED_USERS: RegisteredClinicUser[] = [
  {
    id: 'super-admin-1',
    name: 'Super Admin',
    email: 'officialnikilkhadka@gmail.com',
    role: 'Super Admin',
    is_active: true,
  },
];

export const getRegisteredUsers = (): RegisteredClinicUser[] => {
  return REGISTERED_USERS;
};

export const registerClinicUser = (user: Partial<RegisteredClinicUser>): RegisteredClinicUser => {
  const newUser: RegisteredClinicUser = {
    id: user.id || `user-${Date.now()}`,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'Admin',
    is_active: user.is_active ?? true,
    department: user.department,
    createdAt: new Date().toISOString(),
  };
  REGISTERED_USERS.push(newUser);
  return newUser;
};

export const deleteRegisteredUser = (id: string): void => {
  const index = REGISTERED_USERS.findIndex((u) => u.id === id);
  if (index !== -1) {
    REGISTERED_USERS.splice(index, 1);
  }
};

export const isEmailRegistered = (email: string): boolean => {
  return REGISTERED_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
};

export const getUserByEmail = (email: string): RegisteredClinicUser | undefined => {
  return REGISTERED_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
};

export const findUserByEmail = (email: string): RegisteredClinicUser | undefined => {
  return getUserByEmail(email);
};