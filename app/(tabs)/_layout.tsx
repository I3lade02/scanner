import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import { palette } from '@/src/constants/palette';

export default function TabLayout() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = palette[colorScheme];

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: 'transparent',
        },
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          height: 76,
          borderTopWidth: 0,
          backgroundColor: colorScheme === 'dark' ? 'rgba(17,20,15,0.72)' : 'rgba(255,250,244,0.82)',
        },
        tabBarLabelStyle: {
          fontFamily: 'DarkerGrotesque_700Bold',
          fontSize: 15,
          letterSpacing: 0.8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'view-dashboard' : 'view-dashboard-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collection',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'cards' : 'cards-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'magnify' : 'magnify'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'camera' : 'camera-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'cog' : 'cog-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
