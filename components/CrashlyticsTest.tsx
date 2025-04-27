import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { crashlyticsService } from '../utils/crashlytics';
import { COLORS } from '../constants/theme';

export const CrashlyticsTest = () => {
    const [isVisible, setIsVisible] = useState(false);

    const handleTestError = () => {
        try {
            // Create a custom error
            const error = new Error('Test error for Crashlytics');

            // Record the error to Crashlytics
            crashlyticsService.recordError(error, {
                test: true,
                timestamp: new Date().toISOString(),
                source: 'CrashlyticsTest component'
            });

            Alert.alert(
                'Test Error Logged',
                'A test error was successfully logged to Crashlytics.',
                [{ text: 'OK' }]
            );
        } catch (e) {
            console.error('Failed to log test error:', e);
            Alert.alert('Error', 'Failed to log test error to Crashlytics.');
        }
    };

    const handleTestCrash = () => {
        Alert.alert(
            'Test Crash',
            'This will crash the app. Are you sure you want to continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Crash App',
                    style: 'destructive',
                    onPress: () => {
                        // Force a crash
                        crashlyticsService.testCrash();
                    }
                }
            ]
        );
    };

    if (!isVisible) {
        return (
            <View style={styles.container}>
                <Button
                    title="Test Crashlytics"
                    onPress={() => setIsVisible(true)}
                    color={COLORS.primary}
                />
            </View>
        );
    }

    return (
        <View style={styles.expandedContainer}>
            <Text style={styles.title}>Crashlytics Test Panel</Text>
            <Text style={styles.description}>
                Use these buttons to test Crashlytics functionality.
            </Text>

            <View style={styles.buttonContainer}>
                <Button
                    title="Log Test Error"
                    onPress={handleTestError}
                    color={COLORS.warning}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Force Test Crash"
                    onPress={handleTestCrash}
                    color={COLORS.error}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Close"
                    onPress={() => setIsVisible(false)}
                    color={COLORS.gray[500]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    expandedContainer: {
        padding: 15,
        backgroundColor: COLORS.background.secondary,
        borderRadius: 10,
        marginVertical: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: COLORS.secondary,
    },
    description: {
        fontSize: 14,
        marginBottom: 15,
        color: COLORS.gray[600],
    },
    buttonContainer: {
        marginVertical: 5,
    },
});
