import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json'
import hi from '../locales/hi.json';
import gu from '../locales/gu.json';

// Define the type for translations
type TranslationKey = keyof typeof en;
type PartialTranslations = Partial<typeof en>;
type CompleteTranslations = typeof en;

interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => Promise<void>;
    t: (key: TranslationKey) => string;
    isRTL: boolean;
    availableLocales: { code: string; name: string }[];
    loading: boolean;
}

const translations: Record<string, PartialTranslations> = {
    en,
    hi,
    gu,
};

const availableLocales = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'gu', name: 'ગુજરાતી' },
];

const rtlLocales: string[] = []; // Add RTL language codes like 'ar', 'he', etc if needed

const LanguageContext = createContext<LanguageContextType>({
    locale: 'en',
    setLocale: async () => { },
    t: (key) => '',
    isRTL: false,
    availableLocales,
    loading: true,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const [locale, setLocaleState] = useState('en');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSavedLocale = async () => {
            setLoading(true);
            try {
                const savedLocale = await AsyncStorage.getItem('userLocale');
                if (savedLocale) {
                    setLocaleState(savedLocale);
                } else {
                    // Use device locale if available and supported, otherwise default to English
                    const deviceLocale = Localization.locale.split('-')[0];
                    if (translations[deviceLocale]) {
                        setLocaleState(deviceLocale);
                    }
                }
            } catch (error) {
                console.error('Failed to load locale:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSavedLocale();
    }, []);

    const setLocale = async (newLocale: string) => {
        try {
            await AsyncStorage.setItem('userLocale', newLocale);
            setLocaleState(newLocale);
        } catch (error) {
            console.error('Failed to save locale:', error);
        }
    };

    // Memoize translation function for better performance
    const t = useMemo(() => {
        return (key: TranslationKey) => {
            const currentTranslations = translations[locale] || translations.en;
            return (currentTranslations[key] as string) || translations.en[key] || key;
        };
    }, [locale]);

    const isRTL = rtlLocales.includes(locale);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({ 
        locale, 
        setLocale, 
        t, 
        isRTL, 
        availableLocales,
        loading
    }), [locale, t, isRTL, loading]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}; 