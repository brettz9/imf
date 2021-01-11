'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var IntlMessageFormat = require('intl-messageformat');
var simpleGetJson = require('simple-get-json');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var IntlMessageFormat__default = /*#__PURE__*/_interopDefaultLegacy(IntlMessageFormat);

// If strawman approved, this would only be

class IMFClass {
  constructor(opts) {
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

    const loadFallbacks = cb => {
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

        const runCallback = fallbackLocales => {
          if (opts.callback) {
            opts.callback.apply(this, [this.getFormatter(opts.namespace), this.getFormatter.bind(this), locales, fallbackLocales]);
          }
        };

        if ({}.hasOwnProperty.call(opts, 'fallbackLanguages')) {
          loadFallbacks(runCallback);
        } else {
          runCallback();
        }
      });
    } else if ({}.hasOwnProperty.call(opts, 'fallbackLanguages')) {
      loadFallbacks();
    }
  }

  getFormatter(ns, sep) {
    function messageForNSParts(locale, namesp, separator, key) {
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

      if (isArray(key)) {
        // e.g., [ns1, ns2, key]
        const newKey = key.pop();
        currNs = key.join(sep);
        key = newKey;
      } else {
        const keyPos = key.indexOf(sep);

        if (!currNs && keyPos > -1) {
          // e.g., 'ns1.ns2.key'
          currNs = key.slice(0, keyPos);
          key = key.slice(keyPos + 1);
        }
      }

      function findMessage(locales) {
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

        throw new Error('Message not found for locales ' + this.langs + (this.fallbackLanguages ? ' (with fallback languages ' + this.fallbackLanguages + ')' : '') + ' with key ' + key + ', namespace ' + currNs + ', and namespace separator ' + sep);
      }

      if (!values && !formats) {
        return message;
      }

      const msg = new IntlMessageFormat__default['default'](message, this.langs, formats);
      return msg.format(values);
    };
  }

  loadLocales(langs, cb, avoidSettingLocales) {
    langs = langs || navigator.language || 'en-US';
    langs = Array.isArray(langs) ? langs : [langs];

    if (!avoidSettingLocales) {
      this.langs = langs;
    }

    return simpleGetJson.getJSON(langs.map(this.localeFileResolver, this), (...locales) => {
      if (!avoidSettingLocales) {
        this.locales.push(...locales);
      }

      if (cb) {
        cb.apply(this, locales);
      }
    });
  }

}

const IMF = opts => {
  return new IMFClass(opts);
};

/* eslint-env node */

if (typeof global !== 'undefined') {
  global.IntlMessageFormat = IntlMessageFormat__default['default'];
}

exports.IMF = IMF;
exports.IMFClass = IMFClass;
