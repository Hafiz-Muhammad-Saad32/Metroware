import { createElement } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stop } from '../types';

export default function RouteMap({ stops, path }: { stops: Stop[]; path?: [number, number][] | null }) {
  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0}</style></head>
<body><div id="map"></div><script>
const stops = ${JSON.stringify(stops)};
const map = L.map('map');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {maxZoom:19, attribution:'© OpenStreetMap'}).addTo(map);
const pts = stops.map(s => [s.latitude, s.longitude]);
if (pts.length) {
  L.polyline(${JSON.stringify(path ?? null)} || pts, {color:'#0B7A5E', weight:5}).addTo(map);
  stops.forEach(s => L.circleMarker([s.latitude, s.longitude],
    {radius:8, color:'#0B7A5E', fillColor:'#fff', fillOpacity:1, weight:3})
    .addTo(map).bindPopup(s.stopName));
  map.fitBounds(pts, {padding:[30,30]});
} else { map.setView([24.86, 67.01], 11); }
</script></body></html>`;

  const key = stops.map((s) => s.stopId).join('-') + (path ? '-r' : '');

  if (Platform.OS === 'web') {
    return createElement('iframe', {
      key,
      srcDoc: html,
      style: { width: '100%', height: '100%', border: 0 },
    });
  }

  return (
    <WebView
      key={key}
      originWhitelist={['*']}
      source={{ html, baseUrl: 'https://localhost' }}
      style={{ flex: 1 }}
    />
  );
}