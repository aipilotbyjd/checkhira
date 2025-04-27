import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import * as Updates from 'expo-updates';
import { environment } from '../config/environment';
import { crashlyticsService } from '../utils/crashlytics';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);

        // Log additional context information
        const errorContext = {
            timestamp: new Date().toISOString(),
            platform: Platform.OS,
            platformVersion: Platform.Version,
            appVersion: environment.appVersion,
            componentStack: errorInfo.componentStack,
        };

        console.error('Error context:', errorContext);

        // Record error to Crashlytics
        crashlyticsService.recordError(error, errorContext);

        // Also log to backend in production
        if (environment.production) {
            this.logErrorToServer(error, errorContext);
        }
    }

    // Method to send errors to your backend
    private logErrorToServer(error: Error, context: any) {
        // This is a simple implementation that could be expanded
        try {
            fetch(`${environment.apiUrl}/log-error`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                    context,
                }),
            }).catch(e => console.error('Failed to send error to server:', e));
        } catch (e) {
            console.error('Failed to log error to server:', e);
        }
    }

    handleRestart = async () => {
        try {
            await Updates.reloadAsync();
        } catch (error) {
            console.error('Failed to restart app:', error);
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>!</Text>
                    </View>
                    <Text style={styles.title}>Oops, Something Went Wrong</Text>
                    <Text style={styles.message}>
                        The app ran into a problem. We've logged this issue and will work to fix it.
                    </Text>
                    {!environment.production && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                {this.state.error?.toString() || 'Unknown error occurred'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Restart App"
                            onPress={this.handleRestart}
                            color={COLORS.primary}
                        />
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: COLORS.background.primary,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.error + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 50,
        fontWeight: 'bold',
        color: COLORS.error,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: COLORS.secondary,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        color: COLORS.gray[600],
        lineHeight: 22,
    },
    errorBox: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: COLORS.error + '15',
        marginBottom: 24,
        width: '100%',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 8,
    },
});