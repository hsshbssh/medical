// CareBridge AI — Application Security Utilities
// Rate limiting, token hashing, signed URLs simulation, and data redaction

import { QRAccessToken } from './types';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ipOrKey: string, maxRequests = 30, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrKey);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ipOrKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Cryptographic token hashing (SHA-256 equivalent or browser-safe fallback)
export async function hashToken(token: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

// Simulated Private Storage Signed URL Generator
// In production: Supabase Storage getSignedUrl(path, expiresInSeconds)
export function generateSignedImageUrl(storageKey: string, expiresInSeconds = 300): string {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const signature = Math.random().toString(36).substring(2, 10);
  return `/api/attachments/signed-view?key=${encodeURIComponent(storageKey)}&expires=${expiresAt}&sig=${signature}`;
}

// Redact patient identifiers for public or unverified views
export function sanitizePublicIncident(incident: any) {
  return {
    incident_id: incident.incident_id,
    location_address: incident.location_address,
    incident_time: incident.incident_time,
    category: incident.category,
    observations: incident.observations || incident.description,
    status: incident.status,
    patient_identity_status: incident.patient_identity_status,
    patient_gender: incident.patient_gender,
    patient_age_approx: incident.patient_age_approx,
    // Sensitive data STRIPPED for unverified public queries:
    // reporter_phone, reporter_name, exact photo binaries, medical history
  };
}
