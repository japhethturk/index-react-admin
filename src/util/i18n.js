import i18n from "i18next"
// import {useTranslation, initReactI18next} from "react-i18next"
import translationTR from './locales/tr/translation.json'
import {initReactI18next} from "react-i18next";
// import HttpApi from "i18next-http-backend";
// import detector from "i18next-browser-languagedetector";

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        lng: "tr",
        fallbackLng: "tr",
        keySeparator: false, // we do not use keys in form messages.welcome
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        resources: {
          tr: {
            translation: translationTR
          }
        },
    });

export default i18n;