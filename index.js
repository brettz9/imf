/*jslint vars:true, bitwise:true*/
/*globals getJSON, IntlMessageFormat */

var Localization = (function () {'use strict';

function Localization (opts) {
    opts = opts || {};
    
    var that = this;
    this.defaultNamespace = opts.defaultNamespace || '';
    this.defaultSeparator = opts.defaultSeparator || '.';
    
    if (opts.languages) {
        this.loadLocale(opts.languages, function () {
            var locales = Array.from(arguments);
            opts.callback.apply(opts.callback, [that.getFormatter(opts.namespace), that.getFormatter.bind(that), locales]);
        });
    }
}

Localization.prototype.getFormatter = function (ns, sep) {
    var that = this;

    function messageForNSParts (ns, sep, key) {
        var loc = that.locale;
        var found = ns.split(sep).every(function (nsPart) {
            loc = loc[nsPart];
            return loc && typeof loc === 'object';
        });
        return (found && loc[key]) ? loc[key] : '';
    }
    ns = ns || this.defaultNamespace;
    sep = sep || this.defaultSeparator;
    ns = Array.isArray(ns) ? (ns.join(sep) + sep) : ns;

    return function (key, values, formats) {
        
        var message = that.locale[ns + key] || messageForNSParts(ns, sep, key);
        if (!values && !formats) {
            return message;
        }
        var msg = new IntlMessageFormat(message, that.langs, formats);
        return msg.format(values);
    };
};

Localization.prototype.loadLocale = function (langs, cb) {
    var that = this;
    this.langs = Array.isArray(langs) ? langs : [langs];
    getJSON(
        langs.map(function (lang) {
            return lang + '.json';
        }),
        function () {
            that.locales = Array.from(arguments);
            if (cb) {
                cb.apply(null, that.locales);
            }
        }
    );
};

return Localization;

}());
