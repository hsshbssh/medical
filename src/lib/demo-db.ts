// CareBridge AI — In-Memory Demo Database
// Provides a complete working demo without requiring Supabase
// All data is clearly labelled as synthetic/demo

import type {
  Incident, IncidentAttachment, QRAccessToken, QRAccessLog,
  HospitalFacility, HospitalDispatch, ClinicianResponse,
  CareInstruction, Prescription, FollowUp, AuditEvent,
  Notification, ConsentRecord, PatientProfile,
  IncidentStatus, DispatchStatus, FollowUpStatus, TokenStatus,
} from './types';

// ============================================================
// Utility: Generate IDs
// ============================================================

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

export function generateIncidentId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CB-${date}-${rand}`;
}

export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================
// Seed Data: Demo Hospital Facilities
// ============================================================

const DEMO_FACILITIES: HospitalFacility[] = [
  {
    id: 'demo-facility-001',
    name: 'AIIMS Delhi (Demo)',
    facility_type: 'government',
    address: 'Sri Aurobindo Marg, Ansari Nagar',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.5672,
    longitude: 77.2100,
    phone: '+91-11-26588500',
    email: 'emergency@aiims-demo.gov.in',
    emergency_department: true,
    participation_status: 'demo',
    is_demo: true,
    data_verified_at: '2026-01-15T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'demo-facility-002',
    name: 'Safdarjung Hospital (Demo)',
    facility_type: 'government',
    address: 'Ring Road, Ansari Nagar West',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.5685,
    longitude: 77.2065,
    phone: '+91-11-26707437',
    email: 'emergency@safdarjung-demo.gov.in',
    emergency_department: true,
    participation_status: 'demo',
    is_demo: true,
    data_verified_at: '2026-01-10T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'demo-facility-003',
    name: 'GTB Hospital (Demo)',
    facility_type: 'government',
    address: 'Dilshad Garden',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.6820,
    longitude: 77.3163,
    phone: '+91-11-22586262',
    email: 'emergency@gtb-demo.gov.in',
    emergency_department: true,
    participation_status: 'demo',
    is_demo: true,
    data_verified_at: '2026-02-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'demo-facility-004',
    name: 'RML Hospital (Demo)',
    facility_type: 'government',
    address: 'Baba Kharak Singh Marg',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.6271,
    longitude: 77.2089,
    phone: '+91-11-23404446',
    email: 'emergency@rml-demo.gov.in',
    emergency_department: true,
    participation_status: 'demo',
    is_demo: true,
    data_verified_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'demo-facility-005',
    name: 'LNJP Hospital (Demo)',
    facility_type: 'government',
    address: 'Jawaharlal Nehru Marg',
    city: 'New Delhi',
    state: 'Delhi',
    latitude: 28.6365,
    longitude: 77.2397,
    phone: '+91-11-23232400',
    email: 'emergency@lnjp-demo.gov.in',
    emergency_department: true,
    participation_status: 'demo',
    is_demo: true,
    data_verified_at: '2026-02-05T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-05T00:00:00Z',
  },
];

// ============================================================
// Seed Data: Demo Incident
// ============================================================

export const demoQrToken = generateSecureToken();
export const expiredQrToken = generateSecureToken();
export const revokedQrToken = generateSecureToken();

const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'demo-incident-001',
    incident_id: 'CB-20261024-A1B2',
    reporter_id: 'demo-bystander-001',
    reporter_name: 'Rahul Sharma',
    reporter_phone: '+91-9876543210',
    latitude: 28.6139,
    longitude: 77.2090,
    location_address: 'Connaught Place, New Delhi, Delhi 110001',
    location_description: 'Near the central fountain at Gate 4',
    incident_time: '2026-10-24T10:30:00+05:30',
    category: 'road_accident',
    description: 'Two-wheeler collision with auto-rickshaw at the intersection. Rider appears to have injuries on left arm and knee.',
    injury_description: 'Visible abrasion on left forearm, possible fracture suspected on left knee. Patient is conscious and alert.',
    observations: 'Patient was wearing helmet. Bleeding has been controlled with a clean cloth. Patient is able to talk but in significant pain.',
    patient_identity_status: 'not_verified',
    patient_name: 'Unknown male',
    patient_age_approx: '25-30',
    patient_gender: 'male',
    status: 'acknowledged',
    routing_mode: 'demo',
    data_sharing_confirmed: true,
    consent_timestamp: '2026-10-24T10:35:00+05:30',
    created_at: '2026-10-24T10:32:00+05:30',
    updated_at: '2026-10-24T10:45:00+05:30',
  },
];

const DEMO_QR_TOKENS: QRAccessToken[] = [
  {
    id: 'demo-qr-001',
    incident_id: 'demo-incident-001',
    token_hash: demoQrToken,
    permitted_scope: ['incident_summary', 'location', 'injury_description', 'patient_status'],
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    max_uses: 10,
    use_count: 2,
    status: 'active',
    created_by: 'demo-bystander-001',
    created_at: '2026-10-24T10:35:00+05:30',
  },
  {
    id: 'demo-qr-002',
    incident_id: 'demo-incident-001',
    token_hash: expiredQrToken,
    permitted_scope: ['incident_summary'],
    expires_at: '2026-10-23T10:35:00+05:30', // Yesterday - expired
    max_uses: 5,
    use_count: 3,
    status: 'expired',
    created_by: 'demo-bystander-001',
    created_at: '2026-10-23T10:35:00+05:30',
  },
  {
    id: 'demo-qr-003',
    incident_id: 'demo-incident-001',
    token_hash: revokedQrToken,
    permitted_scope: ['incident_summary', 'location'],
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    revoked_at: '2026-10-24T11:00:00+05:30',
    max_uses: 10,
    use_count: 1,
    status: 'revoked',
    created_by: 'demo-bystander-001',
    created_at: '2026-10-24T09:00:00+05:30',
  },
];

const DEMO_DISPATCHES: HospitalDispatch[] = [
  {
    id: 'demo-dispatch-001',
    incident_id: 'demo-incident-001',
    facility_id: 'demo-facility-001',
    status: 'acknowledged',
    attempt_count: 1,
    distance_km: 5.2,
    dispatched_at: '2026-10-24T10:36:00+05:30',
    acknowledged_at: '2026-10-24T10:38:00+05:30',
    created_at: '2026-10-24T10:36:00+05:30',
    updated_at: '2026-10-24T10:38:00+05:30',
  },
  {
    id: 'demo-dispatch-002',
    incident_id: 'demo-incident-001',
    facility_id: 'demo-facility-002',
    status: 'sent',
    attempt_count: 1,
    distance_km: 5.4,
    dispatched_at: '2026-10-24T10:36:00+05:30',
    created_at: '2026-10-24T10:36:00+05:30',
    updated_at: '2026-10-24T10:36:00+05:30',
  },
  {
    id: 'demo-dispatch-003',
    incident_id: 'demo-incident-001',
    facility_id: 'demo-facility-004',
    status: 'demo_only',
    attempt_count: 0,
    distance_km: 6.1,
    created_at: '2026-10-24T10:36:00+05:30',
    updated_at: '2026-10-24T10:36:00+05:30',
  },
];

const DEMO_CLINICIAN_RESPONSES: ClinicianResponse[] = [
  {
    id: 'demo-response-001',
    incident_id: 'demo-incident-001',
    clinician_id: 'demo-clinician-001',
    clinician_name: 'Dr. Meera Reddy',
    response_type: 'initial_assessment',
    content: 'Based on the reported injuries: visible abrasion on left forearm and possible fracture of left knee. Patient should be brought to emergency department for X-ray and proper wound management. Do not allow the patient to put weight on the injured leg.',
    clinical_notes: 'Initial remote assessment based on bystander report. In-person evaluation required. Recommended immediate transport to nearest emergency facility.',
    status: 'approved',
    is_primary_responder: true,
    created_at: '2026-10-24T10:42:00+05:30',
    updated_at: '2026-10-24T10:45:00+05:30',
  },
];

const DEMO_CARE_INSTRUCTIONS: CareInstruction[] = [
  {
    id: 'demo-instruction-001',
    incident_id: 'demo-incident-001',
    patient_id: 'demo-patient-001',
    original_text: 'Post-initial assessment care: 1. Immobilize the left lower extremity using available splinting material. 2. Clean the forearm abrasion with normal saline and apply sterile dressing. 3. Monitor for signs of compartment syndrome including increasing pain, pallor, pulselessness, paresthesia. 4. Administer analgesic as prescribed - Tab. Paracetamol 500mg PO every 6 hours for pain, maximum 4 doses in 24 hours. 5. Apply ice pack to knee region for 15-20 minutes every 2 hours. 6. Keep limb elevated above heart level when resting. 7. Follow up at orthopedic OPD within 48 hours for X-ray review. 8. Return immediately if: increasing swelling, numbness/tingling, fever >100.4F, wound shows signs of infection (redness, warmth, discharge).',
    simplified_text: 'Your Care Instructions (Easy to understand):\n\n1. DO NOT move or put weight on your left leg — keep it still and supported.\n2. Clean the scrape on your left arm gently with clean water and cover it with a clean bandage.\n3. Watch for danger signs on your leg: more pain, skin turning pale/white, tingling or numbness.\n4. For pain: Take 1 Paracetamol tablet (500mg) every 6 hours. Do NOT take more than 4 tablets in one day.\n5. Put an ice pack (wrapped in cloth) on your knee for 15-20 minutes, then remove. Repeat every 2 hours.\n6. When resting, keep your leg raised higher than your chest (use pillows).\n7. IMPORTANT: Visit the bone specialist (Orthopedic) clinic within 2 days for an X-ray.\n8. Go to the hospital RIGHT AWAY if you notice: more swelling, numbness or tingling, fever, or the wound looks red/warm/has discharge.',
    simplified_text_hindi: 'आपकी देखभाल के निर्देश (सरल भाषा में):\n\n1. अपने बाएं पैर पर वजन न डालें — इसे स्थिर और सहारा देकर रखें।\n2. बाएं हाथ की खरोंच को साफ पानी से धोएं और साफ पट्टी से ढकें।\n3. पैर पर खतरे के संकेत देखें: अधिक दर्द, त्वचा का पीला/सफेद होना, झुनझुनी या सुन्नपन।\n4. दर्द के लिए: हर 6 घंटे में 1 पैरासिटामोल टैबलेट (500mg) लें। एक दिन में 4 से अधिक गोलियां न लें।\n5. अपने घुटने पर आइस पैक (कपड़े में लपेटकर) 15-20 मिनट के लिए रखें, फिर हटाएं। हर 2 घंटे में दोहराएं।\n6. आराम करते समय अपने पैर को छाती से ऊपर रखें (तकिए का उपयोग करें)।\n7. महत्वपूर्ण: 2 दिनों के अंदर हड्डी विशेषज्ञ (ऑर्थोपेडिक) क्लिनिक में एक्स-रे के लिए जाएं।\n8. तुरंत अस्पताल जाएं अगर: अधिक सूजन, सुन्नपन या झुनझुनी, बुखार, या घाव लाल/गर्म दिखे या उसमें से कुछ निकले।',
    language: 'en',
    checklist_items: [
      { id: 'cl-1', text: 'Keep left leg immobilized', category: 'Immediate', is_critical: true, is_completed: false },
      { id: 'cl-2', text: 'Clean and dress forearm wound', category: 'Wound Care', is_critical: false, is_completed: true },
      { id: 'cl-3', text: 'Take Paracetamol 500mg (max 4/day)', category: 'Medication', is_critical: true, is_completed: false },
      { id: 'cl-4', text: 'Apply ice to knee every 2 hours', category: 'Treatment', is_critical: false, is_completed: false },
      { id: 'cl-5', text: 'Keep leg elevated when resting', category: 'Treatment', is_critical: false, is_completed: false },
      { id: 'cl-6', text: 'Visit Orthopedic OPD within 48 hours', category: 'Follow-up', is_critical: true, is_completed: false },
      { id: 'cl-7', text: 'Monitor for danger signs', category: 'Safety', is_critical: true, is_completed: false },
    ],
    ai_model_used: 'gemini-2.0-flash',
    approval_status: 'approved',
    author_id: 'demo-clinician-001',
    author_name: 'Dr. Meera Reddy',
    reviewer_id: 'demo-clinician-001',
    reviewer_name: 'Dr. Meera Reddy',
    reviewed_at: '2026-10-24T11:00:00+05:30',
    version: 1,
    created_at: '2026-10-24T10:50:00+05:30',
    updated_at: '2026-10-24T11:00:00+05:30',
  },
];

const DEMO_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'demo-prescription-001',
    incident_id: 'demo-incident-001',
    clinician_response_id: 'demo-response-001',
    prescriber_id: 'demo-clinician-001',
    prescriber_name: 'Dr. Meera Reddy',
    patient_id: 'demo-patient-001',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Every 6 hours',
        duration: '3 days',
        route: 'Oral',
        instructions: 'Take with food. Do not exceed 4 tablets in 24 hours.',
        warnings: 'Do not take with other paracetamol-containing medicines. Avoid alcohol.',
      },
    ],
    clinical_notes: 'Analgesic for pain management following road accident injury. Pending in-person assessment.',
    status: 'issued',
    issued_at: '2026-10-24T10:50:00+05:30',
    created_at: '2026-10-24T10:48:00+05:30',
    updated_at: '2026-10-24T10:50:00+05:30',
  },
];

const DEMO_FOLLOWUPS: FollowUp[] = [
  {
    id: 'demo-followup-001',
    patient_id: 'demo-patient-001',
    incident_id: 'demo-incident-001',
    clinician_id: 'demo-clinician-001',
    care_team_member_id: 'demo-careteam-001',
    follow_up_date: '2026-10-26',
    follow_up_time: '10:00',
    purpose: 'X-ray review and orthopedic consultation',
    instructions: 'Bring previous reports if any. Fast not required.',
    status: 'scheduled',
    reminder_status: 'pending',
    created_at: '2026-10-24T11:00:00+05:30',
    updated_at: '2026-10-24T11:00:00+05:30',
  },
  {
    id: 'demo-followup-002',
    patient_id: 'demo-patient-001',
    incident_id: 'demo-incident-001',
    clinician_id: 'demo-clinician-001',
    care_team_member_id: 'demo-careteam-001',
    follow_up_date: '2026-10-22',
    follow_up_time: '14:00',
    purpose: 'Wound dressing change',
    instructions: 'Visit wound care clinic, Building 3, Room 204.',
    status: 'missed',
    reminder_status: 'sent',
    reminder_sent_at: '2026-10-22T08:00:00+05:30',
    attendance_notes: 'Patient did not attend. Attempted phone contact — no response.',
    created_at: '2026-10-20T11:00:00+05:30',
    updated_at: '2026-10-22T15:00:00+05:30',
  },
];

const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'demo-audit-001',
    actor_id: 'demo-bystander-001',
    actor_role: 'bystander',
    event_type: 'incident_created',
    resource_type: 'incident',
    resource_id: 'demo-incident-001',
    description: 'Emergency incident report submitted',
    result: 'success',
    created_at: '2026-10-24T10:32:00+05:30',
  },
  {
    id: 'demo-audit-002',
    actor_id: 'demo-bystander-001',
    actor_role: 'bystander',
    event_type: 'qr_generated',
    resource_type: 'qr_access_token',
    resource_id: 'demo-qr-001',
    description: 'QR access token generated for incident CB-20261024-A1B2',
    result: 'success',
    created_at: '2026-10-24T10:35:00+05:30',
  },
  {
    id: 'demo-audit-003',
    actor_id: 'system',
    actor_role: 'system',
    event_type: 'dispatch_sent',
    resource_type: 'hospital_dispatch',
    resource_id: 'demo-dispatch-001',
    description: 'Incident dispatched to AIIMS Delhi (Demo) — demo mode',
    result: 'success',
    created_at: '2026-10-24T10:36:00+05:30',
  },
  {
    id: 'demo-audit-004',
    actor_id: 'demo-hospital-001',
    actor_role: 'hospital_responder',
    event_type: 'dispatch_acknowledged',
    resource_type: 'hospital_dispatch',
    resource_id: 'demo-dispatch-001',
    description: 'AIIMS Delhi (Demo) acknowledged receipt of incident',
    result: 'success',
    created_at: '2026-10-24T10:38:00+05:30',
  },
  {
    id: 'demo-audit-005',
    actor_id: 'demo-clinician-001',
    actor_role: 'clinician',
    event_type: 'clinician_response',
    resource_type: 'clinician_response',
    resource_id: 'demo-response-001',
    description: 'Initial assessment submitted by Dr. Meera Reddy',
    result: 'success',
    created_at: '2026-10-24T10:42:00+05:30',
  },
  {
    id: 'demo-audit-006',
    actor_id: 'demo-clinician-001',
    actor_role: 'clinician',
    event_type: 'care_instruction_approved',
    resource_type: 'care_instruction',
    resource_id: 'demo-instruction-001',
    description: 'Care instructions approved by Dr. Meera Reddy',
    result: 'success',
    created_at: '2026-10-24T11:00:00+05:30',
  },
];

const DEMO_PATIENT_PROFILES: PatientProfile[] = [
  {
    id: 'demo-patient-001',
    user_id: 'demo-patient-001',
    full_name: 'Priya Patel',
    date_of_birth: '1996-05-15',
    blood_group: 'B+',
    allergies: 'None known',
    emergency_contact_name: 'Rajesh Patel',
    emergency_contact_phone: '+91-9876543220',
    identity_verified: true,
    created_at: '2026-10-24T10:40:00+05:30',
    updated_at: '2026-10-24T10:40:00+05:30',
  },
];

// ============================================================
// Demo Database Store
// ============================================================

class DemoDatabase {
  incidents: Incident[] = [...DEMO_INCIDENTS];
  attachments: IncidentAttachment[] = [];
  qrTokens: QRAccessToken[] = [...DEMO_QR_TOKENS];
  qrAccessLogs: QRAccessLog[] = [];
  facilities: HospitalFacility[] = [...DEMO_FACILITIES];
  dispatches: HospitalDispatch[] = [...DEMO_DISPATCHES];
  clinicianResponses: ClinicianResponse[] = [...DEMO_CLINICIAN_RESPONSES];
  careInstructions: CareInstruction[] = [...DEMO_CARE_INSTRUCTIONS];
  prescriptions: Prescription[] = [...DEMO_PRESCRIPTIONS];
  followUps: FollowUp[] = [...DEMO_FOLLOWUPS];
  auditEvents: AuditEvent[] = [...DEMO_AUDIT_EVENTS];
  notifications: Notification[] = [];
  consentRecords: ConsentRecord[] = [];
  patientProfiles: PatientProfile[] = [...DEMO_PATIENT_PROFILES];

  // Incident CRUD
  createIncident(data: Omit<Incident, 'id' | 'incident_id' | 'created_at' | 'updated_at'>): Incident {
    const incident: Incident = {
      ...data,
      id: generateId(),
      incident_id: generateIncidentId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.incidents.push(incident);
    return incident;
  }

  getIncident(id: string): Incident | undefined {
    return this.incidents.find(i => i.id === id || i.incident_id === id);
  }

  getIncidentsByReporter(reporterId: string): Incident[] {
    return this.incidents.filter(i => i.reporter_id === reporterId);
  }

  updateIncidentStatus(id: string, status: IncidentStatus): Incident | undefined {
    const incident = this.incidents.find(i => i.id === id);
    if (incident) {
      incident.status = status;
      incident.updated_at = new Date().toISOString();
    }
    return incident;
  }

  getAllIncidents(): Incident[] {
    return [...this.incidents];
  }

  // QR Token CRUD
  createQRToken(data: Omit<QRAccessToken, 'id' | 'created_at'>): QRAccessToken {
    const token: QRAccessToken = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    this.qrTokens.push(token);
    return token;
  }

  getQRToken(tokenHash: string): QRAccessToken | undefined {
    return this.qrTokens.find(t => 
      t.token_hash === tokenHash || 
      t.id === tokenHash || 
      (tokenHash === 'demo' && t.status === 'active')
    );
  }

  getQRTokensByIncident(incidentId: string): QRAccessToken[] {
    return this.qrTokens.filter(t => t.incident_id === incidentId);
  }

  validateQRToken(tokenHash: string): { valid: boolean; reason?: string; token?: QRAccessToken } {
    const token = this.qrTokens.find(t => 
      t.token_hash === tokenHash || 
      t.id === tokenHash || 
      (tokenHash === 'demo' && t.status === 'active')
    );
    if (!token) return { valid: false, reason: 'Token not found' };
    if (token.status === 'revoked') return { valid: false, reason: 'Token has been revoked' };
    if (token.status === 'expired' || new Date(token.expires_at) < new Date()) {
      token.status = 'expired';
      return { valid: false, reason: 'Token has expired' };
    }
    if (token.use_count >= token.max_uses) {
      token.status = 'exhausted';
      return { valid: false, reason: 'Token has reached maximum uses' };
    }
    token.use_count++;
    return { valid: true, token };
  }

  revokeQRToken(tokenId: string): boolean {
    const token = this.qrTokens.find(t => t.id === tokenId);
    if (token) {
      token.status = 'revoked';
      token.revoked_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  logQRAccess(data: Omit<QRAccessLog, 'id' | 'accessed_at'>): QRAccessLog {
    const log: QRAccessLog = {
      ...data,
      id: generateId(),
      accessed_at: new Date().toISOString(),
    };
    this.qrAccessLogs.push(log);
    return log;
  }

  // Facility CRUD
  getFacilities(): HospitalFacility[] {
    return [...this.facilities];
  }

  getFacility(id: string): HospitalFacility | undefined {
    return this.facilities.find(f => f.id === id);
  }

  getNearbyFacilities(lat: number, lon: number, radiusKm: number = 50): (HospitalFacility & { distance_km: number })[] {
    return this.facilities
      .filter(f => f.participation_status === 'active' || f.participation_status === 'demo')
      .map(f => ({
        ...f,
        distance_km: haversineDistance(lat, lon, f.latitude, f.longitude),
      }))
      .filter(f => f.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);
  }

  // Dispatch CRUD
  createDispatch(data: Omit<HospitalDispatch, 'id' | 'created_at' | 'updated_at'>): HospitalDispatch {
    const dispatch: HospitalDispatch = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.dispatches.push(dispatch);
    return dispatch;
  }

  getDispatchesByIncident(incidentId: string): HospitalDispatch[] {
    return this.dispatches
      .filter(d => d.incident_id === incidentId)
      .map(d => ({
        ...d,
        facility: this.facilities.find(f => f.id === d.facility_id),
      }));
  }

  getDispatchesByFacility(facilityId: string): HospitalDispatch[] {
    return this.dispatches.filter(d => d.facility_id === facilityId);
  }

  updateDispatchStatus(id: string, status: DispatchStatus): HospitalDispatch | undefined {
    const dispatch = this.dispatches.find(d => d.id === id);
    if (dispatch) {
      dispatch.status = status;
      dispatch.updated_at = new Date().toISOString();
      if (status === 'acknowledged') dispatch.acknowledged_at = new Date().toISOString();
      if (status === 'accepted') dispatch.accepted_at = new Date().toISOString();
      if (status === 'declined') dispatch.declined_at = new Date().toISOString();
    }
    return dispatch;
  }

  // Clinician Response CRUD
  createClinicianResponse(data: Omit<ClinicianResponse, 'id' | 'created_at' | 'updated_at'>): ClinicianResponse {
    const response: ClinicianResponse = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clinicianResponses.push(response);
    return response;
  }

  getResponsesByIncident(incidentId: string): ClinicianResponse[] {
    return this.clinicianResponses.filter(r => r.incident_id === incidentId);
  }

  getResponsesByClinician(clinicianId: string): ClinicianResponse[] {
    return this.clinicianResponses.filter(r => r.clinician_id === clinicianId);
  }

  // Care Instructions CRUD
  createCareInstruction(data: Omit<CareInstruction, 'id' | 'created_at' | 'updated_at'>): CareInstruction {
    const instruction: CareInstruction = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.careInstructions.push(instruction);
    return instruction;
  }

  getCareInstructions(incidentId?: string, patientId?: string): CareInstruction[] {
    return this.careInstructions.filter(ci => 
      (incidentId ? ci.incident_id === incidentId : true) &&
      (patientId ? ci.patient_id === patientId : true)
    );
  }

  updateCareInstructionApproval(id: string, reviewerId: string, reviewerName: string, approved: boolean): CareInstruction | undefined {
    const instruction = this.careInstructions.find(ci => ci.id === id);
    if (instruction) {
      instruction.approval_status = approved ? 'approved' : 'rejected';
      instruction.reviewer_id = reviewerId;
      instruction.reviewer_name = reviewerName;
      instruction.reviewed_at = new Date().toISOString();
      instruction.updated_at = new Date().toISOString();
    }
    return instruction;
  }

  // Prescription CRUD
  getPrescriptions(incidentId?: string): Prescription[] {
    return this.prescriptions.filter(p => incidentId ? p.incident_id === incidentId : true);
  }

  createPrescription(data: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>): Prescription {
    const prescription: Prescription = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.prescriptions.push(prescription);
    return prescription;
  }

  // Follow-up CRUD
  createFollowUp(data: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>): FollowUp {
    const followUp: FollowUp = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.followUps.push(followUp);
    return followUp;
  }

  getFollowUps(patientId?: string, status?: FollowUpStatus): FollowUp[] {
    return this.followUps.filter(fu =>
      (patientId ? fu.patient_id === patientId : true) &&
      (status ? fu.status === status : true)
    );
  }

  updateFollowUpStatus(id: string, status: FollowUpStatus, notes?: string): FollowUp | undefined {
    const followUp = this.followUps.find(fu => fu.id === id);
    if (followUp) {
      followUp.status = status;
      if (notes) followUp.attendance_notes = notes;
      followUp.updated_at = new Date().toISOString();
    }
    return followUp;
  }

  // Audit CRUD
  logAudit(data: Omit<AuditEvent, 'id' | 'created_at'>): AuditEvent {
    const event: AuditEvent = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    this.auditEvents.push(event);
    return event;
  }

  getAuditEvents(resourceId?: string, limit: number = 50): AuditEvent[] {
    const events = resourceId
      ? this.auditEvents.filter(e => e.resource_id === resourceId)
      : this.auditEvents;
    return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  }

  // Notifications
  createNotification(data: Omit<Notification, 'id' | 'created_at'>): Notification {
    const notification: Notification = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    this.notifications.push(notification);
    return notification;
  }

  getNotifications(recipientId: string): Notification[] {
    return this.notifications
      .filter(n => n.recipient_id === recipientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Patient profiles
  getPatientProfile(id: string): PatientProfile | undefined {
    return this.patientProfiles.find(p => p.id === id || p.user_id === id);
  }

  // Reset to seed data
  reset() {
    this.incidents = [...DEMO_INCIDENTS];
    this.attachments = [];
    this.qrTokens = [...DEMO_QR_TOKENS];
    this.qrAccessLogs = [];
    this.facilities = [...DEMO_FACILITIES];
    this.dispatches = [...DEMO_DISPATCHES];
    this.clinicianResponses = [...DEMO_CLINICIAN_RESPONSES];
    this.careInstructions = [...DEMO_CARE_INSTRUCTIONS];
    this.prescriptions = [...DEMO_PRESCRIPTIONS];
    this.followUps = [...DEMO_FOLLOWUPS];
    this.auditEvents = [...DEMO_AUDIT_EVENTS];
    this.notifications = [];
    this.consentRecords = [];
    this.patientProfiles = [...DEMO_PATIENT_PROFILES];
  }
}

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Singleton instance
export const demoDB = new DemoDatabase();

// Export token values for demo QR display
export const DEMO_QR_TOKENS_VALUES = {
  active: demoQrToken,
  expired: expiredQrToken,
  revoked: revokedQrToken,
};
