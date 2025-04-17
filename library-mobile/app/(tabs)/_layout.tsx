import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { useAuth } from '../../hooks/useAuth';
import { useThemeColor } from '../../hooks/useThemeColor';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const tabBackgroundColor = useThemeColor({}, 'tabBackground');
  const tint = useThemeColor({}, 'tint');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  
  // Show loading screen while checking authentication status
  if (isLoading) {
    return <LoadingOverlay message="Loading..." />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: { backgroundColor: tabBackgroundColor },
        headerStyle: { backgroundColor },
        headerTintColor: useThemeColor({}, 'text'),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => logout()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                marginRight: 15,
              })}>
              <FontAwesome
                name="sign-out"
                size={25}
                color={tint}
              />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: 'Books',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
