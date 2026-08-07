-- =============================================================================
-- Supabase PostgreSQL Database Schema for DentaPlus / Dental Clinic EMR
-- Compatible with Supabase Postgres, Row Level Security (RLS), & Auth
-- Dedicated Super Admin configuration for: officialnikilkhadka@gmail.com
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Super Admin', 'Admin', 'Doctor', 'Receptionist', 'Pharmacist', 'Patient');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_status') THEN
        CREATE TYPE patient_status AS ENUM ('Active', 'Completed', 'Follow-up Required');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('Scheduled', 'In Consultation', 'Completed', 'Cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_type') THEN
        CREATE TYPE appointment_type AS ENUM ('OPD', 'Follow-up', 'Procedure');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doctor_status') THEN
        CREATE TYPE doctor_status AS ENUM ('Available', 'In Procedure', 'On Leave', 'Break Time', 'Busy');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'xray_status') THEN
        CREATE TYPE xray_status AS ENUM ('Completed', 'Pending', 'Scheduled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('Paid', 'Pending', 'Partial');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('eSewa', 'Khalti', 'Fonepay', 'Cash', 'Card');
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. CLINIC INFO TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clinic_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- owner_id links each clinic row to its owning Super Admin profile.
    -- This enables multi-tenant isolation: each clinic has exactly one row.
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT,
    license_code TEXT,
    pan_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    established_year TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. PROFILES / USERS TABLE (Linked with Supabase Auth auth.users & OTP Auth)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'Admin',
    department TEXT,
    avatar_url TEXT,
    otp_code TEXT,
    otp_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically sync Supabase Auth users to public.profiles
-- Assigns 'Super Admin' role automatically if email matches officialnikilkhadka@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role user_role;
BEGIN
    IF LOWER(NEW.email) = 'officialnikilkhadka@gmail.com' THEN
        assigned_role := 'Super Admin'::user_role;
    ELSE
        assigned_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Admin'::user_role);
    END IF;

    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        LOWER(NEW.email),
        assigned_role
    )
    ON CONFLICT (email) DO UPDATE SET
        id = EXCLUDED.id,
        name = COALESCE(EXCLUDED.name, public.profiles.name),
        role = CASE 
            WHEN LOWER(EXCLUDED.email) = 'officialnikilkhadka@gmail.com' THEN 'Super Admin'::user_role
            ELSE public.profiles.role
        END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
            CREATE TRIGGER on_auth_user_created
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- OTP AUTHENTICATION FUNCTIONS FOR SUPABASE RPC
-- -----------------------------------------------------------------------------

-- 1. Function to request / generate 6-digit OTP code for passwordless login
CREATE OR REPLACE FUNCTION public.generate_otp(user_email TEXT, otp_val TEXT DEFAULT NULL)
RETURNS TABLE (
    success BOOLEAN,
    email TEXT,
    otp_code TEXT,
    expires_at TIMESTAMPTZ,
    user_role user_role,
    message TEXT
) AS $$
DECLARE
    gen_otp TEXT;
    v_role user_role;
