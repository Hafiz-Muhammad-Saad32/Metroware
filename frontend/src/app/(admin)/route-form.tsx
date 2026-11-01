import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { geocode } from '../../services/geocodeService';
import { getAllStops, getBuses, getRoutes, saveRoute, StopInput } from '../../services/routeService';

interface Row {
  key: number;
  name: string;
  coords: string;
  locked?: boolean; // coords DB se aaye hain; naam badle to hata do
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function RouteForm() {
  const { routeId } = useLocalSearchParams<{ routeId?: string }>();
  const editing = routeId ? Number(routeId) : undefined;
  const router = useRouter();
  const nextKey = useRef(3);

  const [routeName, setRouteName] = useState('');
  const [busCount, setBusCount] = useState('1')
  const [rows, setRows] = useState<Row[]>([
    { key: 1, name: '', coords: '' },
    { key: 2, name: '', coords: '' },
  ]);
  const [loading, setLoading] = useState(!!editing);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const [routes, stops, buses] = await Promise.all([getRoutes(), getAllStops(), getBuses()]);
      const r = routes.find((x) => x.routeId === editing);
      if (r) {
        setRouteName(r.routeName);
        setBusCount(String(Math.max(1, buses.filter((b) => b.routeId === editing).length)));
        const loaded: Row[] = stops
          .filter((s) => s.routeId === editing)
          .sort((a, b) => a.stopOrder - b.stopOrder)
          .map((s) => ({
            key: nextKey.current++,
            name: s.stopName,
            coords: `${s.latitude}, ${s.longitude}`,
            locked: true,
          }));
        while (loaded.length < 2) loaded.push({ key: nextKey.current++, name: '', coords: '' });
        setRows(loaded);
      }
      setLoading(false);
    })();
  }, [editing]);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: number) => setRows((rs) => (rs.length > 2 ? rs.filter((r) => r.key !== key) : rs));
  const add = () => setRows((rs) => [...rs, { key: nextKey.current++, name: '', coords: '' }]);
  const move = (i: number, dir: number) =>
    setRows((rs) => {
      const j = i + dir;
      if (j < 0 || j >= rs.length) return rs;
      const c = [...rs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  const save = async () => {
    setError('');
    if (!routeName.trim()) return setError('Route name is required');
    if (rows.some((r) => !r.name.trim())) return setError('Fill every stop name, or remove the empty ones');
    if (!parseInt(busCount, 10)) return setError('Enter the number of buses (1 or more)');

    setBusy(true);
    try {
      const out: StopInput[] = [];
      let geocodedBefore = false;
      for (let i = 0; i < rows.length; i++) {
        const name = rows[i].name.trim();
        const manual = rows[i].coords.trim();
        if (manual) {
          const p = manual.split(',').map((x) => parseFloat(x.trim()));
          if (p.length !== 2 || p.some(isNaN)) {
            throw new Error(`Stop ${i + 1}: coordinates should look like 24.8727, 67.0338`);
          }
          out.push({ stopName: name, latitude: p[0], longitude: p[1] });
        } else {
          setProgress(`Finding location ${i + 1} of ${rows.length}...`);
          if (geocodedBefore) await sleep(1100);
          const g = await geocode(name);
          geocodedBefore = true;
          if (!g) {
            throw new Error(`Could not find "${name}" on the map. Type its coordinates in the box under it.`);
          }
          out.push({ stopName: name, latitude: g.lat, longitude: g.lng });
        }
      }
      await saveRoute(
        { routeName: routeName.trim(), stops: out, busCount: parseInt(busCount, 10) },
        editing
      );
      router.back();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: editing ? 'Edit route' : 'Add route' }} />

      <View>
        <Text style={s.label}>Route name</Text>
        <TextInput style={s.input} value={routeName} onChangeText={setRouteName} placeholder="e.g. Green Line" />
      </View>

      <View>
        <Text style={s.label}>Number of buses on this route</Text>
        <TextInput
          style={s.input}
          value={busCount}
          onChangeText={(t) => setBusCount(t.replace(/\D/g, '').slice(0, 2))}
          placeholder="e.g. 5"
          keyboardType="number-pad"
        />
      </View>

      {rows.map((r, i) => {
        const first = i === 0;
        const last = i === rows.length - 1;
        const color = first ? '#0B7A5E' : last ? '#F2A93B' : '#9FB0AA';
        return (
          <View key={r.key} style={[s.card, { borderLeftColor: color }]}>
            <View style={s.rowTop}>
              <View style={[s.num, { backgroundColor: color }]}>
                <Text style={s.numText}>{i + 1}</Text>
              </View>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={r.name}
                onChangeText={(t) => update(r.key, { name: t, ...(r.locked ? { coords: '', locked: false } : {}) })}
                placeholder={first ? 'First stop' : last ? 'Last stop' : 'Stop name'}
              />
            </View>
            <TextInput
              style={[s.input, s.small]}
              value={r.coords}
              onChangeText={(t) => update(r.key, { coords: t, locked: false })}
              placeholder="Coordinates (optional): 24.8727, 67.0338"
            />
            <View style={s.actions}>
              <Pressable onPress={() => move(i, -1)} hitSlop={8} disabled={first}>
                <Ionicons name="arrow-up" size={20} color={first ? '#C7D1CD' : '#0B7A5E'} />
              </Pressable>
              <Pressable onPress={() => move(i, 1)} hitSlop={8} disabled={last}>
                <Ionicons name="arrow-down" size={20} color={last ? '#C7D1CD' : '#0B7A5E'} />
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable onPress={() => remove(r.key)} hitSlop={8} disabled={rows.length <= 2}>
                <Ionicons name="trash-outline" size={20} color={rows.length <= 2 ? '#C7D1CD' : '#B3261E'} />
              </Pressable>
            </View>
          </View>
        );
      })}

      <Pressable style={s.addStop} onPress={add}>
        <Ionicons name="add" size={20} color="#0B7A5E" />
        <Text style={s.addStopText}>Add another stop</Text>
      </Pressable>

      <Text style={s.hint}>
        Coordinates khali chhodo to app stop ke naam se map pe location khud dhoondh legi.
      </Text>

      {!!error && <Text style={s.error}>{error}</Text>}

      <Pressable style={s.button} onPress={save} disabled={busy}>
        {busy ? (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <ActivityIndicator color="#fff" />
            <Text style={s.buttonText}>{progress || 'Saving...'}</Text>
          </View>
        ) : (
          <Text style={s.buttonText}>{editing ? 'Update route' : 'Save route'}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C', marginBottom: 6 },
  section: { fontSize: 16, fontWeight: '700', color: '#10201C', marginTop: 4 },
  input: {
    height: 46, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
    paddingHorizontal: 14, fontSize: 16, backgroundColor: '#fff',
  },
  small: { height: 40, fontSize: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 12, gap: 8, borderWidth: 1,
    borderColor: '#E3EAE7', borderLeftWidth: 5,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  num: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  numText: { color: '#fff', fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  addStop: {
    height: 46, borderRadius: 12, borderWidth: 2, borderColor: '#0B7A5E', borderStyle: 'dashed',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  addStopText: { color: '#0B7A5E', fontWeight: '600', fontSize: 15 },
  hint: { fontSize: 13, color: '#4A5A55' },
  error: { color: '#B3261E' },
  button: {
    height: 52, borderRadius: 12, backgroundColor: '#0B7A5E', alignItems: 'center',
    justifyContent: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});