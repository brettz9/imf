(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.IMF = factory());
}(this, (function () { 'use strict';

function __async(g) {
  return new Promise(function (s, j) {
    function c(a, x) {
      try {
        var r = g[x ? "throw" : "next"](a);
      } catch (e) {
        j(e);return;
      }r.done ? s(r.value) : Promise.resolve(r.value).then(c, d);
    }function d(e) {
      c(e, 1);
    }c();
  });
}

function getJSON$1(jsonURL, cb, errBack) {
    return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var arrResult, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;

                        if (!Array.isArray(jsonURL)) {
                            _context.next = 7;
                            break;
                        }

                        _context.next = 4;
                        return Promise.all(jsonURL.map(function (url) {
                            return getJSON$1(url);
                        }));

                    case 4:
                        arrResult = _context.sent;

                        if (cb) {
                            cb.apply(null, arrResult);
                        }
                        return _context.abrupt("return", arrResult);

                    case 7:
                        _context.next = 9;
                        return fetch(jsonURL).then(function (r) {
                            return r.json();
                        });

                    case 9:
                        result = _context.sent;
                        return _context.abrupt("return", typeof cb === 'function' ? cb(result) : result);

                    case 13:
                        _context.prev = 13;
                        _context.t0 = _context["catch"](0);

                        _context.t0.message += " (File: " + jsonURL + ")";

                        if (!errBack) {
                            _context.next = 18;
                            break;
                        }

                        return _context.abrupt("return", errBack(_context.t0, jsonURL));

                    case 18:
                        throw _context.t0;

                    case 19:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 13]]);
    })());
}

/* globals global, require */
if (typeof fetch === 'undefined') {
    global.fetch = function (jsonURL) {
        return new Promise(function (resolve, reject) {
            var _require = require('local-xmlhttprequest'),
                XMLHttpRequest = _require.XMLHttpRequest; // Don't change to an import as won't resolve for browser testing


            var r = new XMLHttpRequest();
            r.open('GET', jsonURL, true);
            // r.responseType = 'json';
            r.onreadystatechange = function () {
                if (r.readyState !== 4) {
                    return;
                }
                if (r.status === 200) {
                    // var json = r.json;
                    var response = r.responseText;
                    resolve({
                        json: function json() {
                            return JSON.parse(response);
                        }
                    });
                    return;
                }
                reject(new SyntaxError('Failed to fetch URL: ' + jsonURL + 'state: ' + r.readyState + '; status: ' + r.status));
            };
            r.send();
        });
    };
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

/* globals IntlMessageFormat */
function IMFClass(opts) {
    var _this = this,
        _arguments = arguments;

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

    var loadFallbacks = function loadFallbacks(cb) {
        _this.loadLocales(_this.fallbackLanguages, function () {
            var _fallbackLocales;

            for (var _len = arguments.length, fallbackLocales = Array(_len), _key = 0; _key < _len; _key++) {
                fallbackLocales[_key] = arguments[_key];
            }

            (_fallbackLocales = this.fallbackLocales).push.apply(_fallbackLocales, fallbackLocales);
            if (cb) {
                return cb(fallbackLocales);
            }
        }, true);
    };

    if (opts.languages || opts.callback) {
        this.loadLocales(opts.languages, function () {
            var locales = Array.from(_arguments);
            var runCallback = function runCallback(fallbackLocales) {
                if (opts.callback) {
                    opts.callback.apply(_this, [_this.getFormatter(opts.namespace), _this.getFormatter.bind(_this), locales, fallbackLocales]);
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
    var _this2 = this;

    function messageForNSParts(locale, namesp, separator, key) {
        var loc = locale;
        var found = namesp.split(separator).every(function (nsPart) {
            loc = loc[nsPart];
            return loc && (typeof loc === 'undefined' ? 'undefined' : _typeof(loc)) === 'object';
        });
        return found && loc[key] ? loc[key] : '';
    }
    var isArray = Array.isArray;

    ns = ns === undefined ? this.defaultNamespace : ns;
    sep = sep === undefined ? this.defaultSeparator : sep;
    ns = isArray(ns) ? ns.join(sep) : ns;

    return function (key, values, formats, fallback) {
        var message = void 0;
        var currNs = ns;
        if (key && !isArray(key) && (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
            values = key.values;
            formats = key.formats;
            fallback = key.fallback;
            key = key.key;
        }
        if (isArray(key)) {
            // e.g., [ns1, ns2, key]
            var newKey = key.pop();
            currNs = key.join(sep);
            key = newKey;
        } else {
            var keyPos = key.indexOf(sep);
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
        findMessage(_this2.locales);
        if (!message) {
            if (typeof fallback === 'function') {
                return fallback({
                    message: _this2.fallbackLocales.length && findMessage(_this2.fallbackLocales),
                    langs: _this2.langs,
                    namespace: currNs,
                    separator: sep,
                    key: key,
                    values: values,
                    formats: formats
                });
            }
            if (fallback !== false) {
                return _this2.fallbackLocales.length && findMessage(_this2.fallbackLocales);
            }
            throw new Error('Message not found for locales ' + _this2.langs + (_this2.fallbackLanguages ? ' (with fallback languages ' + _this2.fallbackLanguages + ')' : '') + ' with key ' + key + ', namespace ' + currNs + ', and namespace separator ' + sep);
        }
        if (!values && !formats) {
            return message;
        }
        var msg = new IntlMessageFormat(message, _this2.langs, formats);
        return msg.format(values);
    };
};

IMFClass.prototype.loadLocales = function (langs, cb, avoidSettingLocales) {
    var _this3 = this;

    langs = langs || navigator.language || 'en-US';
    langs = Array.isArray(langs) ? langs : [langs];
    if (!avoidSettingLocales) {
        this.langs = langs;
    }
    return getJSON$1(langs.map(this.localeFileResolver, this), function () {
        for (var _len2 = arguments.length, locales = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            locales[_key2] = arguments[_key2];
        }

        if (!avoidSettingLocales) {
            var _locales;

            (_locales = _this3.locales).push.apply(_locales, locales);
        }
        if (cb) {
            cb.apply(_this3, locales);
        }
    });
};

return IMFClass;

})));