BEGIN
    IF LOWER(user_email) = 'officialnikilkhadka@gmail.com' THEN
        v_role := 'Super Admin'::user_role;
    ELSE
        v_role := 'Admin'::user_role;
    END IF;

    gen_otp := COALESCE(otp_val, LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'));

    INSERT INTO public.profiles (id, name, email, role, otp_code, otp_expires_at)
    VALUES (
        gen_random_uuid(),
        split_part(user_email, '@', 1),
        LOWER(user_email),
        v_role,
        gen_otp,
        NOW() + INTERVAL '5 minutes'
    )
    ON CONFLICT (email) DO UPDATE SET
        otp_code = EXCLUDED.otp_code,
        otp_expires_at = NOW() + INTERVAL '5 minutes',
        role = CASE 
            WHEN LOWER(EXCLUDED.email) = 'officialnikilkhadka@gmail.com' THEN 'Super Admin'::user_role
            ELSE public.profiles.role
        END;

    RETURN QUERY
    SELECT 
        TRUE AS success,
        LOWER(user_email) AS email,
        gen_otp AS otp_code,
        (NOW() + INTERVAL '5 minutes') AS expires_at,
        p.role AS user_role,
        'OTP verification code generated successfully'::TEXT AS message
    FROM public.profiles p
    WHERE LOWER(p.email) = LOWER(user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to verify OTP code
CREATE OR REPLACE FUNCTION public.verify_otp(user_email TEXT, input_otp TEXT)
RETURNS TABLE (
    success BOOLEAN,
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    user_role user_role,
    message TEXT
) AS $$
DECLARE
    p_rec RECORD;
BEGIN
    SELECT * INTO p_rec 
    FROM public.profiles 
    WHERE LOWER(email) = LOWER(user_email);

    IF p_rec IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, ''::TEXT, LOWER(user_email), 'Admin'::user_role, 'User account not found'::TEXT;
        RETURN;
    END IF;

    IF p_rec.otp_code IS NULL OR p_rec.otp_code <> input_otp OR NOW() > p_rec.otp_expires_at THEN
        RETURN QUERY SELECT FALSE, p_rec.id, p_rec.name, p_rec.email, p_rec.role, 'Invalid or expired OTP verification code'::TEXT;
        RETURN;
    END IF;

    -- Clear used OTP
    UPDATE public.profiles
    SET otp_code = NULL,
        otp_expires_at = NULL,
        role = CASE 
            WHEN LOWER(email) = 'officialnikilkhadka@gmail.com' THEN 'Super Admin'::user_role 
            ELSE role 
        END
    WHERE id = p_rec.id;

    RETURN QUERY SELECT TRUE, p_rec.id, p_rec.name, p_rec.email, 
        CASE WHEN LOWER(p_rec.email) = 'officialnikilkhadka@gmail.com' THEN 'Super Admin'::user_role ELSE p_rec.role END,
        'OTP verification successful'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 3. DOCTORS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    department TEXT NOT NULL,
    experience_years INT DEFAULT 0,
    consultation_fee NUMERIC(10,2) DEFAULT 0.00,
    nmc_no TEXT NOT NULL,
    available_days TEXT[] DEFAULT '{}',
    time_slot TEXT,
    status doctor_status DEFAULT 'Available',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. PATIENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE NOT NULL,
    uhid TEXT,
    name TEXT NOT NULL,
    age INT NOT NULL,
    gender gender_type NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    blood_group TEXT,
    address TEXT,
    registered_date DATE DEFAULT CURRENT_DATE,
    last_visit DATE DEFAULT CURRENT_DATE,
    status patient_status DEFAULT 'Active',
    assigned_doctor TEXT,
    department TEXT,
    allergies TEXT[] DEFAULT '{}',
    vitals JSONB DEFAULT '{"bp": "120/80", "pulse": 72, "spo2": 98, "temp": 98.6, "weight": 70}'::jsonb,
    dental_notes TEXT,
    medical_history TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. APPOINTMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name TEXT NOT NULL,
    department TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    token_number INT NOT NULL,
    status appointment_status DEFAULT 'Scheduled',
    type appointment_type DEFAULT 'OPD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. PRESCRIPTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. DENTAL X-RAYS / LAB TESTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dental_xrays (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    xray_type TEXT NOT NULL,
    tooth_number TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    status xray_status DEFAULT 'Pending',
    findings TEXT,
    doctor_name TEXT NOT NULL,
    image_url TEXT,
    urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. PHARMACY ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pharmacy_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INT DEFAULT 0,
    min_stock_threshold INT DEFAULT 10,
    unit_price NUMERIC(10,2) NOT NULL,
    expiry_date DATE,
    batch_number TEXT,
    manufacturer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. INVOICES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_age INT,
    patient_gender TEXT,
    patient_phone TEXT,
    doctor_name TEXT,
    date DATE DEFAULT CURRENT_DATE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    tax NUMERIC(10,2) DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10,2) DEFAULT 0.00,
    due_amount NUMERIC(10,2) DEFAULT 0.00,
    payment_status payment_status DEFAULT 'Pending',
    payment_method payment_method DEFAULT 'Cash',
    pan_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ATTACH UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_clinic_info_updated_at') THEN
        CREATE TRIGGER tr_clinic_info_updated_at BEFORE UPDATE ON public.clinic_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_profiles_updated_at') THEN
        CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_doctors_updated_at') THEN
        CREATE TRIGGER tr_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_patients_updated_at') THEN
        CREATE TRIGGER tr_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_appointments_updated_at') THEN
        CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_prescriptions_updated_at') THEN
        CREATE TRIGGER tr_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_dental_xrays_updated_at') THEN
        CREATE TRIGGER tr_dental_xrays_updated_at BEFORE UPDATE ON public.dental_xrays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_pharmacy_items_updated_at') THEN
        CREATE TRIGGER tr_pharmacy_items_updated_at BEFORE UPDATE ON public.pharmacy_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_invoices_updated_at') THEN
        CREATE TRIGGER tr_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patients_reg_no ON public.patients(registration_number);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_dental_xrays_patient_id ON public.dental_xrays(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_clinic_info_owner_id ON public.clinic_info(owner_id);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- -----------------------------------------------------------------------------
ALTER TABLE public.clinic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_xrays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- clinic_info: per-owner RLS (multi-tenant isolation)
DROP POLICY IF EXISTS "Public read clinic_info"        ON public.clinic_info;
DROP POLICY IF EXISTS "Authenticated write clinic_info" ON public.clinic_info;
DROP POLICY IF EXISTS "Super Admin write clinic_info"   ON public.clinic_info;
DROP POLICY IF EXISTS "Owner read clinic_info"          ON public.clinic_info;
DROP POLICY IF EXISTS "Super Admin insert clinic_info"  ON public.clinic_info;
DROP POLICY IF EXISTS "Super Admin update clinic_info"  ON public.clinic_info;
DROP POLICY IF EXISTS "Super Admin delete clinic_info"  ON public.clinic_info;

-- Any authenticated user can read their own clinic's row
CREATE POLICY "Owner read clinic_info"
  ON public.clinic_info FOR SELECT
  USING (
    owner_id = (
      SELECT id FROM public.profiles
      WHERE LOWER(email) = LOWER(current_setting('request.jwt.claims', true)::json->>'email')
      LIMIT 1
    )
  );

-- Only the owning Super Admin can insert
CREATE POLICY "Super Admin insert clinic_info"
  ON public.clinic_info FOR INSERT
  WITH CHECK (
    owner_id = (
      SELECT id FROM public.profiles
      WHERE LOWER(email) = LOWER(current_setting('request.jwt.claims', true)::json->>'email')
        AND role = 'Super Admin'
      LIMIT 1
    )
  );

-- Only the owning Super Admin can update
CREATE POLICY "Super Admin update clinic_info"
  ON public.clinic_info FOR UPDATE
  USING (
    owner_id = (
      SELECT id FROM public.profiles
      WHERE LOWER(email) = LOWER(current_setting('request.jwt.claims', true)::json->>'email')
        AND role = 'Super Admin'
      LIMIT 1
    )
  );

-- Only the owning Super Admin can delete
CREATE POLICY "Super Admin delete clinic_info"
  ON public.clinic_info FOR DELETE
  USING (
    owner_id = (
      SELECT id FROM public.profiles
      WHERE LOWER(email) = LOWER(current_setting('request.jwt.claims', true)::json->>'email')
        AND role = 'Super Admin'
      LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "User update own profile" ON public.profiles;
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Authenticated & Anon Access Policies for Demo / Clinic App
DROP POLICY IF EXISTS "Allow read doctors" ON public.doctors;
CREATE POLICY "Allow read doctors" ON public.doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write doctors" ON public.doctors;
CREATE POLICY "Allow write doctors" ON public.doctors FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow select patients" ON public.patients;
CREATE POLICY "Allow select patients" ON public.patients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write patients" ON public.patients;
CREATE POLICY "Allow write patients" ON public.patients FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select appointments" ON public.appointments;
CREATE POLICY "Allow select appointments" ON public.appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write appointments" ON public.appointments;
CREATE POLICY "Allow write appointments" ON public.appointments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select prescriptions" ON public.prescriptions;
CREATE POLICY "Allow select prescriptions" ON public.prescriptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write prescriptions" ON public.prescriptions;
CREATE POLICY "Allow write prescriptions" ON public.prescriptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select dental_xrays" ON public.dental_xrays;
CREATE POLICY "Allow select dental_xrays" ON public.dental_xrays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write dental_xrays" ON public.dental_xrays;
CREATE POLICY "Allow write dental_xrays" ON public.dental_xrays FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select pharmacy_items" ON public.pharmacy_items;
CREATE POLICY "Allow select pharmacy_items" ON public.pharmacy_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write pharmacy_items" ON public.pharmacy_items;
CREATE POLICY "Allow write pharmacy_items" ON public.pharmacy_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow select invoices" ON public.invoices;
CREATE POLICY "Allow select invoices" ON public.invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write invoices" ON public.invoices;
CREATE POLICY "Allow write invoices" ON public.invoices FOR ALL USING (true);

-- -----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- -----------------------------------------------------------------------------
-- 1. Clinic Info Seed
INSERT INTO public.clinic_info (name, tagline, license_code, pan_number, address, phone, email, logo_url, established_year)
VALUES (
    'Kathmandu Dental Hospital & Implant Center',
    'Advanced Dental Care, Orthodontics & Implantology',
    'NMC-REG-2026-8891-KTM',
    '609823412',
    'Lazimpat, Kathmandu, Nepal',
    '+977 01-4410000 / +977 9801234567',
    'info@kathmandudental.com',
    '/dentaplus-logo.png',
    '2015'
) ON CONFLICT DO NOTHING;

-- 2. DEDICATED SUPER ADMIN PROFILE SEED FOR officialnikilkhadka@gmail.com
INSERT INTO public.profiles (id, name, email, role, department)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Nikil Khadka (Super Admin)',
    'officialnikilkhadka@gmail.com',
    'Super Admin'::user_role,
    'Executive Management'
) ON CONFLICT (email) DO UPDATE SET
    role = 'Super Admin'::user_role;

-- 3. Doctors Seed
INSERT INTO public.doctors (id, name, specialization, department, experience_years, consultation_fee, nmc_no, available_days, time_slot, status, phone)
VALUES 
    ('DOC-101', 'Dr. Sameer Joshi', 'Endodontist (Root Canal Specialist)', 'Endodontics', 12, 1000.00, 'NMC-D-1204', ARRAY['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], '09:00 AM - 02:00 PM', 'Available', '+977 9801122334'),
    ('DOC-102', 'Dr. Priya Sharma', 'Orthodontist (Braces & Aligners)', 'Orthodontics', 8, 1200.00, 'NMC-D-2109', ARRAY['Sunday', 'Tuesday', 'Thursday', 'Friday'], '10:00 AM - 04:00 PM', 'In Procedure', '+977 9802233445'),
    ('DOC-103', 'Dr. Ramesh Adhikari', 'Oral & Maxillofacial Surgeon', 'Oral Surgery', 15, 1500.00, 'NMC-D-0892', ARRAY['Monday', 'Wednesday', 'Friday'], '11:00 AM - 05:00 PM', 'Available', '+977 9803344556'),
    ('DOC-104', 'Dr. Sneha Shrestha', 'Pediatric Dentist (Pedodontist)', 'Pediatric Dentistry', 6, 800.00, 'NMC-D-3410', ARRAY['Sunday', 'Monday', 'Wednesday', 'Thursday'], '09:30 AM - 03:30 PM', 'On Leave', '+977 9804455667')
ON CONFLICT (id) DO NOTHING;
