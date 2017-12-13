/* globals IntlMessageFormat */
import getJSON from 'simple-get-json';

const isArray = Array.isArray;

// See request to load locale info synchronously: https://github.com/yahoo/intl-messageformat/issues/174
// The localized version defines plural rules (`pluralRuleFunction`) and
//    parent languages (`parentLocale`)
// With synchronous XHR deprecated, the only way to keep this fully
//   modular (without requiring other blocking script tags) is to go async
// Won't be necessary for browser in future if implemented
// We could alternatively do the `IntlMessageFormat.__addLocaleData()` calls ourselves

// https://github.com/tc39/ecma402/issues/46#issuecomment-351260753
// https://github.com/yahoo/intl-messageformat/issues/175
// Normal rule: ca-ES-VALENCIA -> ca-ES; zh-Hans -> zh
// Exceptions:
//      pt-AO -> pt-PT
//      en-150 -> en-001
//      es-AR -> es-419
//      es-BO -> es-419
// For parentRule request: https://github.com/yahoo/intl-messageformat/issues/175
// Get `locale` from `resolvedOptions`
// IntlMessageFormat.__localeData__[locale.toLowerCase()].parentLocale
// IntlMessageFormat.__localeData__['zh-hans'].parentLocale
/*
1.  Todo: Add logic to recover if file like `en-US.json` is not
    present but `en.json` is (might enhance `getJSON`
    errBack to capture thrown object with file property
    indicating the file causing the error). Or even look for
    `en-GB.json`
1. Todo: Expose resolvedOptions and/or IntlMessageFormat instance
*/
class IMF {
    constructor (opts = {}) {
        Object.assign(this, {
            IntlMessageFormat,
            fallbackLanguages: undefined,
            langs: undefined,
            defaultNamespace: '',
            defaultSeparator: '.',
            basePath: 'locales/',
            locales: [],
            fallbackLocales: [],
            localeFileResolver: (lang) => `${this.basePath}${lang}.json`
        }, opts);

        const {languages, callback, namespace, fallbackLanguages} = opts;
        if (languages || callback) {
            this.load({languages, fallbackLanguages, namespace, callback, _noArgs: true});
        } else if (fallbackLanguages) {
            this.loadFallbacks();
        }
    }

    setMessageFormat (messageFormatObject) {
        this.IntlMessageFormat = messageFormatObject;
    }

    async load ({languages, fallbackLanguages, namespace, callback, _noArgs = false}) { // eslint-disable-line camelcase
        const locales = await this.loadLocales({languages});
        let fallbackLocales;
        if (fallbackLanguages) {
            fallbackLocales = await this.loadFallbacks();
        }
        if (!callback && _noArgs) {
            return;
        }
        const args = [
            this.getFormatter({defaultNamespace: namespace}),
            this.getFormatter.bind(this),
            locales,
            fallbackLocales
        ];
        if (callback) {
            callback.apply(this, args);
        }
        return args;
    }

    async loadFallbacks (cb) {
        const fallbackLocales = await this.loadLocales({
            avoidSettingLocales: true,
            languages: this.fallbackLanguages
        });
        this.fallbackLocales.push(...fallbackLocales);
        return fallbackLocales;
    }

    getFormatter ({defaultNamespace = this.defaultNamespace, separator = this.defaultSeparator}) {
        function messageForNSParts (locale, namesp, sep, key) {
            let loc = locale;
            const found = namesp.split(sep).every(function (nsPart) {
                loc = loc[nsPart];
                return loc && typeof loc === 'object';
            });
            return found && loc[key] ? loc[key] : '';
        }

        if (isArray(defaultNamespace)) {
            defaultNamespace = defaultNamespace.join(separator);
        }

        return (key, values, formats, fallback) => {
            let message;
            let namespace = defaultNamespace;
            if (key && !isArray(key) && typeof key === 'object') {
                ({values, formats, fallback, key} = key);
            }
            if (!isArray(key)) {
                if (!namespace && String(key).includes(separator)) {
                    key = key.split(separator);
                }
            }
            if (isArray(key)) { // e.g., [ns1, ns2, key]
                const newKey = key.pop();
                namespace = key.join(separator);
                key = newKey;
            }
            function findMessage (locales) {
                locales.some((locale) => {
                    message = locale[(namespace ? namespace + separator : '') + key] ||
                        messageForNSParts(locale, namespace, separator, key);
                    return message;
                });
                return message;
            }
            findMessage(this.locales);
            if (!message) {
                if (typeof fallback === 'function') {
                    return fallback({
                        namespace, separator, key, values, formats, // eslint-disable-line object-property-newline
                        message: this.fallbackLocales.length && findMessage(this.fallbackLocales),
                        langs: this.langs
                    });
                }
                if (fallback !== false) {
                    return this.fallbackLocales.length && findMessage(this.fallbackLocales);
                }
                throw new Error(
                    'Message not found for locales ' + this.langs +
                    (this.fallbackLanguages
                        ? ' (with fallback languages ' + this.fallbackLanguages + ')'
                        : ''
                    ) +
                    ' with key ' + key + ', namespace ' + namespace +
                    ', and namespace separator ' + separator
                );
            }
            if (!values && !formats) {
                return message;
            }
            const msg = new this.IntlMessageFormat(message, this.langs, formats);
            return msg.format(values);
        };
    }

    async loadLocales ({cb, avoidSettingLocales, languages = navigator.language || 'en-US'}) {
        if (!isArray(languages)) {
            languages = [languages];
        }
        if (!avoidSettingLocales) {
            this.langs = languages;
        }
        let locales = await getJSON(languages.map(this.localeFileResolver, this));
        if (!avoidSettingLocales) {
            this.locales.push(...locales);
        }
        locales = avoidSettingLocales ? locales : this.locales;
        if (cb) {
            cb.apply(this, locales);
        }
        return locales;
    }
};

async function IMFFormatter (IMF, {options}) {
    const imf = new IMF(options);
    const formattersAndLocales = await imf.formattersAndLocales();
    return {imf, ...formattersAndLocales};
}

export {IMFFormatter, IMF, IMF as default};
