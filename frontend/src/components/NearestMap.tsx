import { createElement } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { LatLng } from '../services/routingService';
import { Plan, Point } from '../utils/nearest';

export interface Geo {
  walk1: LatLng[] | null;
  walk2: LatLng[] | null;
  bus: LatLng[] | null;
}

export default function NearestMap({
  origin, dest, plan, geo,
}: { origin: Point; dest: Point; plan: Plan; geo: Geo }) {
  const data = {
    origin,
    dest,
    board: { lat: plan.board.latitude, lng: plan.board.longitude, name: plan.board.stopName },
    drop: { lat: plan.drop.latitude, lng: plan.drop.longitude, name: plan.drop.stopName },
    ride: plan.ride.map((s) => ({ lat: s.latitude, lng: s.longitude, name: s.stopName })),
    geo,
  };

  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0}</style></head>
<body><div id="map"></div><script>
const d = ${JSON.stringify(data)};
const map = L.map('map', { scrollWheelZoom: false });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {maxZoom:19, attribution:'© OpenStreetMap'}).addTo(map);

const P = (p) => [p.lat, p.lng];
const walk = {color:'#F2A93B', weight:5, dashArray:'8 8'};

const busLine = L.polyline(d.geo.bus || d.ride.map(P), {color:'#0B7A5E', weight:6}).addTo(map);
const w1 = L.polyline(d.geo.walk1 || [P(d.origin), P(d.board)], walk).addTo(map);
const w2 = L.polyline(d.geo.walk2 || [P(d.drop), P(d.dest)], walk).addTo(map);

d.ride.forEach(s => L.circleMarker(P(s),
  {radius:5, color:'#0B7A5E', fillColor:'#fff', fillOpacity:1, weight:2}).addTo(map).bindPopup(s.name));

const pin = (p, color, label) => L.circleMarker(P(p),
  {radius:10, color:'#fff', weight:3, fillColor:color, fillOpacity:1}).addTo(map).bindPopup(label);
pin(d.origin, '#2563EB', 'Your location');
pin(d.board, '#0B7A5E', 'Board here: ' + d.board.name);
pin(d.drop, '#B3261E', 'Get off here: ' + d.drop.name);
pin(d.dest, '#10201C', 'Destination');

map.fitBounds(L.featureGroup([busLine, w1, w2]).getBounds(), {padding:[40,40]});
</script></body></html>`;

  const key = `${plan.board.stopId}-${plan.drop.stopId}-${origin.lat}-${dest.lat}-${geo.bus ? 1 : 0}`;

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