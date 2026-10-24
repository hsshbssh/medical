import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-store';
import { checkRateLimit } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded for token access.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          valid: false,
          status: 'not_found',
          error: 'Token parameter is required.',
          reason: 'This QR code could not be verified. It may be incorrect, expired, or no longer active.' 
        },
        { status: 400 }
      );
    }

    return handleTokenVerification(token, ip);
  } catch (err: any) {
    console.error('[API /api/qr/verify GET Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Access could not currently be verified due to a server error.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded for token access.' },
        { status: 429 }
      );
    }

    let token: string | undefined;
    try {
      const body = await req.json();
      token = body?.token;
    } catch {
      const { searchParams } = new URL(req.url);
      token = searchParams.get('token') || undefined;
    }

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          valid: false,
          status: 'not_found',
          error: 'Token parameter is required.',
          reason: 'This QR code could not be verified. It may be incorrect, expired, or no longer active.' 
        },
        { status: 400 }
      );
    }

    return handleTokenVerification(token, ip);
  } catch (err: any) {
    console.error('[API /api/qr/verify POST Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Access could not currently be verified due to a server error.' },
      { status: 500 }
    );
  }
}

function handleTokenVerification(token: string, ip: string) {
  try {
    const cleanToken = token.trim().replace(/[\\]+$/, '');
    const result = serverDB.validateQRToken(cleanToken);

    // Audit Logging
    serverDB.logAudit({
      actor_id: ip,
      actor_role: 'qr_scanner',
      event_type: 'qr_accessed',
      resource_type: 'qr_access_token',
      resource_id: result.token?.id || cleanToken,
      description: `PS-40 Emergency QR Verification: ${result.valid ? 'Access Granted' : 'Access Denied (' + result.status + ': ' + result.reason + ')'}`,
      result: result.valid ? 'success' : 'denied',
    });

    if (!result.valid || !result.token) {
      return NextResponse.json({
        success: false,
        valid: false,
        status: result.status,
        reason: result.reason || 'This QR code could not be verified. It may be incorrect, expired, or no longer active.',
      });
    }

    const incident = result.incident;
    const patientProfile = incident ? serverDB.getPatientProfile(incident.patient_name || '') : undefined;

    return NextResponse.json({
      success: true,
      valid: true,
      status: 'active',
      data: {
        token_id: result.token.id,
        permitted_scope: result.token.permitted_scope,
        expires_at: result.token.expires_at,
        uses_remaining: result.token.max_uses - result.token.use_count,
        incident: incident ? {
          id: incident.id,
          incident_id: incident.incident_id,
          location_address: incident.location_address,
          location_description: incident.location_description,
          latitude: incident.latitude,
          longitude: incident.longitude,
          incident_time: incident.incident_time,
          category: incident.category,
          description: incident.description,
          injury_description: incident.injury_description,
          observations: incident.observations,
          patient_identity_status: incident.patient_identity_status,
          patient_gender: incident.patient_gender,
          patient_age_approx: incident.patient_age_approx,
          status: incident.status,
          reporter_name: incident.reporter_name,
          reporter_phone: incident.reporter_phone,
          // Patient essential emergency telemetry (minimal scope)
          blood_group: patientProfile?.blood_group || 'Unknown (Pending Triage)',
          allergies: patientProfile?.allergies || 'None documented on scene',
        } : null,
      },
    });
  } catch (err: any) {
    console.error('[API /api/qr/verify handleTokenVerification Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Access could not currently be verified due to a server error.' },
      { status: 500 }
    );
  }
}
