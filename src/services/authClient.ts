const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const getApiUrl = (path: string) => `${API_BASE}${path}`;

export async function loginUser(email: string, password: string) {
  const res = await fetch(getApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(body.error || 'Echec de connexion');
    err.status = res.status;
    throw err;
  }
  return body;
}

export async function registerUser(payload: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }) {
  const res = await fetch(getApiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Echec inscription');
  }
  return res.json();
}

export async function verifyEmail(email: string, otp: string) {
  const res = await fetch(getApiUrl('/api/auth/verify-email'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Code invalide');
  }
  return res.json();
}

export async function resendVerification(email: string) {
  const res = await fetch(getApiUrl('/api/auth/resend-verification'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Envoi impossible');
  }
  return res.json();
}
