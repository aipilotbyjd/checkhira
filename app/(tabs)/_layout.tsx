import { Tabs } from 'expo-router';
import { Platform, Image, View, StyleSheet } from 'react-native';
import { COLORS, SPACING, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useRouter } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { useNotification } from '../../contexts/NotificationContext';
import { useDimensions } from '../../hooks/useScreenDimensions';

const TAB_SCREENS = [
  {
    name: 'index',
    label: 'Home',
    icon: 'home',
    headerShown: true,
  },
  {
    name: 'work-list',
    label: 'Work List',
    icon: 'list-unordered',
    headerShown: true,
  },
  {
    name: 'payments',
    label: 'Payments',
    icon: 'credit-card',
    headerShown: true,
  },
  {
    name: 'account',
    label: 'Account',
    icon: 'person',
    headerShown: true,
  },
] as const;

export default function TabLayout() {
  const router = useRouter();
  const { getTabBarHeight, getHeaderHeight } = useDimensions();
  const { unreadCount } = useNotification();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: getTabBarHeight(),
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[100],
          paddingHorizontal: SPACING.md,
          ...SHADOWS.small,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
          height: getHeaderHeight(),
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray[100],
        },
        headerTitle: () => null,
        headerLeft: () => (
          <View style={[styles.headerLeft, { height: getHeaderHeight() }]}>
            <Image
              source={require('../../assets/hirabook-logo.png')}
              style={{
                width: 140,
                height: 45,
                resizeMode: 'contain',
              }}
            />
          </View>
        ),
        headerRight: () => (
          <View style={[styles.headerRight, { height: getHeaderHeight() }]}>
            <HeaderButton
              iconName="notifications-outline"
              onPress={() => router.push('/notifications')}
              badgeCount={unreadCount}
            />
          </View>
        ),
        safeAreaInsets: {
          top: Platform.OS === 'ios' ? 44 : 0,
        },
      }}>
      {TAB_SCREENS.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.label,
            headerShown: screen.headerShown,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={screen.icon} color={color} size={SPACING.md * 1.6} />
            ),
            tabBarLabelStyle: [
              styles.tabLabel,
              {
                fontSize: SPACING.md * 0.9,
              },
            ],
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    paddingLeft: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    paddingRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    minWidth: 100,
    maxWidth: 150,
    minHeight: 25,
    maxHeight: 35,
  },
  tabIcon: {
    marginBottom: Platform.OS === 'ios' ? -5 : 0,
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.tabLabel,
    marginBottom: Platform.OS === 'ios' ? 0 : SPACING.xs,
  },
});
