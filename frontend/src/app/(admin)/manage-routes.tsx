import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { deleteRoute, getAllStops, getBuses, getRoutes } from '../../services/routeService';
import { Bus, BusRoute, Stop } from '../../types';
import { confirmDelete } from '../../utils/confirm';

export default function ManageRoutes() {
  const router = useRouter();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([getRoutes(), getAllStops(), getBuses()]).then(([r, st, b]) => {
      setRoutes([...r]);
      setStops([...st]);
      setBuses([...b]);
      setLoading(false);
    });
  }, []);

  useFocusEffect(load);

  const remove = async (r: BusRoute) => {
    if (await confirmDelete(`Delete ${r.routeName}? Its stops will be deleted too.`)) {
      await deleteRoute(r.routeId);
      load();
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#F4F6F5' }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={routes}
      keyExtractor={(r) => String(r.routeId)}
      ListHeaderComponent={
        <Pressable style={s.add} onPress={() => router.push('/route-form' as any)}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={s.addText}>Add new route</Text>
        </Pressable>
      }
      ListEmptyComponent={<Text style={s.muted}>No routes yet</Text>}
      renderItem={({ item }) => {
        const count = stops.filter((x) => x.routeId === item.routeId).length;
        const nums = buses.filter((b) => b.routeId === item.routeId).map((b) => b.busNumber);
        return (
          <View style={s.card}>
            <View style={s.iconWrap}>
              <Ionicons name="git-branch" size={22} color="#0B7A5E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.bold}>{item.routeName}</Text>
              <Text style={s.muted}>{item.startStop} → {item.endStop}</Text>
              <Text style={s.muted}>
                {count} stops·{nums.length}  bus(es)·every 15 min
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => router.push({ pathname: '/route-form', params: { routeId: String(item.routeId) } } as any)}
            >
              <Ionicons name="create-outline" size={22} color="#0B7A5E" />
            </Pressable>
            <Pressable hitSlop={10} onPress={() => remove(item)}>
              <Ionicons name="trash-outline" size={22} color="#B3261E" />
            </Pressable>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  add: {
    height: 50, borderRadius: 12, backgroundColor: '#0B7A5E', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4,
  },
  addText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderWidth: 1, borderColor: '#E3EAE7', borderLeftWidth: 5, borderLeftColor: '#0B7A5E',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#DDF1EA',
    alignItems: 'center', justifyContent: 'center',
  },
  bold: { fontSize: 16, fontWeight: '700', color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55' },
});