import { SessionUser } from '../types';
import { api } from './api';
import { EP } from './endpoints';

interface AuthResponse {
  token: string;
  user: SessionUser;
}

export const loginRequest = (email: string, password: string) =>
  api<AuthResponse>(EP.login, {
    method: 'POST',
    auth: false,
    body: { userEmail: email.trim(), userPassword: password },
  });

export const signupRequest = (name: string, email: string, password: string) =>
  api<AuthResponse>(EP.signup, {
    method: 'POST',
    auth: false,
    body: { userName: name.trim(), userEmail: email.trim(), userPassword: password },
  });

// userId ab token se aata hai, isliye parameter hata diya
export const updateProfile = (data: { userName: string; userEmail: string }) =>
  api<SessionUser>(EP.profile, { method: 'PUT', body: data });

export const changePassword = (current: string, next: string) =>
  api(EP.changePassword, {
    method: 'PUT',
    body: { currentPassword: current, newPassword: next },
  });