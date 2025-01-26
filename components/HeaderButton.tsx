import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/theme';

type HeaderButtonProps = {
  onPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  badgeCount?: number | null;
};

export const HeaderButton = ({
  onPress,
  iconName = 'notifications-outline',
  badgeCount = 0,
}: HeaderButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View>
          <Ionicons
            name={iconName}
            size={25}
            color="gray"
            style={[
              styles.headerRight,
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount === null ? '0' : badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    right: 8,
    top: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
