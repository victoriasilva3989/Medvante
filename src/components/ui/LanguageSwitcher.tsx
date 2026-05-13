import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../../i18n/useI18n'
import type { Locale } from '../../i18n/translations'
import { Globe } from 'lucide-react'

const flags: Record<Locale, string> = {
  'pt-BR': '\u{1F1E7}\u{1F1F7}',
  en: '\u{1F1FA}\u{1F1F8}',
  es: '\u{1F1EA}\u{1F1F8}',
}

const labels: Record<Locale, string> = {
  'pt-BR': 'Portugu\u00eas',
  en: 'English',
  es: 'Espa\u00f1ol',
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const locales: Locale[] = ['pt-BR', 'en', 'es']

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-alt transition-colors cursor-pointer"
      >
        <Globe size={16} />
        <span>{flags[locale]}</span>
        <span className="text-xs hidden md:inline">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-bg-card border border-border rounded-xl shadow-md py-1 min-w-[160px] z-50">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors cursor-pointer ${
                locale === l ? 'bg-blue-pale text-blue-brand font-medium' : 'text-text-primary hover:bg-bg-card-alt'
              }`}
            >
              <span className="text-base">{flags[l]}</span>
              <span>{labels[l]}</span>
              {locale === l && <span className="ml-auto text-xs text-blue-brand">\u2713</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
