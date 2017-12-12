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

function getJSON(jsonURL, cb, errBack) {
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
                            return getJSON(url);
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

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var isArray = Array.isArray;

// See request to load locale info synchronously: https://github.com/yahoo/intl-messageformat/issues/174
// The localized version defines plural rules (`pluralRuleFunction`) and
//    parent languages (`parentLocale`)
// With synchronous XHR deprecated, the only way to keep this fully
//   modular (without requiring other blocking script tags) is to go async
// Won't be necessary for browser in future if implemented
// We could alternatively do the `IntlMessageFormat.__addLocaleData()` calls ourselves

// https://github.com/yahoo/intl-messageformat/issues/175
// Normal rule: ca-ES-VALENCIA -> ca-ES; zh-Hans -> zh
// Exceptions:
//      pt-AO -> pt-PT
//      en-150 -> en-001
//      es-AR -> es-419
//      es-BO -> es-419
// For parentRule request: https://github.com/yahoo/intl-messageformat/issues/175
// Get `locale` from `resolvedOptions`
// IntlMessageFormat.__localeData__[locale.toLowerCase()].parentLocale
// IntlMessageFormat.__localeData__['zh-hans'].parentLocale
/*
1.  Todo: Add logic to recover if file like `en-US.json` is not
    present but `en.json` is (might enhance `getJSON`
    errBack to capture thrown object with file property
    indicating the file causing the error). Or even look for
    `en-GB.json`
1. Todo: Expose resolvedOptions and/or IntlMessageFormat instance
*/

var IMF = function () {
    function IMF() {
        var _this = this;

        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, IMF);

        Object.assign(this, {
            IntlMessageFormat: IntlMessageFormat,
            fallbackLanguages: undefined,
            langs: undefined,
            defaultNamespace: '',
            defaultSeparator: '.',
            basePath: 'locales/',
            locales: [],
            fallbackLocales: [],
            localeFileResolver: function localeFileResolver(lang) {
                return '' + _this.basePath + lang + '.json';
            }
        }, opts);

        var languages = opts.languages,
            callback = opts.callback,
            namespace = opts.namespace,
            fallbackLanguages = opts.fallbackLanguages;

        if (languages || callback) {
            this.load({ languages: languages, fallbackLanguages: fallbackLanguages, namespace: namespace, callback: callback, _noArgs: true });
        } else if (fallbackLanguages) {
            this.loadFallbacks();
        }
    }

    createClass(IMF, [{
        key: 'setMessageFormat',
        value: function setMessageFormat(messageFormatObject) {
            this.IntlMessageFormat = messageFormatObject;
        }
    }, {
        key: 'load',
        value: function load(_ref) {
            var languages = _ref.languages,
                fallbackLanguages = _ref.fallbackLanguages,
                namespace = _ref.namespace,
                callback = _ref.callback,
                _ref$_noArgs = _ref._noArgs,
                _noArgs = _ref$_noArgs === undefined ? false : _ref$_noArgs;

            return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var locales, fallbackLocales, args;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.loadLocales({ languages: languages });

                            case 2:
                                locales = _context.sent;
                                fallbackLocales = void 0;

                                if (!fallbackLanguages) {
                                    _context.next = 8;
                                    break;
                                }

                                _context.next = 7;
                                return this.loadFallbacks();

                            case 7:
                                fallbackLocales = _context.sent;

                            case 8:
                                if (!(!callback && _noArgs)) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return');

                            case 10:
                                args = [this.getFormatter({ defaultNamespace: namespace }), this.getFormatter.bind(this), locales, fallbackLocales];

                                if (callback) {
                                    callback.apply(this, args);
                                }
                                return _context.abrupt('return', args);

                            case 13:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }).call(this));
        }
    }, {
        key: 'loadFallbacks',
        value: function loadFallbacks(cb) {
            return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var _fallbackLocales;

                var fallbackLocales;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.loadLocales({
                                    avoidSettingLocales: true,
                                    languages: this.fallbackLanguages
                                });

                            case 2:
                                fallbackLocales = _context2.sent;

                                (_fallbackLocales = this.fallbackLocales).push.apply(_fallbackLocales, toConsumableArray(fallbackLocales));
                                return _context2.abrupt('return', fallbackLocales);

                            case 5:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }).call(this));
        }
    }, {
        key: 'getFormatter',
        value: function getFormatter(_ref2) {
            var _this2 = this;

            var _ref2$defaultNamespac = _ref2.defaultNamespace,
                defaultNamespace = _ref2$defaultNamespac === undefined ? this.defaultNamespace : _ref2$defaultNamespac,
                _ref2$separator = _ref2.separator,
                separator = _ref2$separator === undefined ? this.defaultSeparator : _ref2$separator;

            function messageForNSParts(locale, namesp, sep, key) {
                var loc = locale;
                var found = namesp.split(sep).every(function (nsPart) {
                    loc = loc[nsPart];
                    return loc && (typeof loc === 'undefined' ? 'undefined' : _typeof(loc)) === 'object';
                });
                return found && loc[key] ? loc[key] : '';
            }

            if (isArray(defaultNamespace)) {
                defaultNamespace = defaultNamespace.join(separator);
            }

            return function (key, values, formats, fallback) {
                var message = void 0;
                var namespace = defaultNamespace;
                if (key && !isArray(key) && (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                    var _key = key;
                    values = _key.values;
                    formats = _key.formats;
                    fallback = _key.fallback;
                    key = _key.key;
                }
                if (!isArray(key)) {
                    if (!namespace && String(key).includes(separator)) {
                        key = key.split(separator);
                    }
                }
                if (isArray(key)) {
                    // e.g., [ns1, ns2, key]
                    var newKey = key.pop();
                    namespace = key.join(separator);
                    key = newKey;
                }
                function findMessage(locales) {
                    locales.some(function (locale) {
                        message = locale[(namespace ? namespace + separator : '') + key] || messageForNSParts(locale, namespace, separator, key);
                        return message;
                    });
                    return message;
                }
                findMessage(_this2.locales);
                if (!message) {
                    if (typeof fallback === 'function') {
                        return fallback({
                            namespace: namespace, separator: separator, key: key, values: values, formats: formats, // eslint-disable-line object-property-newline
                            message: _this2.fallbackLocales.length && findMessage(_this2.fallbackLocales),
                            langs: _this2.langs
                        });
                    }
                    if (fallback !== false) {
                        return _this2.fallbackLocales.length && findMessage(_this2.fallbackLocales);
                    }
                    throw new Error('Message not found for locales ' + _this2.langs + (_this2.fallbackLanguages ? ' (with fallback languages ' + _this2.fallbackLanguages + ')' : '') + ' with key ' + key + ', namespace ' + namespace + ', and namespace separator ' + separator);
                }
                if (!values && !formats) {
                    return message;
                }
                var msg = new _this2.IntlMessageFormat(message, _this2.langs, formats);
                return msg.format(values);
            };
        }
    }, {
        key: 'loadLocales',
        value: function loadLocales(_ref3) {
            var cb = _ref3.cb,
                avoidSettingLocales = _ref3.avoidSettingLocales,
                _ref3$languages = _ref3.languages,
                languages = _ref3$languages === undefined ? navigator.language || 'en-US' : _ref3$languages;
            return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var locales, _locales;

                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!isArray(languages)) {
                                    languages = [languages];
                                }
                                if (!avoidSettingLocales) {
                                    this.langs = languages;
                                }
                                _context3.next = 4;
                                return getJSON(languages.map(this.localeFileResolver, this));

                            case 4:
                                locales = _context3.sent;

                                if (!avoidSettingLocales) {
                                    (_locales = this.locales).push.apply(_locales, toConsumableArray(locales));
                                }
                                if (cb) {
                                    cb.apply(this, locales);
                                }
                                return _context3.abrupt('return', locales);

                            case 8:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }).call(this));
        }
    }]);
    return IMF;
}();

function IMFFormatter(IMF, _ref4) {
    var options = _ref4.options;
    return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var imf, formattersAndLocales;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        imf = new IMF(options);
                        _context4.next = 3;
                        return imf.formattersAndLocales();

                    case 3:
                        formattersAndLocales = _context4.sent;
                        return _context4.abrupt('return', _extends({ imf: imf }, formattersAndLocales));

                    case 5:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    })());
}

export default IMF;
export { IMFFormatter, IMF };
