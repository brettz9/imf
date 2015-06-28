/*jslint vars:true, bitwise:true*/
/*globals getJSON, IntlMessageFormat */

var Localization = (function () {'use strict';

function Localization (opts) {
    opts = opts || {};
    
    var that = this;
    this.defaultNamespace = opts.defaultNamespace || '';
    if (opts.languages) {
        this.loadLocale(opts.languages, function () {
            opts.callback.apply(opts.callback, [that.getFormatter(opts.namespace), that.getFormatter.bind(that), locale, Array.from(arguments)]);
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
        var msg = new IntlMessageFormat(message, that.langs, formats);
        return msg.format(values);
    };
};

Localization.prototype.loadLocale = function (langs, cb) {
    var that = this;
    this.langs = langs;
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
