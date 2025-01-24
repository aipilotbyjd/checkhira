import { Pressable, View, Text } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';
import { Work } from '../types/work';

type WorkListItemProps = {
  item: Work;
};

export function WorkListItem({ item }: WorkListItemProps) {
  const router = useRouter();

  const calculateTotal = (workItems: Work['work_items']) => {
    return workItems.reduce((sum, wi) => {
      const diamond = Number(wi.diamond) || 0;
      const price = Number(wi.price) || 0;
      return sum + (diamond * price);
    }, 0);
  };

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
            ₹ {calculateTotal(item.work_items).toFixed(2)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
