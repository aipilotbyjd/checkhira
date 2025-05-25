import { Tabs } from 'expo-router';
import { Platform, Image, View, StyleSheet, Pressable, Modal, Text } from 'react-native';
import { COLORS, SPACING, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useRouter } from 'expo-router';
import { HeaderButton } from '../../components/HeaderButton';
import { useNotification } from '../../contexts/NotificationContext';
import { useDimensions } from '../../hooks/useScreenDimensions';
import { AuthGuard } from '../../components/AuthGuard';
import { useLanguage } from '../../contexts/LanguageContext';
import { SyncStatusIndicator } from '../../components/SyncStatusIndicator';
import { useNetwork } from '../../contexts/NetworkContext';
import { useState } from 'react';
import { useTheme } from "../../contexts/ThemeContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TAB_SCREENS = [
  {
    name: 'index',
    label: 'home',
    icon: 'home',
    headerShown: true,
  },
  {
    name: 'work-list',
    label: 'worklist',
    icon: 'list-unordered',
    headerShown: true,
  },
  {
    name: 'payments',
    label: 'payments',
    icon: 'credit-card',
    headerShown: true,
  },
  {
    name: 'account',
    label: 'account',
    icon: 'person',
    headerShown: true,
  },
] as const;

export default function TabLayout() {
  const router = useRouter();
  const { getTabBarHeight, getHeaderHeight } = useDimensions();
  const { unreadCount } = useNotification();
  const { t } = useLanguage();
  const { hasPendingChanges } = useNetwork();
  const [showSyncModal, setShowSyncModal] = useState(false);

  return (
    <AuthGuard>
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
              <View style={styles.headerButtonsContainer}>
                <SyncStatusIndicator
                  onPress={() => setShowSyncModal(true)}
                />
                <HeaderButton
                  iconName="notifications-outline"
                  onPress={() => router.push('/notifications')}
                  badgeCount={unreadCount}
                />
                <Pressable
                  onPress={() => router.push('/search')}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    marginRight: 15,
                  })}
                >
                  <MaterialCommunityIcons
                    name="magnify"
                    size={24}
                    color={COLORS.secondary}
                  />
                </Pressable>
              </View>
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
              title: t(screen.label as any),
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

      {/* Sync Status Modal */}
      <Modal
        visible={showSyncModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSyncModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSyncModal(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('syncStatus')}</Text>
              <Pressable onPress={() => setShowSyncModal(false)}>
                <TabBarIcon name="x" color={COLORS.gray[500]} size={24} />
              </Pressable>
            </View>

            <SyncStatusIndicator showDetails={true} />

            <Text style={styles.syncInfoText}>
              {hasPendingChanges
                ? t('pendingChangesSyncInfo')
                : t('allSyncedInfo')
              }
            </Text>
          </View>
        </Pressable>
      </Modal>
    </AuthGuard>
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
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  syncInfoText: {
    marginTop: SPACING.lg,
    fontSize: SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
});
