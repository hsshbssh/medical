import { NextRequest, NextResponse } from 'next/server';
import { demoDB, DEMO_QR_TOKENS_VALUES } from '@/lib/demo-db';
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
        { success: false, error: 'Token query parameter is required.' },
        { status: 400 }
      );
    }

    return handleTokenVerification(token, ip);
  } catch (err: any) {
    console.error('API /api/qr/verify GET Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error validating token.' },
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
      // Fallback to query param
      const { searchParams } = new URL(req.url);
      token = searchParams.get('token') || undefined;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token parameter is required.' },
        { status: 400 }
      );
    }

    return handleTokenVerification(token, ip);
  } catch (err: any) {
    console.error('API /api/qr/verify POST Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error validating token.' },
      { status: 500 }
    );
  }
}

function handleTokenVerification(token: string, ip: string) {
  try {
    const cleanToken = token.trim().replace(/[\\]+$/, '');
    const result = demoDB.validateQRToken(cleanToken);

    demoDB.logAudit({
      actor_id: ip,
      actor_role: 'qr_scanner',
      event_type: 'qr_accessed',
      resource_type: 'qr_access_token',
      resource_id: result.token?.id || token,
      description: `QR API validation: ${result.valid ? 'Granted' : 'Denied (' + result.reason + ')'}`,
      result: result.valid ? 'success' : 'denied',
    });

    if (!result.valid || !result.token) {
      return NextResponse.json({
        success: false,
        valid: false,
        reason: result.reason || 'Token is invalid, expired, or revoked.',
      });
    }

    const incident = demoDB.getIncident(result.token.incident_id);

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        token_id: result.token.id,
        permitted_scope: result.token.permitted_scope,
        expires_at: result.token.expires_at,
        uses_remaining: result.token.max_uses - result.token.use_count,
        incident: incident ? {
          incident_id: incident.incident_id,
          location_address: incident.location_address,
          incident_time: incident.incident_time,
          category: incident.category,
          injury_description: incident.injury_description,
          patient_identity_status: incident.patient_identity_status,
          patient_gender: incident.patient_gender,
          patient_age_approx: incident.patient_age_approx,
        } : null,
      },
    });
  } catch (err: any) {
    console.error('API /api/qr/verify Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error validating token.' },
      { status: 500 }
    );
  }
}
