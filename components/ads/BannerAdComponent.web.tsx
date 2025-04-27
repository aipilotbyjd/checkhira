import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

type BannerAdComponentProps = {
  size?: string;
  containerStyle?: object;
};

// This is a web-specific implementation that renders a placeholder
export const BannerAdComponent = ({
  containerStyle = {},
}: BannerAdComponentProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.text}>
        Ads not available on web platform
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
});
