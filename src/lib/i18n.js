import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import frCommon from '../locales/fr/common.json'
import enCommon from '../locales/en/common.json'
import mfeCommon from '../locales/mfe/common.json'

const SUPPORTED_LANGS = ['fr', 'en', 'mfe']

// Langue initiale : choix explicite de l'utilisateur (localStorage 'trk-lang',
// même clé que LanguageBar et le site vitrine), sinon anglais. Pas de détection
// navigator.language : un navigateur configuré en français ne doit pas
// contourner le défaut anglais du site.
function getInitialLang() {
  try {
    const stored = localStorage.getItem('trk-lang')
    if (SUPPORTED_LANGS.includes(stored)) return stored
  } catch {
    // localStorage indisponible (navigation privée stricte, iframe…) → défaut
  }
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr:  { common: frCommon },
      en:  { common: enCommon },
      mfe: { common: mfeCommon },
    },
    defaultNS: 'common',
    lng: getInitialLang(),
    fallbackLng: { mfe: ['fr', 'en'], default: ['en'] },
    interpolation: {
      escapeValue: false,
    },
  })

document.documentElement.lang = i18n.language
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n
