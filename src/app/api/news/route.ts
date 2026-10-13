import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { error: 'News service has been deactivated.' },
    { status: 404 }
  );
}
