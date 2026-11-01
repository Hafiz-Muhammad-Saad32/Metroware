import { Platform } from 'react-native';

const LAN_IP = '192.168.1.12'; // <-- apni laptop ki IP yahan likho

export const BASE_URL =
  Platform.OS === 'web' ? 'http://localhost:8080/api' : `http://${LAN_IP}:8080/api`;

export const EP = {
  signup: '/auth/signup',
  login: '/auth/login',
  routes: '/routes',
  route: (id: number) => `/routes/${id}`,
  routeStops: (id: number) => `/routes/${id}/stops`,
  buses: '/buses',
  bus: (id: number) => `/buses/${id}`,
  stops: '/stops',
  stop: (id: number) => `/stops/${id}`,
  complaints: '/complaints',
  complaint: (id: number) => `/complaints/${id}`,
  lostFound: '/lost-found',
  lostFoundItem: (id: number) => `/lost-found/${id}`,
  adminUsers: '/admin/users',
  tickets: '/tickets',
  myTickets: '/tickets/my',
  adminTickets: '/admin/tickets',
  bookingPaid: (bookingId: number) => `/admin/tickets/booking/${bookingId}/paid`,
  profile: '/users/me',
  changePassword: '/users/me/password',
};