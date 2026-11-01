import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Quote, bookTickets, getQuote } from '../../services/ticketService';
import { formatDate } from '../../utils/formate';

export default function Easypaisa() {
  const { busId, pickup, drop, qty } = useLocalSearchParams<{
    busId: string; pickup: string; drop: string; qty: string;
  }>();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ transactionId: string; paidAt: string; amount: number; count: number } | null>(null);

  useEffect(() => {
    getQuote(Number(pickup), Number(drop), Number(qty)).then(setQuote).catch((e) => setError(e.message));
  }, [pickup, drop, qty]);

  const pay = async () => {
    setError('');
    if (!quote) return;
    if (!/^03\d{9}$/.test(mobile)) return setError('Enter a valid 11 digit number, like 03001234567');
    if (!/^\d{5}$/.test(pin)) return setError('PIN must be 5 digits');
    setBusy(true);
    try {
      // payment aur booking backend ek saath karta hai
      const created = await bookTickets({
        busId: Number(busId),
        pickupStopId: Number(pickup),
        dropStopId: Number(drop),
        quantity: Number(qty),
        paymentMethod: 'easypaisa',
        mobile,
        pin,
      });
      const first = created[0];
      setResult({
        transactionId: first.transactionId ?? '',
        paidAt: first.bookedAt,
        amount: created.reduce((sum, t) => sum + t.price, 0),
        count: created.length,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <View style={s.success}>
          <Ionicons name="checkmark-circle" size={84} color="#2DA54E" />
          <Text style={s.successTitle}>Payment successful</Text>
          <Text style={s.muted}>This was a demo payment, no real money was charged.</Text>

          <View style={s.receipt}>
            <Row label="Transaction ID" value={result.transactionId} />
            <Row label="Amount" value={`Rs ${result.amount}`} />
            <Row label="Tickets" value={String(result.count)} />
            <Row label="Date & time" value={formatDate(result.paidAt)} />
            <Row label="Paid to" value="Metroware" />
          </View>
        </View>

        <Pressable style={s.pay} onPress={() => router.replace({ pathname: '/my-tickets', params: { booked: String(result.count) } } as any)}>
          <Text style={s.payText}>View tickets</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.banner}>
        <View style={s.bannerTop}>
          <Text style={s.logo}>easypaisa</Text>
          <Text style={s.demo}>DEMO</Text>
        </View>
        <Text style={s.bannerSub}>Pay to: Metroware</Text>
        <Text style={s.amount}>{quote ? `Rs ${quote.total}` : '...'}</Text>
        {quote && <Text style={s.bannerSub}>{quote.quantity} ticket(s) × Rs {quote.unitPrice}</Text>}
      </View>

      <Text style={s.notice}>Demo payment screen. No real money is charged. Enter PIN 00000 to see a failed payment.</Text>

      <View>
        <Text style={s.label}>Easypaisa mobile number</Text>
        <TextInput
          style={s.input}
          value={mobile}
          onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 11))}
          placeholder="03XXXXXXXXX"
          keyboardType="number-pad"
        />
      </View>

      <View>
        <Text style={s.label}>5 digit PIN</Text>
        <TextInput
          style={s.input}
          value={pin}
          onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 5))}
          placeholder="•••••"
          secureTextEntry
          keyboardType="number-pad"
        />
      </View>

      {!!error && (
        <View style={s.errorBox}>
          <Ionicons name="close-circle" size={20} color="#B3261E" />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <Pressable style={s.pay} onPress={pay} disabled={busy || !quote}>
        {busy ? (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <ActivityIndicator color="#fff" />
            <Text style={s.payText}>Processing...</Text>
          </View>
        ) : (
          <Text style={s.payText}>Pay {quote ? `Rs ${quote.total}` : ''}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.muted}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F5' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  banner: { backgroundColor: '#2DA54E', borderRadius: 18, padding: 18, gap: 4 },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 24, fontWeight: '800' },
  demo: {
    color: '#2DA54E', backgroundColor: '#fff', fontSize: 11, fontWeight: '800',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, overflow: 'hidden',
  },
  bannerSub: { color: '#E3F6E8', fontSize: 14 },
  amount: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 6 },
  notice: { fontSize: 13, color: '#4A5A55', backgroundColor: '#FFF8E6', padding: 12, borderRadius: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#10201C', marginBottom: 6 },
  input: {
    height: 48, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12,
    paddingHorizontal: 14, fontSize: 18, backgroundColor: '#fff', letterSpacing: 1,
  },
  errorBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FBE9E7',
    padding: 12, borderRadius: 12,
  },
  errorText: { color: '#B3261E', flex: 1, fontWeight: '600' },
  pay: { height: 52, borderRadius: 12, backgroundColor: '#2DA54E', alignItems: 'center', justifyContent: 'center' },
  payText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  success: { alignItems: 'center', gap: 8, paddingTop: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#10201C' },
  muted: { fontSize: 13, color: '#4A5A55', textAlign: 'center' },
  receipt: {
    alignSelf: 'stretch', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12,
    marginTop: 16, borderWidth: 1, borderColor: '#E3EAE7',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowValue: { fontSize: 14, fontWeight: '700', color: '#10201C' },
});