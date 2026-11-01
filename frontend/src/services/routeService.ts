import { Bus, BusRoute, Stop } from '../types';
import { Plan, Point } from '../utils/nearest';
import { api } from './api';
import { EP } from './endpoints';

export const getRoutes = () => api<BusRoute[]>(EP.routes);
export const getBuses = () => api<Bus[]>(EP.buses);
export const getAllStops = () => api<Stop[]>(EP.stops);
export const getStopsByRoute = (routeId: number) => api<Stop[]>(EP.routeStops(routeId));

export interface StopInput {
  stopName: string;
  latitude: number;
  longitude: number;
}

export interface RouteInput {
  routeName: string;
  stops: StopInput[];
  busCount: number;
}

// routeId na ho to naya route banta hai, ho to update. Bus numbers backend khud banata hai.
export async function saveRoute(input: RouteInput, routeId?: number): Promise<number> {
  const saved =
    routeId === undefined
      ? await api<{ routeId: number }>(EP.routes, { method: 'POST', body: input })
      : await api<{ routeId: number }>(EP.route(routeId), { method: 'PUT', body: input });
  return saved.routeId;
}

// stops delete ho jate hain, buses ka routeId null ho jata hai
export async function deleteRoute(routeId: number): Promise<void> {
  await api(EP.route(routeId), { method: 'DELETE' });
}

// nearest route: backend hisaab karta hai
export const planTrip = (origin: Point, dest: Point) =>
  api<Plan>(
    `${EP.routes}/plan?fromLat=${origin.lat}&fromLng=${origin.lng}&toLat=${dest.lat}&toLng=${dest.lng}`
  );