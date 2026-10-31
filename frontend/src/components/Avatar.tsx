import { StyleSheet, Text, View } from 'react-native';

export default function Avatar({ name, size = 40 }: { name?: string; size?: number }) {
  const letter = (name?.trim()[0] ?? '?').toUpperCase();
  return (
    <View style={[s.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[s.letter, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: { backgroundColor: '#0B7A5E', alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#fff', fontWeight: '700' },
});