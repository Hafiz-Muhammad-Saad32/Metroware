import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Option {
  value: number;
  label: string;
}

interface Props {
  label: string;
  value: number | null;
  options: Option[];
  onChange: (v: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Dropdown({ label, value, options, onChange, placeholder = 'Select', disabled }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <Pressable
        style={[s.select, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setOpen((o) => !o)}
      >
        <Text style={[s.selectText, !selected && { color: '#7A8A85', fontWeight: '400' }]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color="#4A5A55" />
      </Pressable>

      {open && (
        <View style={s.menu}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
            {options.length === 0 && <Text style={s.empty}>Nothing to select</Text>}
            {options.map((o) => (
              <Pressable
                key={o.value}
                style={[s.option, o.value === value && s.optionActive]}
                onPress={() => { onChange(o.value); setOpen(false); }}
              >
                <Text style={[s.optionText, o.value === value && { color: '#0B7A5E' }]}>{o.label}</Text>
                {o.value === value && <Ionicons name="checkmark" size={20} color="#0B7A5E" />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#10201C' },
  select: {
    height: 48, borderWidth: 1, borderColor: '#9FB0AA', borderRadius: 12, backgroundColor: '#fff',
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectText: { fontSize: 16, color: '#10201C', fontWeight: '600', flexShrink: 1 },
  menu: { marginTop: 6, borderWidth: 1, borderColor: '#E3EAE7', borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' },
  option: {
    paddingHorizontal: 14, height: 46, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F4F2',
  },
  optionActive: { backgroundColor: '#EEF7F4' },
  optionText: { fontSize: 15, color: '#10201C' },
  empty: { padding: 14, color: '#4A5A55' },
});