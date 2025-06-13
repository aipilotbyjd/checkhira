import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';

// Define types for translations
type TranslationKey = keyof typeof en;
type ImportedTranslationsType = any;

export interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => Promise<void>;
    t: (key: TranslationKey, variables?: Record<string, any>) => string;
    isRTL: boolean;
    availableLocales: { code: string; name: string }[];
    loading: boolean;
}

const translationsImporter: Record<string, () => Promise<{ default: ImportedTranslationsType }>> = {
    en: () => import('../locales/en.json'),
    hi: () => import('../locales/hi.json'),
    gu: () => import('../locales/gu.json'),
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
    const [currentTranslations, setCurrentTranslations] = useState<Partial<typeof en>>(en);

    useEffect(() => {
        const loadInitialLocaleAndTranslations = async () => {
            setLoading(true);
            try {
                const savedLocale = await AsyncStorage.getItem('userLocale');
                const deviceLocale = Localization.locale.split('-')[0];
                let initialLocale = savedLocale || (translationsImporter[deviceLocale] ? deviceLocale : 'en');

                if (!translationsImporter[initialLocale]) {
                    console.warn(`Unsupported locale "${initialLocale}" detected, defaulting to 'en'.`);
                    initialLocale = 'en';
                }

                const langModule = await translationsImporter[initialLocale]();
                setCurrentTranslations(langModule.default as Partial<typeof en>);
                setLocaleState(initialLocale);

                if (!savedLocale) {
                    await AsyncStorage.setItem('userLocale', initialLocale);
                }
            } catch (error) {
                console.error('Initial locale/translation loading error:', error);
                setCurrentTranslations(en);
                setLocaleState('en');
            } finally {
                setLoading(false);
            }
        };

        loadInitialLocaleAndTranslations();
    }, []);

    const setLocale = async (newLocale: string) => {
        if (newLocale === locale || !translationsImporter[newLocale]) return;

        setLoading(true);
        try {
            const langModule = await translationsImporter[newLocale]();
            await AsyncStorage.setItem('userLocale', newLocale);
            setCurrentTranslations(langModule.default as Partial<typeof en>);
            setLocaleState(newLocale);
        } catch (error) {
            console.error(`Failed to load translations for ${newLocale} or save locale:`, error);
        } finally {
            setLoading(false);
        }
    };

    const t = useMemo(() => {
        return (key: TranslationKey, variables?: Record<string, any>) => {
            let translation = (currentTranslations[key] as string) || (en[key] as string) || key;

            if (variables) {
                Object.entries(variables).forEach(([key, value]) => {
                    translation = translation.replace(`{{${key}}}`, String(value));
                });
            }
            return translation;
        };
    }, [locale, currentTranslations]);

    const isRTL = rtlLocales.includes(locale);

    const contextValue = useMemo(() => ({
        locale,
        setLocale,
        t,
        isRTL,
        availableLocales,
        loading,
    }), [locale, t, isRTL, loading, currentTranslations]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};
