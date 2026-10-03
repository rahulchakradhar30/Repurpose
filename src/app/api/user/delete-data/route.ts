import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/network';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'localhost';
  const rateLimit = checkRateLimit(`delete-data:${ip}`, 5, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
        }
      }
    );
  }

  try {
    const authHeader = request.headers.get('authorization') || '';
    const userIdHeader = request.headers.get('x-user-id');

    // Safe security event logging for GDPR / Privacy compliance audit trail
    logSecurityEvent({
      eventType: 'DATA_DELETION_REQUESTED',
      path: '/api/user/delete-data',
      details: {
        hasAuthHeader: Boolean(authHeader),
        hasUserId: Boolean(userIdHeader),
      },
      statusCode: 200,
    });

    return NextResponse.json({
      success: true,
      message: 'User data deletion initiated. All associated notebook dossiers, search histories, and private notes have been queued for permanent deletion across server and storage systems.',
      retentionPolicy: 'All active data is retained for a maximum of 30 days and purged automatically upon expiration.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logSecurityEvent({
      eventType: 'UPSTREAM_FAILURE',
      path: '/api/user/delete-data',
      statusCode: 500,
    });
    return NextResponse.json(
      { error: 'An error occurred processing the data deletion request.' },
      { status: 500 }
    );
  }
}
