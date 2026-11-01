import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Dropdown from '../../components/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { getAllStops, getBuses, getRoutes } from '../../services/routeService';
import { Quote, bookTickets, getQuote } from '../../services/ticketService';
import { Bus, BusRoute, PaymentMethod, Stop } from '../../types';

export default function BookTicket() {
  const { user } = useAuth();
  const router = useRouter();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  const [busId, setBusId] = useState<number | null>(null);
  const [pickup, setPickup] = useState<number | null>(null);
  const [drop, setDrop] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState('');
  const [busyQuote, setBusyQuote] = useState(false);
  const [busyBook, setBusyBook] = useState(false);

  useEffect(() => {
    Promise.all([getBuses(), getRoutes(), getAllStops()]).then(([b, r, st]) => {
      setBuses([...b]);
      setRoutes([...r]);
      setStops([...st]);
      setLoading(false);
    });
  }, []);

  const bus = buses.find((b) => b.busId === busId);
  const route = routes.find((r) => r.routeId === bus?.routeId);

  const routeStops = useMemo(
    () =>
      bus?.routeId
        ? stops.filter((s) => s.routeId === bus.routeId).sort((a, b) => a.stopOrder - b.stopOrder)
        : [],
    [bus?.routeId, stops]
  );

  const busOptions = buses
    .filter((b) => b.routeId !== null)
    .map((b) => ({
      value: b.busId,
      label: `${b.busNumber} · ${routes.find((r) => r.routeId === b.routeId)?.routeName ?? ''}`,
    }));
  const stopOptions = routeStops.map((s) => ({ value: s.stopId, label: `${s.stopOrder}. ${s.stopName}` }));

  const clearQuote = () => {
    setQuote(null);
    setMethod(null);
    setError('');
  };

  const pickBus = (id: number) => {
    setBusId(id);
    setPickup(null);
    setDrop(null);
    clearQuote();
  };

  const changeQty = (d: number) => {
    setQty((q) => Math.min(10, Math.max(1, q + d)));
    clearQuote();
  };

  const checkPrice = async () => {
    setError('');
    if (!busId) return setError('Select a bus first');
    if (!pickup || !drop) return setError('Select pickup and drop stops');
    setBusyQuote(true);
    try {
      setQuote(await getQuote(pickup, drop, qty));
    } catch (e: any) {
      setQuote(null);
      setError(e.message);
    } finally {
      setBusyQuote(false);
    }
  };

  const confirm = async () => {
    if (!quote || !method || !user || !busId || !pickup || !drop) return;
    if (method === 'easypaisa') {
      router.push({
        pathname: '/easypaisa',
        params: { busId: String(busId), pickup: String(pickup), drop: String(drop), qty: String(qty) },
      } as any);
      return;
    }
    setBusyBook(true);
    try {
      await bookTickets({
        busId, pickupStopId: pickup, dropStopId: drop, quantity: qty, paymentMethod: 'cash',
      });
      router.replace({ pathname: '/my-tickets', params: { booked: String(qty) } } as any);
    } catch (e: any) {
      setError(e.message);
      setBusyBook(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0B7A5E" />;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Dropdown label="Bus" value={busId} options={busOptions} onChange={pickBus} placeholder="Select bus" />

      {route && (
        <View style={s.routeInfo}>
          <Ionicons name="git-branch" size={18} color="#0B7A5E" />
          <Text style={s.routeText}>{route.routeName}: {route.startStop} → {route.endStop}</Text>
        </View>
      )}

      <Dropdown
        label="Pickup stop"
        value={pickup}
        options={stopOptions}
        onChange={(v) => { setPickup(v); clearQuote(); }}
        placeholder={busId ? 'Select pickup stop' : 'Select a bus first'}
        disabled={!busId}
      />
      <Dropdown
        label="Drop stop"
        value={drop}
        options={stopOptions}
        onChange={(v) => { setDrop(v); clearQuote(); }}
        placeholder={busId ? 'Select drop stop' : 'Select a bus first'}
        disabled={!busId}
      />

      <View>
        <Text style={s.label}>Number of tickets</Text>
        <View style={s.stepper}>
          <Pressable style={s.stepBtn} onPress={() => changeQty(-1)}>
            <Ionicons name="remove" size={22} color="#0B7A5E" />
          </Pressable>
          <Text style={s.qty}>{qty}</Text>
          <Pressable style={s.stepBtn} onPress={() => changeQty(1)}>
            <Ionicons name="add" size={22} color="#0B7A5E" />
          </Pressable>
        </View>
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      <Pressable style={s.button} onPress={checkPrice} disabled={busyQuote}>
        {busyQuote ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Check price</Text>}
      </Pressable>

      {quote && (
        <>
          <View style={s.priceCard}>
            <Text style={s.muted}>{quote.distanceKm.toFixed(1)} km · up to 15 km Rs 80, above Rs 120</Text>
            <Text style={s.calc}>Rs {quote.unitPrice} × {quote.quantity}</Text>
            <Text style={s.total}>Rs {quote.total}</Text>
          </View>

          <Text style={s.label}>Payment method</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={[s.method, method === 'cash' && s.methodActive]} onPress={() => setMethod('cash')}>
              <Ionicons name="cash-outline" size={26} color={method === 'cash' ? '#0B7A5E' : '#4A5A55'} />
              <Text style={s.methodTitle}>Cash</Text>
              <Text style={s.muted}>Pay at counter</Text>
            </Pressable>
            <Pressable style={[s.method, method === 'easypaisa' && s.methodActive]} onPress={() => setMethod('easypaisa')}>
              <Ionicons name="phone-portrait-outline" size={26} color={method === 'easypaisa' ? '#0B7A5E' : '#4A5A55'} />
              <Text style={s.methodTitle}>Easypaisa</Text>
              <Text style={s.muted}>Demo payment</Text>
            </Pressable>
          </View>

          <Pressable style={[s.button, !method && { opacity: 0.5 }]} onPress={confirm} disabled={!method || busyBook}>
            {busyBook ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.buttonText}>
                {method === 'easypaisa' ? 'Continue to Easypaisa' : 'Confirm booking (pay cash)'}
              </Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C', marginBottom: 6 },
  muted: { fontSize: 13, color: '#4A5A55' },
  routeInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF7F4',
    padding: 12, borderRadius: 12,
  },
  routeText: { fontSize: 14, color: '#10201C', fontWeight: '600', flexShrink: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stepBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#0B7A5E',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  qty: { fontSize: 22, fontWeight: '700', color: '#10201C', minWidth: 30, textAlign: 'center' },
  error: { color: '#B3261E' },
  button: { height: 52, borderRadius: 12, backgroundColor: '#0B7A5E', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  priceCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 4, borderWidth: 1,
    borderColor: '#E3EAE7', borderLeftWidth: 5, borderLeftColor: '#0B7A5E',
  },
  calc: { fontSize: 16, color: '#10201C' },
  total: { fontSize: 30, fontWeight: '800', color: '#0B7A5E' },
  method: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 4,
    borderWidth: 2, borderColor: '#E3EAE7', alignItems: 'center',
  },
  methodActive: { borderColor: '#0B7A5E', backgroundColor: '#EEF7F4' },
  methodTitle: { fontSize: 16, fontWeight: '700', color: '#10201C' },
});