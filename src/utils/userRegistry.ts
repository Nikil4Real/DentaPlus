export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export const REGISTERED_USERS: UserRecord[] = [
  {
    id: 'super-admin-1',
    name: 'Super Admin',
    email: 'officialnikilkhadka@gmail.com',
    role: 'Super Admin',
    is_active: true,
  },
];

export const isEmailRegistered = (email: string): boolean => {
  return true; // Allows login attempts to proceed to Supabase check
};

export const getUserByEmail = (email: string): UserRecord | undefined => {
  return REGISTERED_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
};