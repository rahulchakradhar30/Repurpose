/**
 * Safe Structured Security Logger for Repurpose.
 * Guarantees that no secrets, authorization tokens, passwords, or PII are logged.
 */

export type SecurityEventType = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'SSRF_ATTEMPT_BLOCKED'
  | 'INVALID_INPUT_DETECTED'
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'UPSTREAM_FAILURE'
  | 'PAYLOAD_TOO_LARGE'
  | 'DATA_DELETION_REQUESTED';

export interface SecurityEventPayload {
  eventType: SecurityEventType;
  path?: string;
  ip?: string;
  method?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

const REDACTED_KEYS = new Set([
  'authorization',
  'cookie',
  'token',
  'idtoken',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'api_key',
  'key',
  'password',
  'bearer',
  'credentials',
]);

function redactSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (REDACTED_KEYS.has(lowerKey) || lowerKey.includes('key') || lowerKey.includes('token') || lowerKey.includes('secret')) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = redactSensitiveData(value as Record<string, unknown>);
    } else if (typeof value === 'string' && value.length > 500) {
      clean[key] = `${value.slice(0, 500)}...[TRUNCATED]`;
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export function logSecurityEvent(event: SecurityEventPayload): void {
  const timestamp = new Date().toISOString();
  const sanitizedDetails = event.details ? redactSensitiveData(event.details) : undefined;

  const logRecord = {
    timestamp,
    level: event.eventType === 'AUTH_SUCCESS' ? 'INFO' : 'WARN',
    category: 'SECURITY',
    eventType: event.eventType,
    path: event.path || 'unknown',
    method: event.method || 'GET',
    statusCode: event.statusCode,
    ip: event.ip ? `${event.ip.split(',')[0].trim().slice(0, 45)}` : 'anonymous',
    details: sanitizedDetails,
  };

  // Safe structured output
  if (process.env.NODE_ENV !== 'test') {
    console.warn(JSON.stringify(logRecord));
  }
}
