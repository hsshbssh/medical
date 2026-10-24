// CareBridge AI — Core Type Definitions

// ============================================================
// User & Auth Types
// ============================================================

export type UserRole = 
  | 'bystander'
  | 'patient' 
  | 'hospital_responder'
  | 'clinician'
  | 'care_team'
  | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  facility_id?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  user_id?: string;
  full_name?: string;
  date_of_birth?: string;
  blood_group?: string;
  allergies?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  identity_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Incident Types
// ============================================================

export type IncidentStatus = 
  | 'draft'
  | 'submitted'
  | 'dispatching'
  | 'dispatched'
  | 'acknowledged'
  | 'in_review'
  | 'resolved'
  | 'closed';

export type IncidentCategory = 
  | 'road_accident'
  | 'fall'
  | 'burn'
  | 'assault'
  | 'medical_emergency'
  | 'workplace_injury'
  | 'sports_injury'
  | 'other';

export type PatientIdentityStatus = 
  | 'known'
  | 'unknown'
  | 'not_verified';

export type RoutingMode = 'demo' | 'integration' | 'unavailable';

export interface Incident {
  id: string;
  incident_id: string; // Human-readable ID like CB-20261024-XXXX
  reporter_id?: string;
  reporter_name?: string;
  reporter_phone?: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  location_address: string;
  location_description?: string;
  
  // Details
  incident_time: string;
  category: IncidentCategory;
  description: string;
  injury_description?: string;
  observations?: string;
  
  // Patient info
  patient_identity_status: PatientIdentityStatus;
  patient_name?: string;
  patient_age_approx?: string;
  patient_gender?: string;
  
  // Status
  status: IncidentStatus;
  routing_mode: RoutingMode;
  
  // Consent
  data_sharing_confirmed: boolean;
  consent_timestamp?: string;
  
  created_at: string;
  updated_at: string;
}

export interface IncidentAttachment {
  id: string;
  incident_id: string;
  storage_key: string;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_status: 'uploading' | 'uploaded' | 'failed' | 'deleted';
  privacy_notice_accepted: boolean;
  created_at: string;
}

// ============================================================
// QR Access Token Types
// ============================================================

export type TokenStatus = 'active' | 'expired' | 'revoked' | 'exhausted';

export interface QRAccessToken {
  id: string;
  incident_id: string;
  token_hash: string;
  permitted_scope: string[];
  expires_at: string;
  revoked_at?: string;
  max_uses: number;
  use_count: number;
  status: TokenStatus;
  created_by?: string;
  created_at: string;
}

export interface QRAccessLog {
  id: string;
  token_id: string;
  accessor_ip?: string;
  accessor_role?: string;
  access_result: 'granted' | 'denied_expired' | 'denied_revoked' | 'denied_exhausted' | 'denied_invalid';
  accessed_at: string;
}

// ============================================================
// Hospital & Facility Types
// ============================================================

export type FacilityType = 'government' | 'public' | 'private' | 'community_health_center';
export type FacilityParticipationStatus = 'active' | 'inactive' | 'pending' | 'demo';

