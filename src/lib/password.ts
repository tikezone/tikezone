import argon2 from 'argon2';
import bcrypt from 'bcryptjs';

// Paramètres Argon2id calibrés pour env prod (~300-500ms). À ajuster périodiquement.
const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MB
  timeCost: 4,
  parallelism: 1,
};

export async function hashPassword(password: string) {
  return argon2.hash(password, ARGON2_OPTS);
}

export async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  // Compatibilité arrière pour anciens mots de passe bcrypt.
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return bcrypt.compare(password, storedHash);
  }
  // Par défaut: Argon2id
  try {
    return argon2.verify(storedHash, password);
  } catch {
    return false;
  }
}
