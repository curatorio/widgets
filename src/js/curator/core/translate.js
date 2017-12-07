import libTranslate from "../../libraries/translate";
import translations from "./translations";

let _cache = {};
let currentLang = 'en';

const mod = {
    setLang (lang) {
        currentLang = lang;
    },

    t (key, n) {
        let lang = currentLang;

        if (!_cache[lang]) {
            if (translations[lang]) {
                _cache[lang] = libTranslate.getTranslationFunction(translations[lang]);
            } else {
                window.console.error('Unsupported language `' + lang + '`');
                _cache[lang] = libTranslate.getTranslationFunction(translations.en);
            }
        }

        return _cache[lang](key, n);
    }
};

export default mod;