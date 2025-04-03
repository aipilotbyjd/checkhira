import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import gu from '../locales/gu.json';

// Define types for translations
type TranslationKey = keyof typeof en;
type PartialTranslations = Partial<typeof en>;

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
    const [locale, setLocaleState] = useState<string>('en');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSavedLocale = async () => {
            try {
                const savedLocale = await AsyncStorage.getItem('userLocale');
                const deviceLocale = Localization.locale.split('-')[0];
                const initialLocale = savedLocale || (translations[deviceLocale] ? deviceLocale : 'en');

                setLocaleState(initialLocale);
                if (!savedLocale) {
                    await AsyncStorage.setItem('userLocale', initialLocale);
                }
            } catch (error) {
                console.error('Locale loading error:', error);
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

    const t = useMemo(() => {
        return (key: TranslationKey) => {
            const currentTranslations = translations[locale] || translations.en;
            return (currentTranslations[key] as string) || translations.en[key] || key;
        };
    }, [locale]);

    const isRTL = rtlLocales.includes(locale);

    const contextValue = useMemo(() => ({
        locale,
        setLocale,
        t,
        isRTL,
        availableLocales,
        loading,
    }), [locale, t, isRTL, loading]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};
