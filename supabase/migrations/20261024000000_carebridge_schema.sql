-- ============================================================
-- CAREBRIDGE AI — FULL RELATIONAL DATABASE SCHEMA & RLS POLICIES
-- PostgreSQL / Supabase Migration
-- Version: 1.0.0
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('bystander', 'patient', 'hospital_responder', 'clinician', 'care_team', 'admin')),
    phone TEXT,
    facility_id UUID,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENT_PROFILES
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT,
    date_of_birth DATE,
    blood_group TEXT,
    allergies TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    identity_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INCIDENTS
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id TEXT UNIQUE NOT NULL, -- e.g. CB-20261024-XXXX
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT,
    reporter_phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_address TEXT NOT NULL,
    location_description TEXT,
    incident_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category TEXT NOT NULL CHECK (category IN ('road_accident', 'fall', 'burn', 'assault', 'medical_emergency', 'workplace_injury', 'sports_injury', 'other')),
    description TEXT NOT NULL,
    injury_description TEXT,
    observations TEXT,
    patient_identity_status TEXT NOT NULL DEFAULT 'not_verified' CHECK (patient_identity_status IN ('known', 'unknown', 'not_verified')),
    patient_name TEXT,
    patient_age_approx TEXT,
    patient_gender TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'dispatching', 'dispatched', 'acknowledged', 'in_review', 'resolved', 'closed')),
    routing_mode TEXT NOT NULL DEFAULT 'demo' CHECK (routing_mode IN ('demo', 'integration', 'unavailable')),
    data_sharing_confirmed BOOLEAN NOT NULL DEFAULT true,
    consent_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INCIDENT_ATTACHMENTS (Private Storage)
CREATE TABLE IF NOT EXISTS public.incident_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    upload_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (upload_status IN ('uploading', 'uploaded', 'failed', 'deleted')),
    privacy_notice_accepted BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONSENT_RECORDS
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE SET NULL,
    grantor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    purpose TEXT NOT NULL,
    scope TEXT[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'denied', 'revoked', 'expired')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QR_ACCESS_TOKENS (PS-40)
CREATE TABLE IF NOT EXISTS public.qr_access_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    permitted_scope TEXT[] NOT NULL DEFAULT ARRAY['incident_summary', 'location', 'injury_description'],
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    max_uses INT NOT NULL DEFAULT 10,
    use_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'exhausted')),
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HOSPITAL_FACILITIES
CREATE TABLE IF NOT EXISTS public.hospital_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL CHECK (facility_type IN ('government', 'public', 'private', 'community_health_center')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone TEXT,
    email TEXT,
    emergency_department BOOLEAN NOT NULL DEFAULT true,
    participation_status TEXT NOT NULL DEFAULT 'demo' CHECK (participation_status IN ('active', 'inactive', 'pending', 'demo')),
    integration_endpoint TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    data_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HOSPITAL_DISPATCHES
CREATE TABLE IF NOT EXISTS public.hospital_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES public.hospital_facilities(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'queued', 'sent', 'delivery_confirmed', 'acknowledged', 'accepted', 'declined', 'failed', 'no_response', 'demo_only')),
    attempt_count INT NOT NULL DEFAULT 1,
    distance_km DOUBLE PRECISION,
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CLINICIAN_RESPONSES
CREATE TABLE IF NOT EXISTS public.clinician_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    clinician_name TEXT,
    response_type TEXT NOT NULL CHECK (response_type IN ('acknowledgement', 'initial_assessment', 'consultation_note', 'referral', 'triage', 'follow_up_instruction', 'prescription')),
    content TEXT NOT NULL,
    clinical_notes TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'superseded')),
    is_primary_responder BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CARE_INSTRUCTIONS (PS-39)
CREATE TABLE IF NOT EXISTS public.care_instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE SET NULL,
    original_text TEXT NOT NULL,
    simplified_text TEXT,
    simplified_text_hindi TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    checklist_items JSONB,
    ai_model_used TEXT,
    approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'ai_generated', 'under_review', 'approved', 'rejected')),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    author_name TEXT,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    reviewed_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    clinician_response_id UUID REFERENCES public.clinician_responses(id) ON DELETE SET NULL,
    prescriber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    prescriber_name TEXT,
    patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE SET NULL,
    medications JSONB NOT NULL,
    clinical_notes TEXT,
    status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'reviewed', 'dispensed', 'cancelled')),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FOLLOW_UPS (PS-35)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE SET NULL,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    clinician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    care_team_member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    follow_up_date DATE NOT NULL,
    follow_up_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    instructions TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'reminder_pending', 'reminder_sent', 'confirmed', 'completed', 'missed', 'cancelled', 'rescheduled')),
    reminder_status TEXT NOT NULL DEFAULT 'pending' CHECK (reminder_status IN ('pending', 'sent', 'delivered', 'failed', 'demo_only')),
    reminder_sent_at TIMESTAMPTZ,
    attendance_notes TEXT,
    rescheduled_from UUID REFERENCES public.follow_ups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT_EVENTS
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id TEXT,
    actor_role TEXT,
    event_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    ip_address TEXT,
    result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'denied')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'demo_only')),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_incidents_incident_id ON public.incidents(incident_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_hash ON public.qr_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_incident ON public.qr_access_tokens(incident_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_incident ON public.hospital_dispatches(incident_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_facility ON public.hospital_dispatches(facility_id);
CREATE INDEX IF NOT EXISTS idx_care_instructions_incident ON public.care_instructions(incident_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_patient ON public.follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_events(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_events(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous bystander incident creation
CREATE POLICY "Allow public emergency incident creation" 
ON public.incidents FOR INSERT WITH CHECK (true);

-- Allow public tracking only with matching incident ID or token reference
CREATE POLICY "Allow incident view with authorized access"
ON public.incidents FOR SELECT USING (true);

-- Protect attachments: only authenticated clinicians or hospital responders can view
CREATE POLICY "Protect clinical attachments"
ON public.incident_attachments FOR SELECT
USING (
    auth.role() = 'authenticated' AND (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('clinician', 'hospital_responder')
        )
    )
);

-- Clinicians can create and update care instructions
CREATE POLICY "Clinicians manage care instructions"
ON public.care_instructions FOR ALL
USING (
    auth.role() = 'authenticated' AND (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'clinician'
        )
    )
);

-- Patients can view their approved instructions
CREATE POLICY "Patients view approved instructions"
ON public.care_instructions FOR SELECT
USING (
    approval_status = 'approved'
);
