import { Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ProfileButton } from '../../components/AppHeader';

// web pe default header kinaro se chipak jata hai, isliye wahan margin
const EDGE = Platform.OS === 'web' ? 16 : 0;

export default function UserLayout() {
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <Stack
      screenOptions={{
        headerTintColor: '#0B7A5E',
        headerStyle: { backgroundColor: '#F4F6F5' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F4F6F5' },
        headerLeft: () => (
          <Pressable onPress={goBack} hitSlop={12} style={{ marginLeft: EDGE, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#0B7A5E" />
          </Pressable>
        ),
        headerRight: () => (
          <View style={{ marginRight: EDGE }}>
            <ProfileButton />
          </View>
        ),
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="routes" options={{ title: 'Bus routes' }} />
      <Stack.Screen name="nearest" options={{ title: 'Nearest stop' }} />
      <Stack.Screen name="complaints" options={{ title: 'Complaints' }} />
      <Stack.Screen name="lostfound" options={{ title: 'Lost & Found' }} />
      <Stack.Screen name="profile" options={{ title: 'My profile', headerRight: () => null }} />
    </Stack>
  );
}