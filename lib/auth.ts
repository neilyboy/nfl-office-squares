import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePIN(pin: string): boolean {
  return /^\d{4}$|^\d{6}$/.test(pin);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}
