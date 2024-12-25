import { Octicons } from '@expo/vector-icons';
interface TabBarIconProps {
  name: React.ComponentProps<typeof Octicons>['name'];
  color: string;
  size: number;
}

export const TabBarIcon = ({ name, color, size }: TabBarIconProps) => {
  return <Octicons size={size} name={name} color={color} />;
};
