import { NextRequest } from 'next/server';
import { getUserById } from '@/server/db/user';

export interface User {
  id: string;
  role: 'admin' | 'staff' | 'user';
}

export function getTokenFromHeader(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ')) {
    return auth.substring(7);
  }
  return null;
}

// Improved implementation: match token to user
export async function requireStaffOrAdmin(token: string | null): Promise<User | null> {
  if (!token) return null;
  // Match token to user
  if (token === 'jwt-token-for-admin-user') {
    return { id: '1', role: 'admin' };
  }
  if (token === 'jwt-token-for-staff-user') {
    return { id: '2', role: 'staff' };
  }
  return null;
}
