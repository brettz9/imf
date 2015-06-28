/*jslint vars:true, bitwise:true*/
/*globals getJSON, IntlMessageFormat */

var Localization = (function () {'use strict';

function Localization (opts) {
    opts = opts || {};
    
    var that = this;
    this.defaultNamespace = opts.defaultNamespace || '';
    if (opts.lang) {
        this.loadLocale(opts.lang, function (locale) {
            opts.callback(that.getFormatter(opts.namespace), that.getFormatter.bind(that), locale);
        });
    }
}

Localization.prototype.getFormatter = function (ns) {
    var that = this;
    return function (key, values, formats) {
        var message = that.locale[(ns || that.defaultNamespace) + key];
        if (!values && !formats) {
            return message;
        }
        var msg = new IntlMessageFormat(message, [that.lang], formats);
        return msg.format(values);
    };
};

Localization.prototype.loadLocale = function (lang, cb) {
    var that = this;
    this.lang = lang;
    getJSON(lang + '.json', function (locale) {
        that.locale = locale;
        if (cb) {
            cb(locale);
        }
    });
};

return Localization;

}());
