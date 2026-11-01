import { SessionUser } from '../types';
import { api } from './api';
import { EP } from './endpoints';

export const getUsers = () => api<SessionUser[]>(EP.adminUsers);