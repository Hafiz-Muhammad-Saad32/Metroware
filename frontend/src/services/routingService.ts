export type LatLng = [number, number];
export interface Leg {
  coords: LatLng[];
  distanceKm: number;
}

const FOOT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';
const CAR = 'https://routing.openstreetmap.de/routed-car/route/v1/driving';

async function route(base: string, pts: { lat: number; lng: number }[]): Promise<Leg | null> {
  try {
    const path = pts.map((p) => `${p.lng},${p.lat}`).join(';');
    const res = await fetch(`${base}/${path}?overview=full&geometries=geojson`);
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.routes?.[0];
    if (!r) return null;
    return {
      coords: r.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng] as LatLng),
      distanceKm: r.distance / 1000,
    };
  } catch {
    return null; // internet ya server masla: caller seedhi line dikha dega
  }
}

export const walkRoute = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
  route(FOOT, [a, b]);

export const busRoute = (pts: { lat: number; lng: number }[]) =>
  pts.length >= 2 ? route(CAR, pts) : Promise.resolve(null);