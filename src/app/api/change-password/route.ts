import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, requireStaffOrAdmin } from '@/utils/api-auth';
import { getUserById, updateUserPassword } from '@/server/db/user';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req);
    const user = await requireStaffOrAdmin(token);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: 'Missing old or new password' }, { status: 400 });
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const passwordMatch = await bcrypt.compare(oldPassword, dbUser.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.id, newHash);
    return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
