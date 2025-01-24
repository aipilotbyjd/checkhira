import { Pressable, View, Text } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';

type WorkItem = {
  diamond: string | number;
  price: string | number;
};

type WorkListItemProps = {
  item: {
    id: string;
    date: string;
    name: string;
    work_items: WorkItem[];
  };
};

export function WorkListItem({ item }: WorkListItemProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/work/${item.id}/edit`)}
      className="mb-4 rounded-xl p-4"
      style={{
        backgroundColor: COLORS.background.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
            {format(new Date(item.date), 'dd MMM yyyy')}
          </Text>
          <Text className="mt-1 text-base" style={{ color: COLORS.secondary }}>
            {item.name}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
            {item.work_items.reduce((sum, wi) => sum + (Number(wi.diamond) || 0), 0)} diamonds
          </Text>
          <Text className="mt-1 text-lg font-semibold" style={{ color: COLORS.success }}>
            ₹ {item.work_items.reduce((sum, wi) => sum + (Number(wi.price) || 0), 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
