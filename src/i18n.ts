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
      requestOptions: {
        cache: "no-cache", // validate the freshness of the cache
      },
    },
    react: {
      useSuspense: true,
    },
    fallbackLng: "en",
    load: "languageOnly", // load zh.json for zh-CN
    preload: ["en"],
    keySeparator: false,
    interpolation: { escapeValue: false },
  })

export default i18next
