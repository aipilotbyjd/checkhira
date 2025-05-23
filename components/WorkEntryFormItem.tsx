import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme'; // Corrected path
import { WorkEntry } from '../types/work'; // Corrected path

interface WorkEntryFormItemProps {
    entry: WorkEntry;
    index: number;
    onUpdateEntry: (id: number, field: keyof WorkEntry, value: string) => void;
    onRemoveEntry: (id: number) => void;
    isFirstEntry: boolean;
    t: any; // Changed to any for now to resolve type conflict, refine later
}

const WorkEntryFormItem: React.FC<WorkEntryFormItemProps> = ({
    entry,
    index,
    onUpdateEntry,
    onRemoveEntry,
    isFirstEntry,
    t,
}) => {
    return (
        <View
            key={entry.id} // Key should be on the mapped element in parent, but good for completeness
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            {/* Entry Header */}
            <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                        {t('workItemDetails')} {index + 1}
                    </Text>
                    <View
                        className="ml-2 rounded-full px-3 py-1"
                        style={{ backgroundColor: COLORS.primary + '15' }}>
                        <Text style={{ color: COLORS.primary }}>{entry.type}</Text>
                    </View>
                </View>
                {!isFirstEntry && ( // Show remove button only if not the first entry
                    <Pressable
                        onPress={() => onRemoveEntry(entry.id)}
                        className="rounded-lg p-2"
                        style={{ backgroundColor: COLORS.error + '15' }}>
                        <Octicons name="trash" size={16} color={COLORS.error} />
                    </Pressable>
                )}
            </View>

            {/* Entry Fields */}
            <View className="flex-row space-x-3">
                <View className="mr-2 flex-1">
                    <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                        {t('diamondWeight')}
                    </Text>
                    <TextInput
                        className="rounded-xl border p-3"
                        style={{
                            backgroundColor: COLORS.white,
                            borderColor: COLORS.gray[200],
                            color: COLORS.secondary,
                        }}
                        value={entry.diamond}
                        placeholder={t('enterWeight')}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                            const numericText = text.replace(/[^0-9]/g, '');
                            onUpdateEntry(entry.id, 'diamond', numericText);
                        }}
                    />
                </View>
                <View className="mr-2 flex-1">
                    <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                        {t('price')}
                    </Text>
                    <TextInput
                        className="rounded-xl border p-3"
                        style={{
                            backgroundColor: COLORS.white,
                            borderColor: COLORS.gray[200],
                            color: COLORS.secondary,
                        }}
                        value={entry.price}
                        placeholder={t('enterPrice')}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                            // Allow decimal for price
                            const numericText = text.replace(/[^0-9.]/g, '');
                            onUpdateEntry(entry.id, 'price', numericText);
                        }}
                    />
                </View>
                <View className="flex-1">
                    <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                        {t('total')}
                    </Text>
                    <View
                        className="rounded-xl border bg-gray-200 p-3"
                        style={{ borderColor: COLORS.gray[200] }}>
                        <Text style={{ color: COLORS.secondary }}>
                            ₹ {((Number(entry.diamond) || 0) * (Number(entry.price) || 0)).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default React.memo(WorkEntryFormItem); 