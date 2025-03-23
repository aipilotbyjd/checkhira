import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import * as Updates from 'expo-updates';

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
        // Here you would log to your error reporting service
        // Example: Sentry.captureException(error);
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
                    <Text style={styles.title}>Oops, Something Went Wrong</Text>
                    <Text style={styles.message}>
                        The app ran into a problem. Please try restarting the app.
                    </Text>
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>
                            {this.state.error?.toString() || 'Unknown error occurred'}
                        </Text>
                    </View>
                    <Button title="Restart App" onPress={this.handleRestart} color={COLORS.primary} />
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
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: COLORS.secondary,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: COLORS.gray[600],
    },
    errorBox: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: COLORS.error + '15',
        marginBottom: 20,
        width: '100%',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
    },
}); 