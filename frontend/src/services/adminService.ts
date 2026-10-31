import { users } from '../data/user';
import { SessionUser } from '../types';

export async function getUsers(): Promise<SessionUser[]> {
  await new Promise((r) => setTimeout(r, 300));
  return users.map(({ userPassword: _pw, ...u }) => u);
}