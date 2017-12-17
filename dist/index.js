(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.IMF = {})));
}(this, (function (exports) { 'use strict';

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

    var version = "3.0.1";

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

    var baseURL = typeof __dirname !== 'undefined' ? __dirname : function () {
        var src = document.currentScript && // May not be present if running from say console
        document.currentScript.src || location.href;
        return src.replace(/\/[^/]+\/?$/, '');
    }();
    var isArray = Array.isArray;

    // LOCALE LOADING
    // Needed to allow the non-modular scripts in `load` below to work
    // https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval
    var rollupSaferGlobalEval = eval; // eslint-disable-line no-eval

    var xor = function xor(a, b) {
        return !a !== !b;
    };

    var IMF = function () {
        function IMF() {
            var _this = this;

            var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            classCallCheck(this, IMF);

            if (xor(opts.languages, opts.locales)) {
                throw new TypeError('If languages or locales is supplied, the other must be also.');
            }
            if (xor(opts.fallbackLanguages, opts.fallbackLocales)) {
                throw new TypeError('If fallbackLanguages or fallbackLocales is supplied, the other must be also.');
            }
            Object.assign(this, {
                defaultNamespace: '',
                defaultSeparator: '.',
                basePath: 'locales/',
                avoidRuleLoading: false,
                languages: [],
                locales: [],
                fallbackLanguages: [],
                fallbackLocales: [],
                localeExtension: 'json',
                retriever: getJSON,
                localeFileResolver: function localeFileResolver(lang) {
                    return '' + _this.basePath + lang + (_this.localeExtension ? '.' + _this.localeExtension : '');
                }
            }, opts);
        }

        createClass(IMF, [{
            key: 'load',
            value: function load() {
                var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    languages = _ref.languages,
                    fallbackLanguages = _ref.fallbackLanguages,
                    defaultNamespace = _ref.defaultNamespace,
                    retriever = _ref.retriever,
                    _ref$avoidRuleLoading = _ref.avoidRuleLoading,
                    avoidRuleLoading = _ref$avoidRuleLoading === undefined ? this.avoidRuleLoading : _ref$avoidRuleLoading;

                return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                    var cache, promises, ret;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    if (!(!languages && !fallbackLanguages && !this.languages.length && !this.fallbackLanguages.length)) {
                                        _context2.next = 2;
                                        break;
                                    }

                                    throw new TypeError('`languages` or `fallbackLanguages` must be supplied to `load` if none are preexisting.');

                                case 2:
                                    if (!isArray(languages)) {
                                        languages = [languages];
                                    }
                                    _context2.next = 5;
                                    return caches.open('imf-' + version);

                                case 5:
                                    cache = _context2.sent;
                                    promises = [];

                                    if (!avoidRuleLoading) {
                                        // We could avoid relying on a global `IntlMessageFormat` with a
                                        //  user-supplied instance and local `eval`, but that is less
                                        //  safe, and this is a polyfill anyways

                                        // If expressed as a module (requested sync loading
                                        //   at https://github.com/yahoo/intl-messageformat/issues/174#issuecomment-350638974 )
                                        //   could use https://github.com/tc39/proposal-dynamic-import#example
                                        //   until dynamic imports may exist given that this should only
                                        //   be conditionally loaded.
                                        // The localized version defines plural rules (`pluralRuleFunction`) and
                                        //   parent languages (`parentLocale`)
                                        // We could alternatively do the `IntlMessageFormat.__addLocaleData()` calls ourselves
                                        promises.push.apply(promises, toConsumableArray([].concat(toConsumableArray(languages), toConsumableArray(fallbackLanguages)).map(function (language) {
                                            return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                                                var normalizedLanguage, baseLanguage, url, cachedRuleResp, ruleResp, langRulesJSText;
                                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                                    while (1) {
                                                        switch (_context.prev = _context.next) {
                                                            case 0:
                                                                normalizedLanguage = Intl.getCanonicalLocales(language)[0]; // Could use this: new IntlMessageFormat('', language).resolvedOptions().locale;

                                                                baseLanguage = normalizedLanguage.replace(/-.*$/, '');
                                                                url = new URL('./node_modules/intl-messageformat/dist/locale-data/' + baseLanguage + '.js', baseURL);
                                                                _context.next = 5;
                                                                return cache.match(new Request(url));

                                                            case 5:
                                                                cachedRuleResp = _context.sent;
                                                                ruleResp = void 0, langRulesJSText = void 0;
                                                                _context.prev = 7;
                                                                _context.t0 = cachedRuleResp;

                                                                if (_context.t0) {
                                                                    _context.next = 13;
                                                                    break;
                                                                }

                                                                _context.next = 12;
                                                                return fetch(url);

                                                            case 12:
                                                                _context.t0 = _context.sent;

                                                            case 13:
                                                                ruleResp = _context.t0;

                                                                if (ruleResp.ok) {
                                                                    _context.next = 16;
                                                                    break;
                                                                }

                                                                throw new Error('Response not OK');

                                                            case 16:
                                                                _context.next = 18;
                                                                return ruleResp.text();

                                                            case 18:
                                                                langRulesJSText = _context.sent;
                                                                _context.next = 25;
                                                                break;

                                                            case 21:
                                                                _context.prev = 21;
                                                                _context.t1 = _context['catch'](7);

                                                                // We report error but allow other languages to get processed
                                                                console.error('Localization rules for language ' + language + ' not found; erred with ' + _context.t1 + '; ignoring...');
                                                                return _context.abrupt('return');

                                                            case 25:
                                                                try {
                                                                    rollupSaferGlobalEval(langRulesJSText);
                                                                    if (!cachedRuleResp) cache.put(url, ruleResp);
                                                                } catch (err) {
                                                                    // We report error but allow other languages to get processed
                                                                    console.error('Error processing localization rules for language ' + language);
                                                                }

                                                            case 26:
                                                            case 'end':
                                                                return _context.stop();
                                                        }
                                                    }
                                                }, _callee, this, [[7, 21]]);
                                            })());
                                        })));
                                    }

                                    promises.unshift(this.loadLocales({ languages: languages, retriever: retriever }));
                                    if (fallbackLanguages) {
                                        promises.splice(1, 0, this.loadFallbackLocales({ fallbackLanguages: fallbackLanguages, retriever: retriever }));
                                    }
                                    _context2.next = 12;
                                    return Promise.all(promises);

                                case 12:
                                    ret = {
                                        _: this.namespacer({ defaultNamespace: defaultNamespace }),
                                        namespacer: this.namespacer.bind(this),
                                        locales: this.locales,
                                        fallbackLocales: this.fallbackLocales
                                    };
                                    // Add aliases

                                    ret.f = ret.l = ret._;
                                    return _context2.abrupt('return', ret);

                                case 15:
                                case 'end':
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, this);
                }).call(this));
            }
        }, {
            key: 'loadFallbackLocales',
            value: function loadFallbackLocales(_ref2) {
                var fallbackLanguages = _ref2.fallbackLanguages,
                    avoidSettingLocales = _ref2.avoidSettingLocales,
                    retriever = _ref2.retriever;
                return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                    var _fallbackLanguages, fallbackLocales, _fallbackLocales;

                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    if (!avoidSettingLocales) {
                                        (_fallbackLanguages = this.fallbackLanguages).push.apply(_fallbackLanguages, toConsumableArray(fallbackLanguages));
                                    }
                                    _context3.next = 3;
                                    return this.loadLocales({
                                        avoidSettingLocales: true,
                                        languages: fallbackLanguages,
                                        retriever: retriever
                                    });

                                case 3:
                                    fallbackLocales = _context3.sent;

                                    if (!avoidSettingLocales) {
                                        (_fallbackLocales = this.fallbackLocales).push.apply(_fallbackLocales, toConsumableArray(fallbackLocales));
                                    }
                                    return _context3.abrupt('return', fallbackLocales);

                                case 6:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, this);
                }).call(this));
            }
        }, {
            key: 'loadLocales',
            value: function loadLocales(_ref3) {
                var avoidSettingLocales = _ref3.avoidSettingLocales,
                    _ref3$retriever = _ref3.retriever,
                    retriever = _ref3$retriever === undefined ? getJSON : _ref3$retriever,
                    _ref3$languages = _ref3.languages,
                    languages = _ref3$languages === undefined ? navigator.languages ? navigator.languages[0] : navigator.language || navigator.userLanguage || 'en-US' : _ref3$languages;
                return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                    var _this2 = this;

                    var _languages, locales, _locales;

                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                        while (1) {
                            switch (_context5.prev = _context5.next) {
                                case 0:
                                    if (!isArray(languages)) {
                                        languages = [languages];
                                    }
                                    if (!avoidSettingLocales) {
                                        (_languages = this.languages).push.apply(_languages, toConsumableArray(languages));
                                    }
                                    _context5.next = 4;
                                    return Promise.all( // Though getJSON can handle arrays, we don't assume all retrievers can (and we also want a language-specific error message)
                                    languages.map(function (language) {
                                        return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                                            var url, cachedLocale;
                                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                                while (1) {
                                                    switch (_context4.prev = _context4.next) {
                                                        case 0:
                                                            url = new URL('' + language);
                                                            cachedLocale = JSON.parse(localStorage.getItem(url));
                                                            _context4.prev = 2;
                                                            return _context4.abrupt('return', cachedLocale || retriever(this.localeFileResolver(language)));

                                                        case 6:
                                                            _context4.prev = 6;
                                                            _context4.t0 = _context4['catch'](2);

                                                            // We only warn as this could be intentionally deferring to parent
                                                            console.warn('Locale could not be found for ' + language + '; erred with ' + _context4.t0);

                                                            // Normal rule: ca-ES-VALENCIA -> ca-ES; zh-Hans -> zh
                                                            // Exceptions:
                                                            //      pt-AO -> pt-PT
                                                            //      en-150 -> en-001
                                                            //      es-AR -> es-419
                                                            //      es-BO -> es-419
                                                            // See also https://github.com/tc39/ecma402/issues/46#issuecomment-351260753 and links
                                                            // See also macrolanguages from https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry

                                                            // For future `Intl.getParentLocales`: https://github.com/tc39/ecma402/issues/87
                                                            // Todo: If not present, check for parent locale(s) of `language`
                                                            // IntlMessageFormat.__localeData__[locale.toLowerCase()].parentLocale
                                                            // IntlMessageFormat.__localeData__['zh-hans'].parentLocale

                                                            // Todo: look for sister locales if locale and parent (or grandparents) not present? https://github.com/tc39/ecma402/issues/87#issuecomment-352971275

                                                            /*
                                                            1. Todo: Change to real tests and also include actual formatting examples!
                                                                1. `getJSON` catch to capture thrown object with file property
                                                                    indicating the file causing the error
                                                            */

                                                        case 9:
                                                        case 'end':
                                                            return _context4.stop();
                                                    }
                                                }
                                            }, _callee4, this, [[2, 6]]);
                                        }).call(_this2));
                                    }));

                                case 4:
                                    _context5.t0 = Boolean;
                                    locales = _context5.sent.filter(_context5.t0);

                                    if (!avoidSettingLocales) {
                                        (_locales = this.locales).push.apply(_locales, toConsumableArray(locales));
                                    }
                                    return _context5.abrupt('return', locales);

                                case 8:
                                case 'end':
                                    return _context5.stop();
                            }
                        }
                    }, _callee5, this);
                }).call(this));
            }
        }, {
            key: 'namespacer',
            value: function namespacer(_ref4) {
                var _this3 = this;

                var _ref4$namespace = _ref4.namespace,
                    defaultNamespace = _ref4$namespace === undefined ? this.defaultNamespace : _ref4$namespace,
                    _ref4$separator = _ref4.separator,
                    separator = _ref4$separator === undefined ? this.defaultSeparator : _ref4$separator;

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
                        key = _key.key;
                        values = _key.values;
                        formats = _key.formats;
                        fallback = _key.fallback;
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
                    if (!key) {
                        throw new TypeError('A key must be supplied to a localizer/namespacer function');
                    }
                    function findMessage(locales) {
                        locales.some(function (locale) {
                            message = locale[(namespace ? namespace + separator : '') + key] || messageForNSParts(locale, namespace, separator, key);
                            return message;
                        });
                        return message;
                    }
                    findMessage(_this3.locales);
                    if (!message) {
                        if (typeof fallback === 'function') {
                            return fallback({
                                namespace: namespace, separator: separator, key: key, values: values, formats: formats, // eslint-disable-line object-property-newline
                                message: _this3.fallbackLocales.length && findMessage(_this3.fallbackLocales),
                                languages: _this3.languages,
                                fallbackLanguages: _this3.fallbackLanguages
                            });
                        }
                        if (fallback === false || !_this3.fallbackLocales.length) {
                            throw new Error('Message not found for locales ' + _this3.languages + (_this3.fallbackLanguages ? ' (with fallback languages ' + _this3.fallbackLanguages + ')' : '') + (' with key ' + key + ', namespace ' + namespace) + (', and namespace separator ' + separator));
                        }
                        message = findMessage(_this3.fallbackLocales);
                    }
                    if (!values && !formats) {
                        return message;
                    }
                    _this3.intlMessageFormat = new IntlMessageFormat(message, _this3.languages, formats);
                    return _this3.intlMessageFormat.format(values);
                };
            }
        }]);
        return IMF;
    }();

    function imf(IMF, _ref5) {
        var options = _ref5.options;
        return __async( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
            var imfInstance, formatterNamespacerAndLocales;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            imfInstance = new IMF(options);
                            _context6.next = 3;
                            return imfInstance.load(options);

                        case 3:
                            formatterNamespacerAndLocales = _context6.sent;
                            return _context6.abrupt('return', _extends({ imfInstance: imfInstance }, formatterNamespacerAndLocales));

                        case 5:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        })());
    }

    exports.IMF = IMF;
    exports.imf = imf;
    exports.default = imf;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
