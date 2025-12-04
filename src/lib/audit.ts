import { NextRequest } from 'next/server';

type Action =
  | 'login_failed'
  | 'login_success'
  | 'email_not_verified'
  | 'otp_request'
  | 'otp_verified'
  | 'pwd_change'
  | 'pwd_reuse_blocked'
  | 'pwd_recent_blocked'
  | 'rate_limited'
  | 'lockout';

export function logSecurityEvent(action: Action, req: NextRequest, meta: Record<string, any> = {}) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  const safeMeta = { ...meta };
  delete (safeMeta as any).otp;
  delete (safeMeta as any).password;
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      action,
      ip,
      ua,
      meta: safeMeta,
    })
  );
}
