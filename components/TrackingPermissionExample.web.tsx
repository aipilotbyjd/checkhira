import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TrackingPermissionExample = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        App Tracking Transparency is not applicable on web platforms.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
});
