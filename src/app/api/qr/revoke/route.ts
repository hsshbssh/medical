import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-store';
import { checkRateLimit } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { tokenId, tokenHash } = body;
    const target = (tokenId || tokenHash || '').trim();

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'tokenId or tokenHash is required to revoke.' },
        { status: 400 }
      );
    }

    const success = serverDB.revokeQRToken(target);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Token not found or already inactive.' },
        { status: 404 }
      );
    }

    serverDB.logAudit({
      actor_id: ip,
      actor_role: 'patient',
      event_type: 'qr_revoked',
      resource_type: 'qr_access_token',
      resource_id: target,
      description: 'PS-40 Emergency QR access token revoked by patient/user',
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      message: 'Token successfully revoked. Any subsequent scans will be immediately denied.',
      revoked_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[API /api/qr/revoke Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error revoking token.' },
      { status: 500 }
    );
  }
}
