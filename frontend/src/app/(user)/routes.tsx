import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import RouteMap from '../../components/RouteMap';
import { getBuses, getRoutes, getStopsByRoute } from '../../services/routeService';
import { Bus, BusRoute, Stop } from '../../types';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // screen jab bhi samne aaye, routes dobara lo (admin ne naya add kia ho to dikhe)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getRoutes(), getBuses()]).then(([r, b]) => {
        if (!active) return;
        setRoutes([...r]);
        setBuses([...b]);
        setSelectedId((prev) =>
          prev !== null && r.some((x) => x.routeId === prev) ? prev : r[0]?.routeId ?? null
        );
        setLoading(false);
      });
      return () => { active = false; };
    }, [])
  );

  useEffect(() => {
    if (selectedId === null) setStops([]);
    else getStopsByRoute(selectedId).then(setStops);
  }, [selectedId, routes]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  const route = routes.find((r) => r.routeId === selectedId);
  const routeBuses = buses.filter((b) => b.routeId === selectedId);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View>
        <Text style={s.label}>Select route</Text>
        <Pressable style={s.select} onPress={() => setOpen((o) => !o)}>
          <Text style={s.selectText}>{route ? route.routeName : 'No routes available'}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color="#4A5A55" />
        </Pressable>

        {open && (
          <View style={s.menu}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }}>
              {routes.map((r) => (
                <Pressable
                  key={r.routeId}
                  style={[s.option, r.routeId === selectedId && s.optionActive]}
                  onPress={() => { setSelectedId(r.routeId); setOpen(false); }}
                >
                  <Text style={[s.optionText, r.routeId === selectedId && { color: '#0B7A5E' }]}>
                    {r.routeName}
                  </Text>
                  {r.routeId === selectedId && <Ionicons name="checkmark" size={20} color="#0B7A5E" />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {route && (
        <View style={s.info}>
          <Text style={s.infoTitle}>{route.start_stop} → {route.end_stop}</Text>
          <View style={s.busRow}>
            <Ionicons name="bus" size={18} color="#0B7A5E" />
            <Text style={s.muted}>
              {routeBuses.length ? routeBuses.map((b) => b.busNumber).join(', ') : 'No bus assigned yet'}
            </Text>
          </View>
        </View>
      )}

      <View style={s.map}>
        <RouteMap stops={stops} />
      </View>

      <Text style={s.section}>Stops ({stops.length})</Text>
      {stops.length === 0 && <Text style={s.muted}>No stops added for this route yet.</Text>}

      {stops.map((st, idx) => {
        const first = idx === 0;
        const last = idx === stops.length - 1 && stops.length > 1;
        const color = first ? '#0B7A5E' : last ? '#F2A93B' : '#9FB0AA';
        return (
          <View key={st.stopId} style={[s.card, { borderLeftColor: color }]}>
            <View style={[s.num, { backgroundColor: color }]}>
              <Text style={s.numText}>{st.stopOrder}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.stopName}>{st.stopName}</Text>
              <Text style={s.muted}>{first ? 'First stop' : last ? 'Last stop' : 'Stop ' + st.stopOrder}</Text>
            </View>
            <Ionicons
              name={first ? 'flag' : last ? 'location' : 'ellipse-outline'}
              size={22}
              color={color}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#10201C' },
  select: {
    height: 48, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12, backgroundColor: '#fff',
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectText: { fontSize: 16, color: '#10201C', fontWeight: '600' },
  menu: {
    marginTop: 6, borderWidth: 1, borderColor: '#E3EAE7', borderRadius: 12,
    backgroundColor: '#fff', overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 14, height: 46, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F4F2',
  },
  optionActive: { backgroundColor: '#EEF7F4' },
  optionText: { fontSize: 15, color: '#10201C' },
  info: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 6, borderWidth: 1, borderColor: '#E3EAE7' },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  busRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  map: { height: 600, borderRadius: 16, overflow: 'hidden' },
  section: { fontSize: 16, fontWeight: '700', color: '#10201C', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderWidth: 1, borderColor: '#E3EAE7', borderLeftWidth: 5,
  },
  num: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  numText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  stopName: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
});