/* eslint-env node, browser */
/* globals IntlMessageFormat */
import getJSON from 'simple-get-json';
// https://github.com/shadiabuhilal/rtl-detect/issues/3

import {version} from '../package.json';

const baseURL = typeof __dirname !== 'undefined'
    ? __dirname
    : (() => {
        const src = (document.currentScript && // May not be present if running from say console
            document.currentScript.src
        ) || location.href;
        return src.replace(/\/[^/]+\/?$/, '');
    })();
const isArray = Array.isArray;

// LOCALE LOADING
// Needed to allow the non-modular scripts in `load` below to work
// https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval
const rollupSaferGlobalEval = eval; // eslint-disable-line no-eval

const xor = (a, b) => {
    return !a !== !b;
};

class IMF {
    constructor (opts = {}) {
        if (xor(opts.languages, opts.locales)) {
            throw new TypeError(`If languages or locales is supplied, the other must be also.`);
        }
        if (xor(opts.fallbackLanguages, opts.fallbackLocales)) {
            throw new TypeError(`If fallbackLanguages or fallbackLocales is supplied, the other must be also.`);
        }
        Object.assign(this, {
            defaultNamespace: '',
            defaultSeparator: '.',
            basePath: 'locales/',
            avoidRuleLoading: false,
            languages: [],
            locales: [],
            fallbackLanguages: [],
            fallbackLocales: [],
            localeExtension: 'json',
            retriever: getJSON,
            localeFileResolver: (lang) => `${this.basePath}${lang}${this.localeExtension ? '.' + this.localeExtension : ''}`
        }, opts);
    }

    async load ({languages, fallbackLanguages, defaultNamespace, retriever, avoidRuleLoading = this.avoidRuleLoading} = {}) {
        if (!languages && !fallbackLanguages &&
            !this.languages.length && !this.fallbackLanguages.length
        ) {
            throw new TypeError('`languages` or `fallbackLanguages` must be supplied to `load` if none are preexisting.');
        }
        if (!isArray(languages)) {
            languages = [languages];
        }
        const cache = await caches.open(`imf-${version}`);
        const promises = [];
        if (!avoidRuleLoading) {
            // We could avoid relying on a global `IntlMessageFormat` with a
            //  user-supplied instance and local `eval`, but that is less
            //  safe, and this is a polyfill anyways

            // If expressed as a module (requested sync loading
            //   at https://github.com/yahoo/intl-messageformat/issues/174#issuecomment-350638974 )
            //   could use https://github.com/tc39/proposal-dynamic-import#example
            //   until dynamic imports may exist given that this should only
            //   be conditionally loaded.
            // The localized version defines plural rules (`pluralRuleFunction`) and
            //   parent languages (`parentLocale`)
            // We could alternatively do the `IntlMessageFormat.__addLocaleData()` calls ourselves
            promises.push(...[...languages, ...fallbackLanguages].map(async (language) => {
                const normalizedLanguage = Intl.getCanonicalLocales(language)[0]; // Could use this: new IntlMessageFormat('', language).resolvedOptions().locale;
                const baseLanguage = normalizedLanguage.replace(/-.*$/, '');
                const url = new URL(`./node_modules/intl-messageformat/dist/locale-data/${baseLanguage}.js`, baseURL);
                const cachedRuleResp = await cache.match(new Request(url));
                let ruleResp, langRulesJSText;
                try {
                    ruleResp = cachedRuleResp || await fetch(url);
                    if (!ruleResp.ok) {
                        throw new Error('Response not OK');
                    }
                    langRulesJSText = await ruleResp.text();
                } catch (err) {
                    // We report error but allow other languages to get processed
                    console.error(`Localization rules for language ${language} not found; erred with ${err}; ignoring...`);
                    return;
                }
                try {
                    rollupSaferGlobalEval(langRulesJSText);
                    if (!cachedRuleResp) cache.put(url, ruleResp);
                } catch (err) {
                    // We report error but allow other languages to get processed
                    console.error(`Error processing localization rules for language ${language}`);
                }
            }));
        }

        promises.unshift(this.loadLocales({languages, retriever}));
        if (fallbackLanguages) {
            promises.splice(1, 0, this.loadFallbackLocales({fallbackLanguages, retriever}));
        }
        await Promise.all(promises);
        const ret = {
            _: this.namespacer({defaultNamespace}),
            namespacer: this.namespacer.bind(this),
            locales: this.locales,
            fallbackLocales: this.fallbackLocales
        };
        // Add aliases
        ret.f = ret.l = ret._;
        return ret;
    }

