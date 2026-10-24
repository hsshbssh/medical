import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  const ip = serverDB.getNetworkIp();
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  
  return NextResponse.json({
    success: true,
    ip,
    networkIp: ip,
    port: 3000,
    currentHost: host,
    currentOrigin: `${proto}://${host}`,
    networkOrigin: `http://${ip}:3000`,
  });
}
