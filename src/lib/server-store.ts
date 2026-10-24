// CareBridge AI — Server-Side Persistent Storage Engine
// Provides file-backed persistence for incidents, QR tokens, dispatches, instructions, and audit logs.
// Survives server restarts, browser refreshes, and cross-device scanning.

import fs from 'fs';
import path from 'path';
import os from 'os';
import type {
  Incident, IncidentAttachment, QRAccessToken, QRAccessLog,
  HospitalFacility, HospitalDispatch, ClinicianResponse,
  CareInstruction, Prescription, FollowUp, AuditEvent,
  Notification, ConsentRecord, PatientProfile,
  IncidentStatus, DispatchStatus, FollowUpStatus, TokenStatus,
} from './types';

import {
  demoQrToken,
  expiredQrToken,
  revokedQrToken,
  DEMO_QR_TOKENS_VALUES,
} from './demo-db';

interface StoreData {
  incidents: Incident[];
  qrTokens: QRAccessToken[];
  dispatches: HospitalDispatch[];
  clinicianResponses: ClinicianResponse[];
  careInstructions: CareInstruction[];
  prescriptions: Prescription[];
  followUps: FollowUp[];
  auditEvents: AuditEvent[];
  facilities: HospitalFacility[];
  patientProfiles: PatientProfile[];
}

const STORE_FILE_PATH = path.join(process.cwd(), '.carebridge-store.json');

function generateId(): string {
  return 'cb_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function generateIncidentId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CB-${date}-${rand}`;
}

export function generateCryptoToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

function getInitialSeedData(): StoreData {
  return {
    incidents: [
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
    ],
    qrTokens: [
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
        expires_at: '2026-10-23T10:35:00+05:30',
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
    ],
    dispatches: [
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
    ],
    clinicianResponses: [
      {
        id: 'demo-response-001',
        incident_id: 'demo-incident-001',
        clinician_id: 'demo-clinician-001',
        clinician_name: 'Dr. Meera Reddy',
        response_type: 'initial_assessment',
        content: 'Based on the reported injuries: visible abrasion on left forearm and possible fracture of left knee. Recommend immediate transport to nearest emergency facility.',
        clinical_notes: 'Initial remote assessment based on bystander report. In-person evaluation required.',
        status: 'approved',
        is_primary_responder: true,
        created_at: '2026-10-24T10:42:00+05:30',
        updated_at: '2026-10-24T10:45:00+05:30',
      },
    ],
    careInstructions: [
      {
        id: 'demo-instruction-001',
        incident_id: 'demo-incident-001',
        patient_id: 'demo-patient-001',
        original_text: 'Post-initial assessment care: 1. Immobilize the left lower extremity using available splinting material. 2. Clean forearm abrasion with normal saline. 3. Monitor for compartment syndrome. 4. Tab. Paracetamol 500mg PO every 6 hours for pain, maximum 4 doses in 24 hours. 5. Apply ice pack to knee for 15-20 min every 2 hours. 6. Keep limb elevated. 7. Follow up at orthopedic OPD within 48 hours for X-ray review. 8. Return immediately if swelling, numbness, or fever.',
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
    ],
    prescriptions: [
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
        status: 'active',
        created_at: '2026-10-24T10:48:00+05:30',
        updated_at: '2026-10-24T10:48:00+05:30',
      },
    ],
    followUps: [
      {
        id: 'demo-fu-001',
        incident_id: 'demo-incident-001',
        patient_id: 'demo-patient-001',
        facility_id: 'demo-facility-001',
        facility_name: 'AIIMS Delhi (Demo)',
        clinician_id: 'demo-clinician-001',
        clinician_name: 'Dr. Meera Reddy',
        department: 'Orthopedic OPD',
        follow_up_date: '2026-10-26',
        follow_up_time: '10:00',
        purpose: 'X-ray review and orthopedic evaluation of left knee',
        status: 'scheduled',
        reminder_status: 'scheduled',
        created_at: '2026-10-24T11:05:00+05:30',
        updated_at: '2026-10-24T11:05:00+05:30',
      },
    ],
    auditEvents: [
      {
        id: 'demo-audit-001',
        actor_id: 'demo-bystander-001',
        actor_role: 'bystander',
        event_type: 'incident_created',
        resource_type: 'incident',
        resource_id: 'demo-incident-001',
        description: 'Emergency incident report submitted: CB-20261024-A1B2',
        result: 'success',
        created_at: '2026-10-24T10:32:00+05:30',
      },
    ],
    facilities: [
      {
        id: 'demo-facility-001',
        name: 'AIIMS Delhi Trauma Center',
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
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-05T00:00:00Z',
      },
      {
        id: 'demo-facility-002',
        name: 'Safdarjung Hospital Emergency',
        facility_type: 'government',
        address: 'Ring Road, Opposite AIIMS',
        city: 'New Delhi',
        state: 'Delhi',
        latitude: 28.5700,
        longitude: 77.2078,
        phone: '+91-11-26165060',
        email: 'emergency@safdarjung-demo.gov.in',
        emergency_department: true,
        participation_status: 'demo',
        is_demo: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-05T00:00:00Z',
      },
    ],
    patientProfiles: [
      {
        id: 'demo-patient-001',
        user_id: 'demo-patient-001',
        full_name: 'Rohan Mehta',
        date_of_birth: '1994-05-15',
        blood_group: 'O+',
        allergies: 'Penicillin (Severe)',
        emergency_contact_name: 'Kavita Mehta',
        emergency_contact_phone: '+91-9876543220',
        identity_verified: true,
        created_at: '2026-10-24T10:40:00+05:30',
        updated_at: '2026-10-24T10:40:00+05:30',
      },
    ],
  };
}

