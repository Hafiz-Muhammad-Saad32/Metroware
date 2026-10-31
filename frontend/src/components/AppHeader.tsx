import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export const HEADER_H = 60;

// scroll content ko header ke neeche se shuru karne ke liye
export const useHeaderOffset = () => useSafeAreaInsets().top + HEADER_H;

export function ProfileButton() {
  const { user } = useAuth();
  const router = useRouter();
  const path = user?.userRole === 'admin' ? '/admin-profile' : '/profile';

  return (
    <Pressable onPress={() => router.push(path as any)} hitSlop={8} accessibilityLabel="Profile">
      <Avatar name={user?.userName} size={38} />
    </Pressable>
  );
}

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.bar, { paddingTop: insets.top, height: insets.top + HEADER_H }]}>
      <Image
        source={require('../../assets/images/logo-name.png')}
        style={s.logo}
        resizeMode="contain"
        accessibilityLabel="Metroware"
      />
      <ProfileButton />
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(244,246,245,0.88)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as any) : {}),
  },
  logo: { height: 32, width: 32 * 5.84 }, // logo ki asli nisbat 5.84 : 1
});