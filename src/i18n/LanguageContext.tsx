import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, translations } from './translations';
import {
  UICustomizationSettings,
  DEFAULT_UI_SETTINGS,
  buildLiquidGlassCssVars,
} from '../utils/calculations';

export { SUPPORTED_LANGUAGES };
export type { Language };
export type ThemeMode = 'dark' | 'light';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  focusSeconds: number;
  isFocusRunning: boolean;
  toggleFocusTimer: () => void;
  resetFocusTimer: () => void;
  uiSettings: UICustomizationSettings;
  updateUISettings: (partial: Partial<UICustomizationSettings>) => void;
  resetUISettings: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function loadInitialUISettings(): UICustomizationSettings {
  try {
    const raw = localStorage.getItem('firework_ui_settings_v1');
    if (!raw) return DEFAULT_UI_SETTINGS;
    return { ...DEFAULT_UI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_UI_SETTINGS;
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('freelancelens_lang') as Language | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    return 'ar';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('firework_theme_v3');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [uiSettings, setUISettings] = useState<UICustomizationSettings>(() =>
    loadInitialUISettings()
  );

  const [focusSeconds, setFocusSeconds] = useState<number>(0);
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('freelancelens_lang', lang);
  };

  const toggleLanguage = () => {
    const idx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === language);
    const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length];
    setLanguage(next ? next.code : 'ar');
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('firework_theme_v3', mode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const updateUISettings = (partial: Partial<UICustomizationSettings>) => {
    setUISettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('firework_ui_settings_v1', JSON.stringify(next));
      return next;
    });
  };

  const resetUISettings = () => {
    setUISettings(DEFAULT_UI_SETTINGS);
    localStorage.setItem('firework_ui_settings_v1', JSON.stringify(DEFAULT_UI_SETTINGS));
  };

  const toggleFocusTimer = () => {
    setIsFocusRunning((prev) => !prev);
  };

  const resetFocusTimer = () => {
    setIsFocusRunning(false);
    setFocusSeconds(0);
  };

  useEffect(() => {
    if (!isFocusRunning) return;
    const interval = setInterval(() => {
      setFocusSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocusRunning]);

  useEffect(() => {
    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    const dir = langMeta?.dir || (language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const cssVars = buildLiquidGlassCssVars(uiSettings, theme);
    Object.entries(cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    root.setAttribute('data-density', uiSettings.uiDensity);
    root.setAttribute('data-radius', uiSettings.cornerRadius);
    root.setAttribute('data-accent', uiSettings.accentPreset);
  }, [uiSettings, theme]);

  const t = (key: string): string => {
    return (
      translations[language]?.[key] ||
      translations.en?.[key] ||
      translations.ar[key] ||
      key
    );
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL: currentLangMeta ? currentLangMeta.dir === 'rtl' : language === 'ar',
        theme,
        setTheme,
        toggleTheme,
        focusSeconds,
        isFocusRunning,
        toggleFocusTimer,
        resetFocusTimer,
        uiSettings,
        updateUISettings,
        resetUISettings,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
