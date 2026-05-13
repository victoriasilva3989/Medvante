import { create } from 'zustand'
import { translations, type Locale, type TranslationKey } from './translations'

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

export const useI18n = create<I18nState>((set, get) => ({
  locale: 'pt-BR',

  setLocale: (locale: Locale) => {
    set({ locale })
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  },

  t: (key: TranslationKey, params?: Record<string, string | number>) => {
    const { locale } = get()
    const value = translations[locale]?.[key] ?? translations['pt-BR']?.[key] ?? key

    if (!params) return value

    return value.replace(/\{(\w+)\}/g, (_, name: string) => {
      const val = params[name]
      return val !== undefined ? String(val) : `{${name}}`
    })
  },
}))
