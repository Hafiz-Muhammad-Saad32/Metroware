import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import NearestMap, { Geo } from '../../components/NearestMap';
import { geocode } from '../../services/geocodeService';
import { planTrip } from '../../services/routeService';
import { busRoute, walkRoute } from '../../services/routingService';
import { formatDistance, walkMinutes } from '../../utils/distance';
import { Plan, Point } from '../../utils/nearest';

export default function Nearest() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [points, setPoints] = useState<{ origin: Point; dest: Point } | null>(null);
  const [geo, setGeo] = useState<Geo>({ walk1: null, walk2: null, bus: null });
  const [walk, setWalk] = useState({ toBoard: 0, fromDrop: 0 });
  const [busNumbers, setBusNumbers] = useState('');

  const search = async () => {
    if (!from.trim() || !to.trim()) return setError('Enter both places');
    setError('');
    setPlan(null);
    setBusy(true);
    try {
      const a = await geocode(from);
      if (!a) throw new Error(`Could not find "${from}"`);
      const b = await geocode(to);
      if (!b) throw new Error(`Could not find "${to}"`);

      // backend nearest stops aur route nikalta hai
      const p = await planTrip(a, b);

      // asli sadkon wale raaste (fail ho to null, map seedhi line dikha dega)
      const boardPt = { lat: p.board.latitude, lng: p.board.longitude };
      const dropPt = { lat: p.drop.latitude, lng: p.drop.longitude };
      const [w1, w2, bus] = await Promise.all([
        walkRoute(a, boardPt),
        walkRoute(dropPt, b),
        busRoute(p.ride.map((s) => ({ lat: s.latitude, lng: s.longitude }))),
      ]);

      setGeo({ walk1: w1?.coords ?? null, walk2: w2?.coords ?? null, bus: bus?.coords ?? null });
      setWalk({
        toBoard: w1?.distanceKm ?? p.walkToBoardKm,
        fromDrop: w2?.distanceKm ?? p.walkFromDropKm,
      });
      setBusNumbers(p.busNumbers.join(', '));
      setPoints({ origin: a, dest: b });
      setPlan(p);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };


return (
  <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <View>
      <Text style={s.label}>Where you will board</Text>
      <TextInput style={s.input} value={from} onChangeText={setFrom} placeholder="e.g. North Nazimabad" />
    </View>
    <View>
      <Text style={s.label}>Where you will get off</Text>
      <TextInput style={s.input} value={to} onChangeText={setTo} placeholder="e.g. Saddar" />
    </View>

    {!!error && <Text style={s.error}>{error}</Text>}

    <Pressable style={s.button} onPress={search} disabled={busy}>
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Find nearest stops</Text>}
    </Pressable>

    {plan && points && (
      <>
        <View style={[s.card, { borderLeftColor: '#0B7A5E' }]}>
          <View style={[s.icon, { backgroundColor: '#DDF1EA' }]}>
            <Ionicons name="log-in" size={22} color="#0B7A5E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.muted}>Board at</Text>
            <Text style={s.bold}>{plan.board.stopName}</Text>
            <Text style={s.muted}>
              Walk {formatDistance(walk.toBoard)} · about {walkMinutes(walk.toBoard)} min
            </Text>
          </View>
        </View>

        <View style={[s.card, { borderLeftColor: '#B3261E' }]}>
          <View style={[s.icon, { backgroundColor: '#FBE9E7' }]}>
            <Ionicons name="log-out" size={22} color="#B3261E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.muted}>Get off at</Text>
            <Text style={s.bold}>{plan.drop.stopName}</Text>
            <Text style={s.muted}>
              Walk {formatDistance(walk.fromDrop)} · about {walkMinutes(walk.fromDrop)} min
            </Text>
          </View>
        </View>

        <View style={[s.card, { borderLeftColor: '#2563EB' }]}>
          <View style={[s.icon, { backgroundColor: '#E5EDFD' }]}>
            <Ionicons name="bus" size={22} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.muted}>Bus to take</Text>
            <Text style={s.bold}>{plan.route.routeName}</Text>
            <Text style={s.muted}>
              {busNumbers ? `Buses: ${busNumbers} · ` : ''}{plan.ride.length - 1} stops
            </Text>
          </View>
        </View>

        <View style={s.map}>
          <NearestMap origin={points.origin} dest={points.dest} plan={plan} geo={geo} />
        </View>

        <View style={s.legend}>
          <Legend color="#2563EB" text="Your location" />
          <Legend color="#0B7A5E" text="Board here" />
          <Legend color="#B3261E" text="Get off here" />
          <Legend color="#10201C" text="Destination" />
          <View style={s.legendItem}>
            <View style={s.dash} />
            <Text style={s.muted}>Walking</Text>
          </View>
        </View>
      </>
    )}
  </ScrollView>
);
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={s.muted}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C', marginBottom: 6 },
  input: {
    height: 46, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
    paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff',
  },
  error: { color: '#B3261E' },
  button: { height: 50, borderRadius: 12, backgroundColor: '#0B7A5E', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderWidth: 1, borderColor: '#E3EAE7', borderLeftWidth: 5,
  },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bold: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
  map: { height: 450, borderRadius: 16, overflow: 'hidden' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dash: { width: 18, height: 0, borderTopWidth: 3, borderColor: '#F2A93B', borderStyle: 'dashed' },
});