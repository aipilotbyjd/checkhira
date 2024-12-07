import { Octicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

interface TabBarIconProps {
  name: React.ComponentProps<typeof Octicons>['name'];
  color: string;
}

export const TabBarIcon = ({ name, color }: TabBarIconProps) => {
  return <Octicons size={24} name={name} color={color} />;
};