    async loadFallbackLocales ({fallbackLanguages, avoidSettingLocales, retriever}) {
        if (!avoidSettingLocales) {
            this.fallbackLanguages.push(...fallbackLanguages);
        }
        const fallbackLocales = await this.loadLocales({
            avoidSettingLocales: true,
            languages: fallbackLanguages,
            retriever
        });
        if (!avoidSettingLocales) {
            this.fallbackLocales.push(...fallbackLocales);
        }
        return fallbackLocales;
    }

    async loadLocales ({avoidSettingLocales, retriever = getJSON, languages = navigator.languages
        ? navigator.languages[0]
        : (navigator.language || navigator.userLanguage) || 'en-US'
    }) {
        if (!isArray(languages)) {
            languages = [languages];
        }
        if (!avoidSettingLocales) {
            this.languages.push(...languages);
        }
        const locales = (await Promise.all( // Though getJSON can handle arrays, we don't assume all retrievers can (and we also want a language-specific error message)
            languages.map(async (language) => {
                const url = new URL(`${language}`);
                const cachedLocale = JSON.parse(localStorage.getItem(url));
                try {
                    return cachedLocale || retriever(this.localeFileResolver(language));
                } catch (err) {
                    // We only warn as this could be intentionally deferring to parent
                    console.warn(`Locale could not be found for ${language}; erred with ${err}`);

                    // Normal rule: ca-ES-VALENCIA -> ca-ES; zh-Hans -> zh
                    // Exceptions:
                    //      pt-AO -> pt-PT
                    //      en-150 -> en-001
                    //      es-AR -> es-419
                    //      es-BO -> es-419
                    // See also https://github.com/tc39/ecma402/issues/46#issuecomment-351260753 and links
                    // See also macrolanguages from https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry

                    // For future `Intl.getParentLocales`: https://github.com/tc39/ecma402/issues/87
                    // Todo: If not present, check for parent locale(s) of `language`
                    // IntlMessageFormat.__localeData__[locale.toLowerCase()].parentLocale
                    // IntlMessageFormat.__localeData__['zh-hans'].parentLocale

                    // Todo: look for sister locales if locale and parent (or grandparents) not present? https://github.com/tc39/ecma402/issues/87#issuecomment-352971275

                    /*
                    1. Todo: Change to real tests and also include actual formatting examples!
                        1. `getJSON` catch to capture thrown object with file property
                            indicating the file causing the error
                    */
                }
            })
        )).filter(Boolean);
        if (!avoidSettingLocales) {
            this.locales.push(...locales);
        }
        return locales;
    }

    namespacer ({namespace: defaultNamespace = this.defaultNamespace, separator = this.defaultSeparator}) {
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
                ({key, values, formats, fallback} = key);
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
            if (!key) {
                throw new TypeError('A key must be supplied to a localizer/namespacer function');
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
                        languages: this.languages,
                        fallbackLanguages: this.fallbackLanguages
                    });
                }
                if (fallback === false || !this.fallbackLocales.length) {
                    throw new Error(
                        `Message not found for locales ${this.languages}` +
                        (this.fallbackLanguages
                            ? ` (with fallback languages ${this.fallbackLanguages})`
                            : ''
                        ) +
                        ` with key ${key}, namespace ${namespace}` +
                        `, and namespace separator ${separator}`
                    );
                }
                message = findMessage(this.fallbackLocales);
            }
            if (!values && !formats) {
                return message;
            }
            this.intlMessageFormat = new IntlMessageFormat(message, this.languages, formats);
            return this.intlMessageFormat.format(values);
        };
    }
};

async function imf (IMF, {options}) {
    const imfInstance = new IMF(options);
    const formatterNamespacerAndLocales = await imfInstance.load(options);
    return {imfInstance, ...formatterNamespacerAndLocales};
}

export {IMF, imf, imf as default};