class ServerStore {
  private data: StoreData;

  constructor() {
    this.data = this.readFromDisk();
  }

  private readFromDisk(): StoreData {
    try {
      if (fs.existsSync(STORE_FILE_PATH)) {
        const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.incidents && parsed.qrTokens) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[ServerStore] Failed to read disk store, resetting to seeds:', e);
    }
    const initial = getInitialSeedData();
    this.writeToDisk(initial);
    return initial;
  }

  private writeToDisk(data?: StoreData) {
    try {
      const payload = data || this.data;
      fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('[ServerStore] Failed to write to disk:', e);
    }
  }

  // Network IP detection
  getNetworkIp(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  // --- Incident CRUD ---
  createIncident(input: Omit<Incident, 'id' | 'incident_id' | 'created_at' | 'updated_at'>): Incident {
    const incident: Incident = {
      ...input,
      id: generateId(),
      incident_id: generateIncidentId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.incidents.unshift(incident);
    this.writeToDisk();
    return incident;
  }

  getIncident(idOrIncidentId: string): Incident | undefined {
    return this.data.incidents.find(i => i.id === idOrIncidentId || i.incident_id === idOrIncidentId);
  }

  getAllIncidents(): Incident[] {
    return [...this.data.incidents];
  }

  updateIncidentStatus(id: string, status: IncidentStatus): Incident | undefined {
    const inc = this.data.incidents.find(i => i.id === id || i.incident_id === id);
    if (inc) {
      inc.status = status;
      inc.updated_at = new Date().toISOString();
      this.writeToDisk();
    }
    return inc;
  }

  // --- QR Token CRUD ---
  createQRToken(input: Omit<QRAccessToken, 'id' | 'created_at'>): QRAccessToken {
    const token: QRAccessToken = {
      ...input,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    this.data.qrTokens.unshift(token);
    this.writeToDisk();
    return token;
  }

  getQRToken(tokenHashOrId: string): QRAccessToken | undefined {
    const clean = tokenHashOrId.trim().replace(/[\\]+$/, '');
    return this.data.qrTokens.find(t => 
      t.token_hash === clean || 
      t.id === clean || 
      (clean === 'demo' && t.status === 'active') ||
      (clean === DEMO_QR_TOKENS_VALUES.active && t.status === 'active')
    );
  }

  getQRTokensByIncident(incidentId: string): QRAccessToken[] {
    return this.data.qrTokens.filter(t => t.incident_id === incidentId);
  }

  validateQRToken(tokenParam: string): { 
    valid: boolean; 
    status: 'active' | 'expired' | 'revoked' | 'exhausted' | 'not_found'; 
    reason: string; 
    token?: QRAccessToken; 
    incident?: Incident 
  } {
    const clean = (tokenParam || '').trim().replace(/[\\]+$/, '');
    if (!clean) {
      return { valid: false, status: 'not_found', reason: 'No token provided in request' };
    }

    const token = this.getQRToken(clean);
    if (!token) {
      return { 
        valid: false, 
        status: 'not_found', 
        reason: 'This QR code could not be verified. It may be incorrect, expired, or no longer active.' 
      };
    }

    if (token.status === 'revoked') {
      return { 
        valid: false, 
        status: 'revoked', 
        reason: 'This emergency pass has been revoked by the patient or administrator.', 
        token 
      };
    }

    const now = new Date();
    if (token.status === 'expired' || new Date(token.expires_at) < now) {
      token.status = 'expired';
      this.writeToDisk();
      return { 
        valid: false, 
        status: 'expired', 
        reason: 'This emergency pass has expired. The 24-hour access window has elapsed.', 
        token 
      };
    }

    if (token.use_count >= token.max_uses) {
      token.status = 'exhausted';
      this.writeToDisk();
      return { 
        valid: false, 
        status: 'exhausted', 
        reason: 'This emergency pass has reached its maximum permitted use count.', 
        token 
      };
    }

    // Increment usage
    token.use_count++;
    this.writeToDisk();

    const incident = this.getIncident(token.incident_id);
    return {
      valid: true,
      status: 'active',
      reason: 'Valid cryptographic emergency pass',
      token,
      incident,
    };
  }

  revokeQRToken(tokenIdOrHash: string): boolean {
    const clean = tokenIdOrHash.trim().replace(/[\\]+$/, '');
    const token = this.data.qrTokens.find(t => t.id === clean || t.token_hash === clean);
    if (token) {
      token.status = 'revoked';
      token.revoked_at = new Date().toISOString();
      this.writeToDisk();
      return true;
    }
    return false;
  }

  // --- Dispatches ---
  createDispatch(input: Omit<HospitalDispatch, 'id' | 'created_at' | 'updated_at'>): HospitalDispatch {
    const dispatch: HospitalDispatch = {
      ...input,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.dispatches.unshift(dispatch);
    this.writeToDisk();
    return dispatch;
  }

  getDispatchesByIncident(incidentId: string): HospitalDispatch[] {
    return this.data.dispatches.filter(d => d.incident_id === incidentId);
  }

  updateDispatchStatus(dispatchId: string, status: DispatchStatus): HospitalDispatch | undefined {
    const d = this.data.dispatches.find(item => item.id === dispatchId);
    if (d) {
      d.status = status;
      d.updated_at = new Date().toISOString();
      this.writeToDisk();
    }
    return d;
  }

  // --- Care Instructions ---
  getCareInstructions(incidentId?: string): CareInstruction[] {
    return incidentId 
      ? this.data.careInstructions.filter(c => c.incident_id === incidentId)
      : [...this.data.careInstructions];
  }

  saveCareInstruction(ci: CareInstruction): CareInstruction {
    const existingIdx = this.data.careInstructions.findIndex(item => item.id === ci.id || item.incident_id === ci.incident_id);
    if (existingIdx >= 0) {
      this.data.careInstructions[existingIdx] = { ...ci, updated_at: new Date().toISOString() };
    } else {
      this.data.careInstructions.unshift(ci);
    }
    this.writeToDisk();
    return ci;
  }

  // --- Prescriptions ---
  getPrescriptions(incidentId?: string): Prescription[] {
    return incidentId 
      ? this.data.prescriptions.filter(p => p.incident_id === incidentId)
      : [...this.data.prescriptions];
  }

  savePrescription(rx: Prescription): Prescription {
    const existingIdx = this.data.prescriptions.findIndex(item => item.id === rx.id);
    if (existingIdx >= 0) {
      this.data.prescriptions[existingIdx] = rx;
    } else {
      this.data.prescriptions.unshift(rx);
    }
    this.writeToDisk();
    return rx;
  }

  // --- Follow Ups ---
  getFollowUps(): FollowUp[] {
    return [...this.data.followUps];
  }

  updateFollowUpStatus(id: string, status: FollowUpStatus, notes?: string): FollowUp | undefined {
    const fu = this.data.followUps.find(f => f.id === id);
    if (fu) {
      fu.status = status;
      if (notes) fu.attendance_notes = notes;
      fu.updated_at = new Date().toISOString();
      this.writeToDisk();
    }
    return fu;
  }

  // --- Audit Events ---
  logAudit(input: Omit<AuditEvent, 'id' | 'created_at'>): AuditEvent {
    const event: AuditEvent = {
      ...input,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    this.data.auditEvents.unshift(event);
    this.writeToDisk();
    return event;
  }

  getAuditEvents(limit: number = 50): AuditEvent[] {
    return this.data.auditEvents.slice(0, limit);
  }

  // --- Facilities & Patients ---
  getFacilities(): HospitalFacility[] {
    return [...this.data.facilities];
  }

  getPatientProfile(id: string): PatientProfile | undefined {
    return this.data.patientProfiles.find(p => p.id === id || p.user_id === id);
  }

  // Reset to initial clean seeds
  reset() {
    this.data = getInitialSeedData();
    this.writeToDisk(this.data);
  }
}

// Global server singleton
declare global {
  var __carebridge_server_store__: ServerStore | undefined;
}

export const serverDB = global.__carebridge_server_store__ || new ServerStore();
if (process.env.NODE_ENV !== 'production') {
  global.__carebridge_server_store__ = serverDB;
}
