import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

type HeaderButtonProps = {
  onPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
};

export const HeaderButton = ({
  onPress,
  iconName = 'notifications-outline',
}: HeaderButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
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
      )}
    </Pressable>
  );
};

export const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
});
