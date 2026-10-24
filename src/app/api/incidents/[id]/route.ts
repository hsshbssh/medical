import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Incident ID required.' }, { status: 400 });
    }

    const incident = serverDB.getIncident(id);
    if (!incident) {
      return NextResponse.json(
        { success: false, error: 'Incident not found in persistent store.' },
        { status: 404 }
      );
    }

    const tokens = serverDB.getQRTokensByIncident(incident.id);
    const dispatches = serverDB.getDispatchesByIncident(incident.id);
    const careInstructions = serverDB.getCareInstructions(incident.id);
    const prescriptions = serverDB.getPrescriptions(incident.id);

    return NextResponse.json({
      success: true,
      incident,
      tokens,
      dispatches,
      careInstructions,
      prescriptions,
    });
  } catch (err: any) {
    console.error('[API /api/incidents/[id] Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error loading incident.' },
      { status: 500 }
    );
  }
}
