import Fetch from "i18next-fetch-backend"
import LanguageDetector from "i18next-browser-languagedetector"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"

void i18next
  .use(Fetch)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `./locales/{{lng}}.json`,
    },
    react: {
      useSuspense: true,
    },
    fallbackLng: "en",
    preload: ["en"],
    keySeparator: false,
    interpolation: { escapeValue: false },
  })

export default i18next
