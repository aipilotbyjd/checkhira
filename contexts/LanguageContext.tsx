import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json'
import hi from '../locales/hi.json';
import gu from '../locales/gu.json';

type Translations = typeof en;

interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => Promise<void>;
    t: (key: keyof typeof en) => string;
    isRTL: boolean;
    availableLocales: { code: string; name: string }[];
}

const translations: Record<string, Translations> = {
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
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const [locale, setLocaleState] = useState('en');

    useEffect(() => {
        const loadSavedLocale = async () => {
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

    const t = (key: keyof typeof en) => {
        const currentTranslations = translations[locale] || translations.en;
        return currentTranslations[key] || key;
    };

    const isRTL = rtlLocales.includes(locale);

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, isRTL, availableLocales }}>
            {children}
        </LanguageContext.Provider>
    );
}; 