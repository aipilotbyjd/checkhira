import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, DARK_COLORS } from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: typeof COLORS | typeof DARK_COLORS;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: COLORS,
    themeMode: 'system',
    setThemeMode: async () => { },
    isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const systemColorScheme = useColorScheme();

    // Determine if we should use dark theme
    const isDark =
        themeMode === 'dark' ||
        (themeMode === 'system' && systemColorScheme === 'dark');

    // Choose the appropriate theme object
    const theme = isDark ? DARK_COLORS : COLORS;

    useEffect(() => {
        const loadSavedTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('themeMode') as ThemeMode | null;
                if (savedTheme) {
                    setThemeModeState(savedTheme);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        };

        loadSavedTheme();
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem('themeMode', mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}; 