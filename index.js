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

    this.localeFileResolver = opts.localeFileResolver || function (lang) {
        return this.basePath + lang + '.json';
    };
    
    if (opts.languages || opts.callback) {
        this.loadLocales(opts.languages, function () {
            var locales = Array.from(arguments);
            function runCallback () {
                if (opts.callback) {
                    opts.callback.apply(opts.callback, [that.getFormatter(opts.namespace), that.getFormatter.bind(that), locales]);
                }
            }
            if (opts.fallbackLanguage) {
                that.loadLocales(opts.fallbackLanguage, function (fallbackLocale) {
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
    ns = ns === undefined ? this.defaultNamespace : ns;
    sep = sep === undefined ? this.defaultSeparator : sep;
    ns = Array.isArray(ns) ? ns.join(sep) : ns;

    return function (key, values, formats, fallback) {
        var message;
        if (key && typeof key === 'object') {
            values = key.values;
            formats = key.formats;
            fallback = key.fallback;
            key = key.key;
        }
        function findMessage (locale) {
            message = locale[(ns ? ns + sep : '') + key] || messageForNSParts(locale, ns, sep, key);
            return message;
        }
        that.locales.some(findMessage);
        if (!message) {
            if (fallback) {
                return fallback({message: that.fallbackLocale && findMessage(that.fallbackLocale), langs: that.langs, namespace: ns, separator: sep, key: key, values: values, formats: formats});
            }
            throw "Message not found for locales " + that.langs + " with key " + key + ", namespace " + ns + ", and namespace separator " + sep;
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
    this.langs = Array.isArray(langs) ? langs : [langs];
    getJSON(
        this.langs.map(this.localeFileResolver, this),
        function () {
            var locales = Array.from(arguments);
            if (!avoidSettingLocales) {
                that.locales = locales;
            }
            if (cb) {
                cb.apply(that, locales);
            }
        }
    );
};

return IMF;

}());
