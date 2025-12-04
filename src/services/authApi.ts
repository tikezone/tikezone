const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const getApiUrl = (path: string) => `${API_BASE}${path}`;

export async function requestLoginCode(email: string) {
  const res = await fetch(getApiUrl('/api/auth/send-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Impossible d’envoyer le code');
  }
  return true;
}

export async function verifyLoginCode(email: string, code: string) {
  const res = await fetch(getApiUrl('/api/auth/verify-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Code invalide');
  }
  return res.json() as Promise<{ verified: boolean; token: string; user: { id: string; name: string; email: string; role: 'user' | 'organizer' } }>;
}