export interface HospitalFacility {
  id: string;
  name: string;
  facility_type: FacilityType;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  emergency_department: boolean;
  participation_status: FacilityParticipationStatus;
  integration_endpoint?: string;
  is_demo: boolean;
  data_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Dispatch Types
// ============================================================

export type DispatchStatus = 
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivery_confirmed'
  | 'acknowledged'
  | 'accepted'
  | 'declined'
  | 'failed'
  | 'no_response'
  | 'demo_only';

export interface HospitalDispatch {
  id: string;
  incident_id: string;
  facility_id: string;
  facility?: HospitalFacility;
  status: DispatchStatus;
  attempt_count: number;
  distance_km?: number;
  dispatched_at?: string;
  acknowledged_at?: string;
  accepted_at?: string;
  declined_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Clinician Response Types
// ============================================================

export type ResponseType = 
  | 'acknowledgement'
  | 'initial_assessment'
  | 'consultation_note'
  | 'referral'
  | 'triage'
  | 'follow_up_instruction'
  | 'prescription';

export type ResponseStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'superseded';

export interface ClinicianResponse {
  id: string;
  incident_id: string;
  clinician_id: string;
  clinician_name?: string;
  response_type: ResponseType;
  content: string;
  clinical_notes?: string;
  status: ResponseStatus;
  is_primary_responder: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Prescription Types
// ============================================================

export type PrescriptionStatus = 'draft' | 'issued' | 'reviewed' | 'dispensed' | 'cancelled';

export interface Prescription {
  id: string;
  incident_id: string;
  clinician_response_id?: string;
  prescriber_id: string;
  prescriber_name?: string;
  patient_id?: string;
  medications: PrescriptionMedication[];
  clinical_notes?: string;
  status: PrescriptionStatus;
  issued_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
  warnings?: string;
}

// ============================================================
// Care Instructions Types
// ============================================================

export type InstructionApprovalStatus = 'draft' | 'ai_generated' | 'under_review' | 'approved' | 'rejected';

export interface CareInstruction {
  id: string;
  incident_id?: string;
  patient_id?: string;
  original_text: string;
  simplified_text?: string;
  simplified_text_hindi?: string;
  language: string;
  checklist_items?: ChecklistItem[];
  ai_model_used?: string;
  approval_status: InstructionApprovalStatus;
  author_id: string;
  author_name?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  category?: string;
  is_critical: boolean;
  is_completed: boolean;
}

// ============================================================
// Follow-up Types
// ============================================================

export type FollowUpStatus = 
  | 'scheduled'
  | 'reminder_pending'
  | 'reminder_sent'
  | 'confirmed'
  | 'completed'
  | 'missed'
  | 'cancelled'
  | 'rescheduled';

export type ReminderStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'demo_only';

export interface FollowUp {
  id: string;
  patient_id?: string;
  incident_id?: string;
  clinician_id?: string;
  care_team_member_id?: string;
  follow_up_date: string;
  follow_up_time: string;
  purpose: string;
  instructions?: string;
  status: FollowUpStatus;
  reminder_status: ReminderStatus;
  reminder_sent_at?: string;
  attendance_notes?: string;
  rescheduled_from?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Audit Types
// ============================================================

export type AuditEventType = 
  | 'incident_created'
  | 'incident_updated'
  | 'qr_generated'
  | 'qr_accessed'
  | 'qr_revoked'
  | 'dispatch_sent'
  | 'dispatch_acknowledged'
  | 'case_accepted'
  | 'case_declined'
  | 'clinician_response'
  | 'prescription_issued'
  | 'care_instruction_created'
  | 'care_instruction_approved'
  | 'followup_created'
  | 'followup_updated'
  | 'image_accessed'
  | 'login'
  | 'logout'
  | 'role_changed'
  | 'facility_updated';

export interface AuditEvent {
  id: string;
  actor_id?: string;
  actor_role?: string;
  event_type: AuditEventType;
  resource_type: string;
  resource_id: string;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  result: 'success' | 'failure' | 'denied';
  created_at: string;
}

// ============================================================
// Notification Types
// ============================================================

export type NotificationType = 
  | 'incident_update'
  | 'dispatch_received'
  | 'case_assigned'
  | 'response_received'
  | 'follow_up_reminder'
  | 'care_instruction_ready'
  | 'qr_expiring'
  | 'system';

export type NotificationDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'demo_only';

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  delivery_status: NotificationDeliveryStatus;
  read_at?: string;
  created_at: string;
}

// ============================================================
// Consent Types
// ============================================================

export type ConsentStatus = 'granted' | 'denied' | 'revoked' | 'expired';

export interface ConsentRecord {
  id: string;
  incident_id?: string;
  patient_id?: string;
  grantor_id?: string;
  purpose: string;
  scope: string[];
  status: ConsentStatus;
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  created_at: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
