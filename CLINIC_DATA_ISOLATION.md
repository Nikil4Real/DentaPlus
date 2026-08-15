# DentaPlus Clinic-Scoped Data Isolation

## Outcome

DentaPlus now uses a clinic-level multi-tenant model. A verified account receives a persistent `clinicId` from its Supabase `profiles.clinic_id` relationship. Patients, doctors, appointments, dental X-rays, pharmacy items, invoices, and prescriptions are loaded from and written to Supabase through authenticated server endpoints. Browser `localStorage` is no longer the source of truth for these records.

## What happens for two clinics

| Account | Clinic identity | Visible business data |
|---|---|---|
| `xyz@gmail.com` | One UUID in `clinic_info.id`, referenced by `profiles.clinic_id` | Only rows whose `clinic_id` is that UUID |
| `abc@gmail.com` | A different UUID in `clinic_info.id`, referenced by `profiles.clinic_id` | Only rows whose `clinic_id` is the second UUID |

The API does not trust a clinic ID sent by the browser. On every write, it takes the clinic ID from the signed session created after OTP verification. Updates and deletes additionally require both the record ID and the session clinic ID to match.

## Implemented changes

The OTP verification response and signed session now include `clinicId`. A first-login Super Admin without a clinic is provisioned with a unique `clinic_info` row and linked back to `profiles.clinic_id`.

A central frontend data service maps the existing camelCase UI models to the Supabase snake_case tables. Reads and writes for all EMR modules go through authenticated Vercel API routes. Clinic metadata is also read and updated through a session-scoped endpoint rather than selecting the first clinic row globally.

The Supabase migration makes `clinic_id` non-null on all business tables, adds clinic indexes, removes permissive public policies, and adds clinic-scoped RLS policies for authenticated Supabase sessions. The Vercel API still performs its own session validation because this application uses a custom OTP/JWT session.

## Verification completed

| Check | Result |
|---|---|
| Supabase tenant migration | Applied successfully to project `qwkeengyypixpkovtmsm` |
| RLS policy inspection | Clinic-scoped select/insert/update/delete policies present for all business tables |
| Frontend TypeScript lint | Passed |
| Production frontend build | Passed |
| Vercel production deployment | `READY` for commit `a551459af7746649f442c358e6e6e2faaa7f47ab` |
| GitHub commit | `a551459` — `Implement clinic-scoped Supabase persistence` |

## Important operational note

Existing business rows without a clinic ID are intentionally rejected by the migration rather than assigned incorrectly. The current live database had no unassigned business rows. If historical data is later found in another environment, it must be mapped to the correct clinic before enforcing the non-null constraint.

Supabase advisors still report pre-existing security-hardening warnings for legacy OTP and trigger functions with mutable `search_path`, plus a performance recommendation for one missing foreign-key index. These are separate from the clinic-isolation fix and should be addressed in a follow-up hardening migration.
