export interface User {
  id: string;
  passwordHash: string;
  role: 'admin' | 'staff' | 'user';
}

// Dummy in-memory user DB (replace with real DB logic)
// Password for admin is: password123
// Password for staff is: staffpass
import bcrypt from 'bcryptjs';

const users: Record<string, User> = {
  '1': { id: '1', passwordHash: bcrypt.hashSync('password123', 10), role: 'admin' },
  '2': { id: '2', passwordHash: bcrypt.hashSync('staffpass', 10), role: 'staff' },
};

export async function getUserById(id: string): Promise<User | null> {
  return users[id] || null;
}

export async function updateUserPassword(id: string, newHash: string): Promise<void> {
  if (users[id]) {
    users[id].passwordHash = newHash;
  }
}
