import { users } from '../data/user';
import { SessionUser, User } from '../types';

const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function toSession(u: User): SessionUser {
  const { userPassword: _pw, ...session } = u;
  return session;
}

export async function loginRequest(email: string, password: string) {
  await wait();
  const found = users.find(
    (u) => u.userEmail.toLowerCase() === email.trim().toLowerCase() && u.userPassword === password
  );
  if (!found) throw new Error('Invalid email or password');
  return { token: 'dummy-token-' + found.userId, user: toSession(found) };
}

export async function signupRequest(name: string, email: string, password: string) {
  await wait();
  if (users.some((u) => u.userEmail.toLowerCase() === email.trim().toLowerCase())) {
    throw new Error('Email already registered');
  }
  const newUser: User = {
    userId: Math.max(...users.map((u) => u.userId)) + 1,
    userName: name.trim(),
    userRole: 'user',
    userEmail: email.trim(),
    userPassword: password,
  };
  users.push(newUser);
  return { token: 'dummy-token-' + newUser.userId, user: toSession(newUser) };
}

export async function updateProfile(
  userId: number,
  data: { userName: string; userEmail: string }
): Promise<SessionUser> {
  await wait();
  const u = users.find((x) => x.userId === userId);
  if (!u) throw new Error('User not found');
  const taken = users.some(
    (x) => x.userId !== userId && x.userEmail.toLowerCase() === data.userEmail.trim().toLowerCase()
  );
  if (taken) throw new Error('Email already registered');
  u.userName = data.userName.trim();
  u.userEmail = data.userEmail.trim();
  return toSession(u);
}

export async function changePassword(userId: number, current: string, next: string) {
  await wait();
  const u = users.find((x) => x.userId === userId);
  if (!u) throw new Error('User not found');
  if (u.userPassword !== current) throw new Error('Current password is wrong');
  u.userPassword = next;
}