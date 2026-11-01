import { Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ProfileButton } from '../../components/AppHeader';

const EDGE = Platform.OS === 'web' ? 16 : 0;

export default function AdminLayout() {
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/dashboard'));

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
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="all-complaints" options={{ title: 'Complaints' }} />
      <Stack.Screen name="all-lostfound" options={{ title: 'Lost & Found' }} />
      <Stack.Screen name="manage-routes" options={{ title: 'Manage routes' }} />
      <Stack.Screen name="route-form" options={{ title: 'Route' }} />
      <Stack.Screen name="all-tickets" options={{ title: 'Tickets' }} />
      <Stack.Screen name="users" options={{ title: 'All users' }} />
      <Stack.Screen name="admin-profile" options={{ title: 'My profile', headerRight: () => null }} />
    </Stack>
  );
}