import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getSettings } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'om-youssef-secret-key-2024';

export async function verifyAdmin(password: string): Promise<boolean> {
  const settings = await getSettings();
  return password === settings.admin_password;
}

export function createToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  return verifyToken(token);
}
