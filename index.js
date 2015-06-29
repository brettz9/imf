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
    
    if (opts.languages) {
        this.loadLocales(opts.languages, function () {
            var locales = Array.from(arguments);
            if (opts.callback) {
                opts.callback.apply(opts.callback, [that.getFormatter(opts.namespace), that.getFormatter.bind(that), locales]);
            }
        });
    }
}

IMF.prototype.getFormatter = function (ns, sep) {
    var that = this;

    function messageForNSParts (ns, sep, key) {
        var loc = that.locales;
        var found = ns.split(sep).every(function (nsPart) {
            loc = loc[nsPart];
            return loc && typeof loc === 'object';
        });
        return (found && loc[key]) ? loc[key] : '';
    }
    ns = ns === undefined ? this.defaultNamespace : ns;
    sep = sep === undefined ? this.defaultSeparator : sep;
    ns = Array.isArray(ns) ? (ns.join(sep) + sep) : ns;

    return function (key, values, formats) {
        var message = that.locales[ns + key] || messageForNSParts(ns, sep, key);
        if (!values && !formats) {
            return message;
        }
        var msg = new IntlMessageFormat(message, that.langs, formats);
        return msg.format(values);
    };
};

IMF.prototype.loadLocales = function (langs, cb) {
    var that = this;
    langs = langs || navigator.language || 'en-US';
    this.langs = Array.isArray(langs) ? langs : [langs];
    getJSON(
        langs.map(this.localeFileResolver, this),
        function () {
            that.locales = Array.from(arguments);
            if (cb) {
                cb.apply(that, that.locales);
            }
        }
    );
};

return IMF;

}());
