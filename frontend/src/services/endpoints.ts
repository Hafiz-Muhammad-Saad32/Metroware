export const BASE_URL = 'http://192.168.x.x:8080/api'; // apna laptop IP
export const USE_MOCK = true; // backend ready hone pe false

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
};