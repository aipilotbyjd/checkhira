import React from 'react';
import { View } from 'react-native';
import { COLORS } from '../constants/theme';

export function ProfileSkeleton() {
    return (
        <View style={{ padding: 16 }}>
            {/* Form Fields Skeleton */}
            <View style={{ marginBottom: 16 }}>
                <View style={{ height: 20, width: '60%', backgroundColor: COLORS.gray[200], marginBottom: 8 }} />
                <View style={{ height: 40, backgroundColor: COLORS.gray[200], borderRadius: 8 }} />
            </View>
            <View style={{ marginBottom: 16 }}>
                <View style={{ height: 20, width: '60%', backgroundColor: COLORS.gray[200], marginBottom: 8 }} />
                <View style={{ height: 40, backgroundColor: COLORS.gray[200], borderRadius: 8 }} />
            </View>
            <View style={{ marginBottom: 16 }}>
                <View style={{ height: 20, width: '60%', backgroundColor: COLORS.gray[200], marginBottom: 8 }} />
                <View style={{ height: 40, backgroundColor: COLORS.gray[200], borderRadius: 8 }} />
            </View>
            <View style={{ marginBottom: 16 }}>
                <View style={{ height: 20, width: '60%', backgroundColor: COLORS.gray[200], marginBottom: 8 }} />
                <View style={{ height: 40, backgroundColor: COLORS.gray[200], borderRadius: 8 }} />
            </View>
            <View style={{ marginBottom: 16 }}>
                <View style={{ height: 20, width: '60%', backgroundColor: COLORS.gray[200], marginBottom: 8 }} />
                <View style={{ height: 40, backgroundColor: COLORS.gray[200], borderRadius: 8 }} />
            </View>
        </View>
    );
}