import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'fr',  label: 'FR', ariaLabel: 'Passer en français' },
  { code: 'en',  label: 'EN', ariaLabel: 'Switch to English' },
  { code: 'mfe', label: 'KR', ariaLabel: 'Vire ar Kreol' },
]

export default function LanguageBar() {
  const { i18n } = useTranslation()
  const active = i18n.language

  function switchLang(lang) {
    i18n.changeLanguage(lang)
    localStorage.setItem('trk-lang', lang)
    document.documentElement.lang = lang
  }

  return (
    <div
      role="navigation"
      aria-label="Language switcher"
      className="sticky top-0 z-50 h-9 bg-forest-900 border-b border-forest-800"
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-end gap-0">
        {LANGS.map((lng, idx) => (
          <div key={lng.code} className="flex items-center">
            {idx > 0 && (
              <span className="h-3.5 w-px bg-cream-50/20 mx-2" aria-hidden />
            )}
            <button
              type="button"
              lang={lng.code}
              aria-label={lng.ariaLabel}
              aria-current={active === lng.code ? 'true' : undefined}
              onClick={() => switchLang(lng.code)}
              className={`
                relative h-9 px-1 text-xs font-medium transition-colors duration-150
                ${active === lng.code
                  ? 'font-semibold text-mango after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-mango'
                  : 'text-cream-100/60 hover:text-cream-50 cursor-pointer'
                }
              `}
            >
              {lng.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
