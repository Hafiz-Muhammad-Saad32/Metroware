import { BusRoute, Stop } from '../types';
import { haversineKm } from './distance';

export interface Point {
  lat: number;
  lng: number;
}

export interface Plan {
  route: BusRoute;
  board: Stop;
  drop: Stop;
  walkToBoardKm: number;
  walkFromDropKm: number;
  ride: Stop[]; // board se drop tak ke stops, tarteeb se
}

function nearest(p: Point, list: Stop[]) {
  let best: { stop: Stop; km: number } | null = null;
  for (const s of list) {
    const km = haversineKm(p.lat, p.lng, s.latitude, s.longitude);
    if (!best || km < best.km) best = { stop: s, km };
  }
  return best;
}

export function planTrip(origin: Point, dest: Point, routes: BusRoute[], stops: Stop[]): Plan | null {
  let best: Plan | null = null;

  for (const route of routes) {
    const rs = stops
      .filter((s) => s.routeId === route.routeId)
      .sort((a, b) => a.stopOrder - b.stopOrder);
    if (rs.length < 2) continue;

    const b = nearest(origin, rs);
    const d = nearest(dest, rs);
    if (!b || !d || b.stop.stopId === d.stop.stopId) continue;

    const total = b.km + d.km;
    if (!best || total < best.walkToBoardKm + best.walkFromDropKm) {
      const lo = Math.min(b.stop.stopOrder, d.stop.stopOrder);
      const hi = Math.max(b.stop.stopOrder, d.stop.stopOrder);
      let ride = rs.filter((s) => s.stopOrder >= lo && s.stopOrder <= hi);
      if (b.stop.stopOrder > d.stop.stopOrder) ride = ride.reverse();
      best = {
        route,
        board: b.stop,
        drop: d.stop,
        walkToBoardKm: b.km,
        walkFromDropKm: d.km,
        ride,
      };
    }
  }
  return best;
}