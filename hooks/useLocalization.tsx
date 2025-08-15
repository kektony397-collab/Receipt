
import React, { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { localization } from '../services/localization';
import type { Language } from '../types';

type LocalizationContextType = {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: keyof typeof localization.en) => string;
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = useCallback((key: keyof typeof localization.en): string => {
        return localization[language][key] || localization.en[key];
    }, [language]);

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = (): LocalizationContextType => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
