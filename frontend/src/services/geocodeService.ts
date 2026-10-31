async function search(q: string) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1' +
    '&viewbox=66.7,25.3,67.6,24.6&q=' + encodeURIComponent(q);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Location search failed, check internet');
  return res.json();
}

export async function geocode(place: string): Promise<{ lat: number; lng: number } | null> {
  let data = await search(place);
  if (!data.length) data = await search(place + ', Karachi');
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}