import libTranslate from '/libraries/translate';
import translations from './translations';

let _cache = {};
let currentLang = 'en';

const mod = {
    setLang (lang) {
        currentLang = lang;
    },

    t (key, n, lang) {
        lang = lang || currentLang;

        if (!_cache[lang]) {
            if (translations[lang]) {
                _cache[lang] = libTranslate.getTranslationFunction(translations[lang]);
            } else {
                window.console.error('Unsupported language `' + lang + '`');
                _cache[lang] = libTranslate.getTranslationFunction(translations.en);
            }
        }

        key = key.toLowerCase();
        key = key.replace(' ','-');

        let t = _cache[lang](key, n);
        if (t === key) {
            // if translation same as the key then no translation was found, fallback to English
            return mod.t(key, n, 'en');
        }
        return t;
    }
};

export default mod;