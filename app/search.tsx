import React from 'react';
import { View } from 'react-native';
import GlobalSearch from '../components/GlobalSearch';
import { COLORS } from '../constants/theme';

export default function SearchScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <GlobalSearch />
    </View>
  );
} 