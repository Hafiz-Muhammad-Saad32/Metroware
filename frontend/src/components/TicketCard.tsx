import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '../types';
import { formatDate } from '../utils/formate';

export const ticketCode = (id: number) => `MW-${String(id).padStart(6, '0')}`;

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

export default function TicketCard({ ticket: t }: { ticket: Ticket }) {
  const paid = t.paymentStatus === 'paid';

  return (
    <View style={s.wrap}>
      <View style={s.top}>
        <View style={s.busIcon}>
          <Ionicons name="bus" size={22} color="#0B7A5E" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.brand}>METROWARE</Text>
          <Text style={s.bus}>{t.busNumber ?? 'Bus'} · {t.routeName ?? 'Route'}</Text>
        </View>
        <Text style={[s.pill, paid ? s.paid : s.pending]}>{paid ? 'PAID' : 'PENDING'}</Text>
      </View>

      <View style={s.body}>
        <View style={s.timeline}>
          <View style={[s.dot, { backgroundColor: '#0B7A5E' }]} />
          <View style={s.vline} />
          <View style={[s.dot, { backgroundColor: '#B3261E' }]} />
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <Text style={s.infoLabel}>PICKUP</Text>
            <Text style={s.stop}>{t.pickupName ?? '—'}</Text>
          </View>
          <View style={{ marginTop: 14 }}>
            <Text style={s.infoLabel}>DROP</Text>
            <Text style={s.stop}>{t.dropName ?? '—'}</Text>
          </View>
        </View>
        <View style={s.priceBox}>
          <Text style={s.infoLabel}>PRICE</Text>
          <Text style={s.price}>Rs {t.price}</Text>
        </View>
      </View>

      <View style={s.divider}>
        <View style={[s.notch, { left: -12 }]} />
        <View style={s.dash} />
        <View style={[s.notch, { right: -12 }]} />
      </View>

      <View style={s.bottom}>
        <View style={{ flex: 1 }}>
          <Info label="TICKET ID" value={ticketCode(t.ticketId)} />
          <Info label="USER ID" value={`${t.userId}${t.userName ? ' · ' + t.userName : ''}`} />
          <Info label="BOOKED" value={formatDate(t.bookedAt)} />
          <Info
            label="PAYMENT"
            value={t.paymentMethod === 'easypaisa' ? `Easypaisa${t.transactionId ? ' · ' + t.transactionId : ''}` : 'Cash'}
          />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#E3EAE7',
  },
  top: {
    backgroundColor: '#0B7A5E', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  busIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { color: '#BFE8DA', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  bus: { color: '#fff', fontSize: 17, fontWeight: '700' },
  pill: { fontSize: 11, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, overflow: 'hidden' },
  paid: { backgroundColor: '#DDF1EA', color: '#0B7A5E' },
  pending: { backgroundColor: '#FFF1D6', color: '#9A6200' },
  body: { flexDirection: 'row', padding: 16, gap: 12 },
  timeline: { alignItems: 'center', paddingVertical: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  vline: { width: 2, flex: 1, backgroundColor: '#C7D1CD', marginVertical: 4 },
  stop: { fontSize: 17, fontWeight: '700', color: '#10201C' },
  priceBox: { alignItems: 'flex-end', justifyContent: 'center' },
  price: { fontSize: 22, fontWeight: '800', color: '#0B7A5E' },
  divider: { height: 24, justifyContent: 'center' },
  dash: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#C7D1CD', marginHorizontal: 18 },
  notch: {
    position: 'absolute', top: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#F4F6F5',
  },
  bottom: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#7A8A85', letterSpacing: 0.8 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#10201C' },
});