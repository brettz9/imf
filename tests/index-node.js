(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

async function getJSON$1 (jsonURL, cb, errBack) {
    try {
        if (Array.isArray(jsonURL)) {
            const arrResult = await Promise.all(jsonURL.map((url) => getJSON$1(url)));
            if (cb) {
                cb.apply(null, arrResult);
            }
            return arrResult;
        }
        const result = await fetch(jsonURL).then((r) => r.json());
        return typeof cb === 'function' ? cb(result) : result;
    } catch (e) {
        e.message += ` (File: ${jsonURL})`;
        if (errBack) {
            return errBack(e, jsonURL);
        }
        throw e;
    }
}

/* globals global, require */
if (typeof module !== 'undefined') {
    global.fetch = (jsonURL) => {
        return new Promise((resolve, reject) => {
            const {XMLHttpRequest} = require('local-xmlhttprequest'); // Don't change to an import as won't resolve for browser testing
            const r = new XMLHttpRequest();
            r.open('GET', jsonURL, true);
            // r.responseType = 'json';
            r.onreadystatechange = function () {
                if (r.readyState !== 4) { return; }
                if (r.status === 200) {
                    // var json = r.json;
                    const response = r.responseText;
                    resolve({
                        json: () => JSON.parse(response)
                    });
                    return;
                }
                reject(new SyntaxError(
                    'Failed to fetch URL: ' + jsonURL + 'state: ' +
                    r.readyState + '; status: ' + r.status
                ));
            };
            r.send();
        });
    };
}

/* globals IntlMessageFormat, require */

const IntlMsgFormat = typeof module !== 'undefined' ? require('intl-messageformat') : IntlMessageFormat;

function IMFClass (opts) {
    if (!(this instanceof IMFClass)) {
        return new IMFClass(opts);
    }
    opts = opts || {};

    this.defaultNamespace = opts.defaultNamespace || '';
    this.defaultSeparator = opts.defaultSeparator === undefined ? '.' : opts.defaultSeparator;
    this.basePath = opts.basePath || 'locales/';
    this.fallbackLanguages = opts.fallbackLanguages;

    this.localeFileResolver = opts.localeFileResolver || function (lang) {
        return this.basePath + lang + '.json';
    };

    this.locales = opts.locales || [];
    this.langs = opts.langs;
    this.fallbackLocales = opts.fallbackLocales || [];

    const loadFallbacks = (cb) => {
        this.loadLocales(this.fallbackLanguages, function (...fallbackLocales) {
            this.fallbackLocales.push(...fallbackLocales);
            if (cb) {
                return cb(fallbackLocales);
            }
        }, true);
    };

    if (opts.languages || opts.callback) {
        this.loadLocales(opts.languages, () => {
            const locales = Array.from(arguments);
            const runCallback = (fallbackLocales) => {
                if (opts.callback) {
                    opts.callback.apply(this, [
                        this.getFormatter(opts.namespace),
                        this.getFormatter.bind(this),
                        locales,
                        fallbackLocales
                    ]);
                }
            };
            if (opts.hasOwnProperty('fallbackLanguages')) {
                loadFallbacks(runCallback);
            } else {
                runCallback();
            }
        });
    } else if (opts.hasOwnProperty('fallbackLanguages')) {
        loadFallbacks();
    }
}

IMFClass.prototype.getFormatter = function (ns, sep) {
    function messageForNSParts (locale, namesp, separator, key) {
        let loc = locale;
        const found = namesp.split(separator).every(function (nsPart) {
            loc = loc[nsPart];
            return loc && typeof loc === 'object';
        });
        return found && loc[key] ? loc[key] : '';
    }
    const isArray = Array.isArray;

    ns = ns === undefined ? this.defaultNamespace : ns;
    sep = sep === undefined ? this.defaultSeparator : sep;
    ns = isArray(ns) ? ns.join(sep) : ns;

    return (key, values, formats, fallback) => {
        let message;
        let currNs = ns;
        if (key && !isArray(key) && typeof key === 'object') {
            values = key.values;
            formats = key.formats;
            fallback = key.fallback;
            key = key.key;
        }
        if (isArray(key)) { // e.g., [ns1, ns2, key]
            const newKey = key.pop();
            currNs = key.join(sep);
            key = newKey;
        } else {
            const keyPos = key.indexOf(sep);
            if (!currNs && keyPos > -1) { // e.g., 'ns1.ns2.key'
                currNs = key.slice(0, keyPos);
                key = key.slice(keyPos + 1);
            }
        }
        function findMessage (locales) {
            locales.some(function (locale) {
                message = locale[(currNs ? currNs + sep : '') + key] || messageForNSParts(locale, currNs, sep, key);
                return message;
            });
            return message;
        }
        findMessage(this.locales);
        if (!message) {
            if (typeof fallback === 'function') {
                return fallback({
                    message: this.fallbackLocales.length && findMessage(this.fallbackLocales),
                    langs: this.langs,
                    namespace: currNs,
                    separator: sep,
                    key,
                    values,
                    formats
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
                ' with key ' + key + ', namespace ' + currNs +
                ', and namespace separator ' + sep
            );
        }
        if (!values && !formats) {
            return message;
        }
        const msg = new IntlMsgFormat(message, this.langs, formats);
        return msg.format(values);
    };
};

IMFClass.prototype.loadLocales = function (langs, cb, avoidSettingLocales) {
    langs = langs || navigator.language || 'en-US';
    langs = Array.isArray(langs) ? langs : [langs];
    if (!avoidSettingLocales) {
        this.langs = langs;
    }
    return getJSON$1(
        langs.map(this.localeFileResolver, this),
        (...locales) => {
            if (!avoidSettingLocales) {
                this.locales.push(...locales);
            }
            if (cb) {
                cb.apply(this, locales);
            }
        }
    );
};

const write = (...msgs) => {
    if (typeof document !== 'undefined') {
        document.body.append(
            ...msgs, ...Array.from({length: 2}, () => document.createElement('br'))
        );
    } else {
        console.log(...msgs);
    }
};
IMFClass({
    languages: ['zh-CN', 'en-US'],
    callback: function (l, getFormatter) { // , enLocale, esLocale, ptLocale, zhCNLocale
        write(l('Localized value!')); // Looks up 'Localized value!' in Chinese file (at 'locales/zh-CN.json') and in English (at 'locales/en.json') if not present in Chinese
        const tk = getFormatter('tablekey');
        write(tk('Tablekey localized value!')); // Equivalent to l('tablekey.Tablekey localized value!')

        const tk2 = getFormatter(['tablekey', 'nestedMore']);
        write(tk2('Tablekey localized value2'));

        const tk3 = getFormatter('tablekey.nestedMore');

        write(tk3('Tablekey localized value2'));

        IMFClass({
            languages: 'zh-CN',
            fallbackLanguages: 'en-US',
            callback: function (l, getFormatter) {
                l({
                    key: 'onlyInEnglish',
                    fallback (res) {
                        write(res.message);
                    }
                });
            }
        });
    }
});

})));
