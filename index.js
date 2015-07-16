/*jslint vars:true, bitwise:true*/
/*globals getJSON, IntlMessageFormat */

var IMF = (function () {'use strict';

function IMF (opts) {
    if (!(this instanceof IMF)) {
        return new IMF(opts);
    }
    opts = opts || {};
    
    var that = this;

    this.defaultNamespace = opts.defaultNamespace || '';
    this.defaultSeparator = opts.defaultSeparator === undefined ? '.' : opts.defaultSeparator;
    this.basePath = opts.basePath || 'locales/';
    this.fallbackLanguages = opts.fallbackLanguages;

    this.localeFileResolver = opts.localeFileResolver || function (lang) {
        return this.basePath + lang + '.json';
    };
    
    this.locales = opts.locales || [];

    if (opts.languages || opts.callback) {
        this.loadLocales(opts.languages, function () {
            var locales = Array.from(arguments);
            function runCallback () {
                if (opts.callback) {
                    opts.callback.apply(opts.callback, [that.getFormatter(opts.namespace), that.getFormatter.bind(that), locales]);
                }
            }
            if (opts.fallbackLanguages) {
                that.loadLocales(that.fallbackLanguages, function (fallbackLocale) {
                    that.fallbackLocale = fallbackLocale;
                    runCallback();
                }, true);
            }
            else {
                runCallback();
            }
        });
    }
}

IMF.prototype.getFormatter = function (ns, sep) {
    var that = this;

    function messageForNSParts (locale, ns, sep, key) {
        var loc = locale;
        var found = ns.split(sep).every(function (nsPart) {
            loc = loc[nsPart];
            return loc && typeof loc === 'object';
        });
        return (found && loc[key]) ? loc[key] : '';
    }
    var isArray = Array.isArray;
    
    ns = ns === undefined ? this.defaultNamespace : ns;
    sep = sep === undefined ? this.defaultSeparator : sep;
    ns = isArray(ns) ? ns.join(sep) : ns;

    return function (key, values, formats, fallback) {
        var message;
        var currNs = ns;
        if (key && !isArray(key) && typeof key === 'object') {
            values = key.values;
            formats = key.formats;
            fallback = key.fallback;
            key = key.key;
        }
        if (isArray(key)) { // e.g., [ns1, ns2, key]
            var newKey = key.pop();
            currNs = key.join(sep);
            key = newKey;
        }
        else {
            var keyPos = key.indexOf(sep);
            if (!currNs && keyPos > -1) { // e.g., 'ns1.ns2.key'
                currNs = key.slice(0, keyPos);
                key = key.slice(keyPos + 1);
            }
        }
        function findMessage (locale) {
            message = locale[(currNs ? currNs + sep : '') + key] || messageForNSParts(locale, currNs, sep, key);
            return message;
        }
        that.locales.some(findMessage);
        if (!message) {
            if (fallback === true) {
                return that.fallbackLocale && findMessage(that.fallbackLocale);
            }
            if (fallback) {
                return fallback({message: that.fallbackLocale && findMessage(that.fallbackLocale), langs: that.langs, namespace: currNs, separator: sep, key: key, values: values, formats: formats});
            }
            throw "Message not found for locales " + that.langs +
                (that.fallbackLanguages ? " (with fallback languages " + that.fallbackLanguages + ")" : '') +
                " with key " + key + ", namespace " + currNs + ", and namespace separator " + sep;
        }
        if (!values && !formats) {
            return message;
        }
        var msg = new IntlMessageFormat(message, that.langs, formats);
        return msg.format(values);
    };
};

IMF.prototype.loadLocales = function (langs, cb, avoidSettingLocales) {
    var that = this;
    langs = langs || navigator.language || 'en-US';
    langs = Array.isArray(langs) ? langs : [langs];
    if (!avoidSettingLocales) {
        this.langs = langs;
    }
    getJSON(
        langs.map(this.localeFileResolver, this),
        function () {
            var locales = Array.from(arguments);
            if (!avoidSettingLocales) {
                locales.forEach(function (locale) {
                    that.locales.push(locale);
                });
            }
            if (cb) {
                cb.apply(that, locales);
            }
        }
    );
};

return IMF;

}());
