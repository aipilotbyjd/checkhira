import { Tabs } from 'expo-router';
import { Platform, Image, View, StyleSheet } from 'react-native';
import { COLORS, SPACING, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useRouter } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { useNotification } from '../../contexts/NotificationContext';

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
  const { width, height, isSmallDevice, isShortDevice } = useScreenDimensions();
  const { unreadCount } = useNotification();

  const getTabBarHeight = () => {
    if (Platform.OS === 'ios') {
      return isShortDevice ? 70 : 85;
    }
    return isSmallDevice ? 56 : 64;
  };

  const getHeaderHeight = () => {
    if (Platform.OS === 'ios') {
      return isShortDevice ? 70 : 88;
    }
    return isSmallDevice ? 56 : 64;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: getTabBarHeight(),
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[100],
          paddingHorizontal: width * 0.02,
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
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/hirabook-logo.png')}
              style={[
                styles.headerLogo,
                {
                  width: width * 0.25,
                  height: height * 0.04,
                },
              ]}
              resizeMode="contain"
            />
          </View>
        ),
        headerRight: () => (
          <HeaderButton
            iconName="notifications-outline"
            onPress={() => router.push('/notifications')}
            badgeCount={unreadCount}
          />
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
              <TabBarIcon name={screen.icon} color={color} size={width * 0.06} />
            ),
            tabBarLabelStyle: [
              styles.tabLabel,
              {
                fontSize: width * 0.03,
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
    marginBottom: Platform.OS === 'ios' ? 0 : SPACING.xs,
  },
});
