export const PASSWORD_MIN_LENGTH = 8;

type PasswordContext = {
  email?: string;
  fullName?: string;
  minLength?: number;
};

const hasUpper = (s: string) => /[A-Z]/.test(s);
const hasLower = (s: string) => /[a-z]/.test(s);
const hasDigit = (s: string) => /\d/.test(s);
const hasSymbol = (s: string) => /[^A-Za-z0-9]/.test(s);

export function validatePasswordStrength(password: string, ctx?: PasswordContext) {
  const minLength = ctx?.minLength || PASSWORD_MIN_LENGTH;
  if (!password || password.length < minLength) {
    return { ok: false, error: `Mot de passe trop court (min ${minLength} caracteres)` };
  }
  if (!hasUpper(password) || !hasLower(password) || !hasDigit(password) || !hasSymbol(password)) {
    return {
      ok: false,
      error: 'Mot de passe faible : majuscules, minuscules, chiffres et symboles requis.',
    };
  }

  return { ok: true as const };
}
