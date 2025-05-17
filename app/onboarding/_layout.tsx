import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OnboardingLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <Stack.Screen name="index" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
