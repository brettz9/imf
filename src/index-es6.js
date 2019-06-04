// Todo: Reenable
/* eslint-disable jsdoc/require-param-type */

// If strawman approved, this would only be
//    needed in the Node polyfill
import IntlMessageFormat from 'intl-messageformat';
import getJSON from 'simple-get-json';

/**
 * @param opts
 * @returns {IMFClass}
 */
function IMFClass (opts) {
  // eslint-disable-next-line no-restricted-syntax
  if (!(this instanceof IMFClass)) {
    return new IMFClass(opts);
  }
  opts = opts || {};

  this.defaultNamespace = opts.defaultNamespace || '';
  this.defaultSeparator = opts.defaultSeparator === undefined
    ? '.'
    : opts.defaultSeparator;
  this.basePath = opts.basePath || 'locales/';
  this.fallbackLanguages = opts.fallbackLanguages;

  this.localeFileResolver = opts.localeFileResolver || function (lang) {
    return this.basePath + lang + '.json';
  };

  this.locales = opts.locales || [];
  this.langs = opts.langs;
  this.fallbackLocales = opts.fallbackLocales || [];

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  const loadFallbacks = (cb) => {
    this.loadLocales(this.fallbackLanguages, function (...fallbackLocales) {
      this.fallbackLocales.push(...fallbackLocales);
      if (cb) {
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        return cb(fallbackLocales);
      }
      return undefined;
    }, true);
  };

  if (opts.languages || opts.callback) {
    this.loadLocales(opts.languages, (...locales) => {
      const runCallback = (fallbackLocales) => {
        if (opts.callback) {
          Reflect.apply(opts.callback, this, [
            this.getFormatter(opts.namespace),
            this.getFormatter.bind(this),
            locales,
            fallbackLocales
          ]);
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

IMFClass.prototype.getFormatter = function (ns, sep) {
  /**
   * @param locale
   * @param namesp
   * @param separator
   * @param key
   * @returns {string}
   */
  function messageForNSParts (locale, namesp, separator, key) {
    let loc = locale;
    const found = namesp.split(separator).every(function (nsPart) {
      loc = loc[nsPart];
      return loc && typeof loc === 'object';
    });
    return found && loc[key] ? loc[key] : '';
  }
  const {isArray} = Array;

  ns = ns === undefined ? this.defaultNamespace : ns;
  sep = sep === undefined ? this.defaultSeparator : sep;
  ns = isArray(ns) ? ns.join(sep) : ns;

  return (key, values, formats, fallback) => {
    let message;
    let currNs = ns;
    if (key && !isArray(key) && typeof key === 'object') {
      ({values, formats, fallback, key} = key);
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
    /**
     * @param locales
     * @returns {string}
     */
    function findMessage (locales) {
      locales.some(function (locale) {
        message = locale[(currNs ? currNs + sep : '') + key] ||
          messageForNSParts(locale, currNs, sep, key);
        return message;
      });
      return message;
    }
    findMessage(this.locales);
    if (!message) {
      if (typeof fallback === 'function') {
        return fallback({
          message: this.fallbackLocales.length &&
            findMessage(this.fallbackLocales),
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
    const msg = new IntlMessageFormat(message, this.langs, formats);
    return msg.format(values);
  };
};

IMFClass.prototype.loadLocales = function (langs, cb, avoidSettingLocales) {
  langs = langs || navigator.language || 'en-US';
  langs = Array.isArray(langs) ? langs : [langs];
  if (!avoidSettingLocales) {
    this.langs = langs;
  }
  return getJSON(
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

export default IMFClass;
