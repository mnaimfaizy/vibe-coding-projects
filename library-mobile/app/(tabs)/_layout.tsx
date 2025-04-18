import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
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
  const { colors } = useTheme();

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: tabBackgroundColor,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerStyle: {
          backgroundColor,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerTintColor: useThemeColor({}, 'text'),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <IconButton
              icon="logout"
              iconColor={colors.primary}
              size={24}
              onPress={() => logout()}
              style={{ marginRight: 8 }}
            />
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
