import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { adService } from '../services/adService';
import { useTrackingPermission } from '../hooks/useTrackingPermission';

export const TrackingPermissionExample = () => {
  const { trackingStatus, isLoading, requestPermission, isAuthorized } = useTrackingPermission();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // This will show the current tracking status
    setMessage(`Current tracking status: ${trackingStatus}`);
  }, [trackingStatus]);

  const handleRequestPermission = async () => {
    // Request permission and update the message
    const status = await requestPermission();
    setMessage(`Tracking permission status: ${status}`);
  };

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          App Tracking Transparency is only required on iOS devices.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking tracking permission status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      
      {trackingStatus !== 'authorized' && (
        <Button
          title="Request Tracking Permission"
          onPress={handleRequestPermission}
          disabled={trackingStatus === 'denied' || trackingStatus === 'restricted'}
        />
      )}
      
      {(trackingStatus === 'denied' || trackingStatus === 'restricted') && (
        <Text style={styles.infoText}>
          You've denied tracking permission. You can change this in your device settings.
        </Text>
      )}
      
      <Text style={styles.infoText}>
        {isAuthorized
          ? 'You will see personalized ads based on your interests.'
          : 'You will see non-personalized ads.'}
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
  infoText: {
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
