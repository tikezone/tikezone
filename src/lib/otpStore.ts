// Simple in-memory OTP store for dev/demo.
// In production, replace with Redis or database-backed store.

type Entry = {
  code: string;
  expiresAt: number;
};

const store = new Map<string, Entry>();
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function setOtp(email: string, code: string) {
  store.set(email.toLowerCase(), { code, expiresAt: Date.now() + EXPIRY_MS });
}

export function getOtp(email: string): Entry | undefined {
  return store.get(email.toLowerCase());
}

export function clearOtp(email: string) {
  store.delete(email.toLowerCase());
}

export function isExpired(entry: Entry) {
  return entry.expiresAt < Date.now();
}
