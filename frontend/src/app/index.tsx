import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0B7A5E" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  return <Redirect href={user.userRole === 'admin' ? '/dashboard' : '/home'} />;
}