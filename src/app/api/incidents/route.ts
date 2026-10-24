import { NextRequest, NextResponse } from 'next/server';
import { serverDB, generateCryptoToken } from '@/lib/server-store';
import { haversineDistance } from '@/lib/demo-db';
import { checkRateLimit } from '@/lib/security';
import { IncidentCategory, PatientIdentityStatus } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      reporter_name = 'Bystander Reporter',
      reporter_phone = '+91-9876543210',
      latitude = 28.6139,
      longitude = 77.2090,
      location_address,
      location_description,
      category = 'road_accident',
      description,
      injury_description,
      observations,
      patient_identity_status = 'not_verified',
      patient_gender = 'unknown',
      patient_age_approx = '25-30',
      data_sharing_confirmed = true,
    } = body;

    // Field Validation
    if (!location_address || typeof location_address !== 'string' || location_address.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Accident scene location address is required.' },
        { status: 400 }
      );
    }

    if (!data_sharing_confirmed) {
      return NextResponse.json(
        { success: false, error: 'Emergency data-sharing consent is required to coordinate care.' },
        { status: 400 }
      );
    }

    // 1. Create and Persist Incident Record
    const incident = serverDB.createIncident({
      reporter_name,
      reporter_phone,
      latitude: Number(latitude) || 28.6139,
      longitude: Number(longitude) || 77.2090,
      location_address: location_address.trim(),
      location_description: location_description?.trim() || '',
      incident_time: new Date().toISOString(),
      category: category as IncidentCategory,
      description: description?.trim() || injury_description?.trim() || 'Accident reported at scene.',
      injury_description: injury_description?.trim() || '',
      observations: observations?.trim() || '',
      patient_identity_status: patient_identity_status as PatientIdentityStatus,
      patient_gender,
      patient_age_approx,
      status: 'dispatched',
      routing_mode: 'demo',
      data_sharing_confirmed: true,
      consent_timestamp: new Date().toISOString(),
    });

    // 2. Generate Unpredictable Cryptographic QR Token (PS-40)
    const tokenHash = generateCryptoToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const token = serverDB.createQRToken({
      incident_id: incident.id,
      token_hash: tokenHash,
      permitted_scope: ['incident_summary', 'location', 'injury_description', 'patient_status'],
      expires_at: expiresAt,
      max_uses: 10,
      use_count: 0,
      status: 'active',
      created_by: reporter_name,
    });

    // 3. Automated Hospital Routing (Haversine Radar)
    const facilities = serverDB.getFacilities();
    const sortedFacilities = facilities
      .map(f => ({
        ...f,
        distance_km: haversineDistance(incident.latitude || 28.6139, incident.longitude || 77.2090, f.latitude, f.longitude),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    const dispatches = [];
    for (const fac of sortedFacilities.slice(0, 2)) {
      const d = serverDB.createDispatch({
        incident_id: incident.id,
        facility_id: fac.id,
        status: 'sent',
        attempt_count: 1,
        distance_km: fac.distance_km,
        dispatched_at: new Date().toISOString(),
      });
      dispatches.push(d);
    }

    // 4. Immutable Audit Log Entries
    serverDB.logAudit({
      actor_id: ip,
      actor_role: 'bystander',
      event_type: 'incident_created',
      resource_type: 'incident',
      resource_id: incident.id,
      description: `Emergency incident reported: ${incident.incident_id} at ${incident.location_address}`,
      result: 'success',
    });

    serverDB.logAudit({
      actor_id: ip,
      actor_role: 'bystander',
      event_type: 'qr_generated',
      resource_type: 'qr_access_token',
      resource_id: token.id,
      description: `PS-40 QR Access Token issued (expires: 24h, max: 10 uses)`,
      result: 'success',
    });

    // 5. Construct QR URLs
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;
    const networkIp = serverDB.getNetworkIp();
    const networkOrigin = `http://${networkIp}:3000`;

    const relativeQrUrl = `/emergency-access/${tokenHash}`;
    const fullQrUrl = `${origin}${relativeQrUrl}`;
    const networkQrUrl = `${networkOrigin}${relativeQrUrl}`;

    return NextResponse.json({
      success: true,
      incident,
      token,
      dispatches,
      qr_url: relativeQrUrl,
      full_qr_url: fullQrUrl,
      network_qr_url: networkQrUrl,
      network_ip: networkIp,
      expires_at: expiresAt,
    });
  } catch (err: any) {
    console.error('[API /api/incidents POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error creating incident report.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const incidents = serverDB.getAllIncidents();
    return NextResponse.json({
      success: true,
      incidents,
      total: incidents.length,
    });
  } catch (err: any) {
    console.error('[API /api/incidents GET Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve incidents.' },
      { status: 500 }
    );
  }
}
