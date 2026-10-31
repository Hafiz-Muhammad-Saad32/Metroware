import { buses } from '../data/buses';
import { routes } from '../data/routes';
import { stops } from '../data/stops';
import { Bus, BusRoute, Stop } from '../types';

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getRoutes(): Promise<BusRoute[]> {
  await wait();
  return routes;
}

export async function getBuses(): Promise<Bus[]> {
  await wait();
  return buses;
}

export async function getAllStops(): Promise<Stop[]> {
  await wait();
  return stops;
}

export async function getStopsByRoute(routeId: number): Promise<Stop[]> {
  await wait();
  return stops.filter((s) => s.routeId === routeId).sort((a, b) => a.stopOrder - b.stopOrder);
}

export interface StopInput {
  stopName: string;
  latitude: number;
  longitude: number;
}

export interface RouteInput {
  routeName: string;
  stops: StopInput[];
  busNumbers: string[];
}

// routeId na do to naya route banta hai, do to wahi update hota hai
export async function saveRoute(input: RouteInput, routeId?: number): Promise<number> {
  await wait();
  const startStop = input.stops[0].stopName;
  const endStop = input.stops[input.stops.length - 1].stopName;
  let id = routeId;

  if (id === undefined) {
    id = Math.max(0, ...routes.map((r) => r.routeId)) + 1;
    routes.push({ routeId: id, routeName: input.routeName, start_stop: startStop, end_stop: endStop });
  } else {
    const r = routes.find((x) => x.routeId === id);
    if (r) Object.assign(r, { routeName: input.routeName, start_stop: startStop, end_stop: endStop });
    for (let k = stops.length - 1; k >= 0; k--) if (stops[k].routeId === id) stops.splice(k, 1);
    for (let k = buses.length - 1; k >= 0; k--) if (buses[k].routeId === id) buses.splice(k, 1);
  }

  let nextStop = Math.max(0, ...stops.map((s) => s.stopId)) + 1;
  input.stops.forEach((s, i) =>
    stops.push({ stopId: nextStop++, stopName: s.stopName, routeId: id!, latitude: s.latitude, longitude: s.longitude, stopOrder: i + 1 })
  );

  let nextBus = Math.max(0, ...buses.map((b) => b.busId)) + 1;
  input.busNumbers.forEach((n) => buses.push({ busId: nextBus++, busNumber: n, routeId: id! }));

  return id;
}

// DB jaisa behaviour: bus ka routeId NULL, us route ke stops delete
export async function deleteRoute(routeId: number) {
  await wait();
  const i = routes.findIndex((r) => r.routeId === routeId);
  if (i >= 0) routes.splice(i, 1);
  buses.forEach((b) => { if (b.routeId === routeId) b.routeId = null; });
  for (let k = stops.length - 1; k >= 0; k--) if (stops[k].routeId === routeId) stops.splice(k, 1);
}