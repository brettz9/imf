/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/* global Reflect, Promise */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};

  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}
var __createBinding = Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function () {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
};
function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
}
/** @deprecated */

function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));

  return ar;
}
/** @deprecated */

function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
}
function __spreadArray(to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];

  return to;
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []),
      i,
      q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i;

  function verb(n) {
    if (g[n]) i[n] = function (v) {
      return new Promise(function (a, b) {
        q.push([n, v, a, b]) > 1 || resume(n, v);
      });
    };
  }

  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }

  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }

  function fulfill(value) {
    resume("next", value);
  }

  function reject(value) {
    resume("throw", value);
  }

  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) {
    throw e;
  }), verb("return"), i[Symbol.iterator] = function () {
    return this;
  }, i;

  function verb(n, f) {
    i[n] = o[n] ? function (v) {
      return (p = !p) ? {
        value: __await(o[n](v)),
        done: n === "return"
      } : f ? f(v) : v;
    } : f;
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator],
      i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () {
    return this;
  }, i);

  function verb(n) {
    i[n] = o[n] && function (v) {
      return new Promise(function (resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }

  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function (v) {
      resolve({
        value: v,
        done: d
      });
    }, reject);
  }
}
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", {
      value: raw
    });
  } else {
    cooked.raw = raw;
  }

  return cooked;
}

var __setModuleDefault = Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);

  __setModuleDefault(result, mod);

  return result;
}
function __importDefault(mod) {
  return mod && mod.__esModule ? mod : {
    default: mod
  };
}
function __classPrivateFieldGet(receiver, privateMap) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }

  return privateMap.get(receiver);
}
function __classPrivateFieldSet(receiver, privateMap, value) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to set private field on non-instance");
  }

  privateMap.set(receiver, value);
  return value;
}

var tslib_es6 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __extends: __extends,
    get __assign () { return __assign; },
    __rest: __rest,
    __decorate: __decorate,
    __param: __param,
    __metadata: __metadata,
    __awaiter: __awaiter,
    __generator: __generator,
    __createBinding: __createBinding,
    __exportStar: __exportStar,
    __values: __values,
    __read: __read,
    __spread: __spread,
    __spreadArrays: __spreadArrays,
    __spreadArray: __spreadArray,
    __await: __await,
    __asyncGenerator: __asyncGenerator,
    __asyncDelegator: __asyncDelegator,
    __asyncValues: __asyncValues,
    __makeTemplateObject: __makeTemplateObject,
    __importStar: __importStar,
    __importDefault: __importDefault,
    __classPrivateFieldGet: __classPrivateFieldGet,
    __classPrivateFieldSet: __classPrivateFieldSet
});

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var error = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorKind = void 0;

(function (ErrorKind) {
  /** Argument is unclosed (e.g. `{0`) */
  ErrorKind[ErrorKind["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
  /** Argument is empty (e.g. `{}`). */

  ErrorKind[ErrorKind["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
  /** Argument is malformed (e.g. `{foo!}``) */

  ErrorKind[ErrorKind["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
  /** Expect an argument type (e.g. `{foo,}`) */

  ErrorKind[ErrorKind["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
  /** Unsupported argument type (e.g. `{foo,foo}`) */

  ErrorKind[ErrorKind["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
  /** Expect an argument style (e.g. `{foo, number, }`) */

  ErrorKind[ErrorKind["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
  /** The number skeleton is invalid. */

  ErrorKind[ErrorKind["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
  /** The date time skeleton is invalid. */

  ErrorKind[ErrorKind["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
  /** Exepct a number skeleton following the `::` (e.g. `{foo, number, ::}`) */

  ErrorKind[ErrorKind["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
  /** Exepct a date time skeleton following the `::` (e.g. `{foo, date, ::}`) */

  ErrorKind[ErrorKind["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
  /** Unmatched apostrophes in the argument style (e.g. `{foo, number, 'test`) */

  ErrorKind[ErrorKind["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
  /** Missing select argument options (e.g. `{foo, select}`) */

  ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
  /** Expecting an offset value in `plural` or `selectordinal` argument (e.g `{foo, plural, offset}`) */

  ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
  /** Offset value in `plural` or `selectordinal` is invalid (e.g. `{foo, plural, offset: x}`) */

  ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
  /** Expecting a selector in `select` argument (e.g `{foo, select}`) */

  ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
  /** Expecting a selector in `plural` or `selectordinal` argument (e.g `{foo, plural}`) */

  ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
  /** Expecting a message fragment after the `select` selector (e.g. `{foo, select, apple}`) */

  ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
  /**
   * Expecting a message fragment after the `plural` or `selectordinal` selector
   * (e.g. `{foo, plural, one}`)
   */

  ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
  /** Selector in `plural` or `selectordinal` is malformed (e.g. `{foo, plural, =x {#}}`) */

  ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
  /**
   * Duplicate selectors in `plural` or `selectordinal` argument.
   * (e.g. {foo, plural, one {#} one {#}})
   */

  ErrorKind[ErrorKind["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
  /** Duplicate selectors in `select` argument.
   * (e.g. {foo, select, apple {apple} apple {apple}})
   */

  ErrorKind[ErrorKind["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
  /** Plural or select argument option must have `other` clause. */

  ErrorKind[ErrorKind["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
  /** The tag is malformed. (e.g. `<bold!>foo</bold!>) */

  ErrorKind[ErrorKind["INVALID_TAG"] = 23] = "INVALID_TAG";
  /** The tag name is invalid. (e.g. `<123>foo</123>`) */

  ErrorKind[ErrorKind["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
  /** The closing tag does not match the opening tag. (e.g. `<bold>foo</italic>`) */

  ErrorKind[ErrorKind["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
  /** The opening tag has unmatched closing tag. (e.g. `<bold>foo`) */

  ErrorKind[ErrorKind["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
})(exports.ErrorKind || (exports.ErrorKind = {}));
});

var types = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNumberElement = exports.createLiteralElement = exports.isDateTimeSkeleton = exports.isNumberSkeleton = exports.isTagElement = exports.isPoundElement = exports.isPluralElement = exports.isSelectElement = exports.isTimeElement = exports.isDateElement = exports.isNumberElement = exports.isArgumentElement = exports.isLiteralElement = exports.SKELETON_TYPE = exports.TYPE = void 0;
var TYPE;

(function (TYPE) {
  /**
   * Raw text
   */
  TYPE[TYPE["literal"] = 0] = "literal";
  /**
   * Variable w/o any format, e.g `var` in `this is a {var}`
   */

  TYPE[TYPE["argument"] = 1] = "argument";
  /**
   * Variable w/ number format
   */

  TYPE[TYPE["number"] = 2] = "number";
  /**
   * Variable w/ date format
   */

  TYPE[TYPE["date"] = 3] = "date";
  /**
   * Variable w/ time format
   */

  TYPE[TYPE["time"] = 4] = "time";
  /**
   * Variable w/ select format
   */

  TYPE[TYPE["select"] = 5] = "select";
  /**
   * Variable w/ plural format
   */

  TYPE[TYPE["plural"] = 6] = "plural";
  /**
   * Only possible within plural argument.
   * This is the `#` symbol that will be substituted with the count.
   */

  TYPE[TYPE["pound"] = 7] = "pound";
  /**
   * XML-like tag
   */

  TYPE[TYPE["tag"] = 8] = "tag";
})(TYPE = exports.TYPE || (exports.TYPE = {}));

var SKELETON_TYPE;

(function (SKELETON_TYPE) {
  SKELETON_TYPE[SKELETON_TYPE["number"] = 0] = "number";
  SKELETON_TYPE[SKELETON_TYPE["dateTime"] = 1] = "dateTime";
})(SKELETON_TYPE = exports.SKELETON_TYPE || (exports.SKELETON_TYPE = {}));
/**
 * Type Guards
 */


function isLiteralElement(el) {
  return el.type === TYPE.literal;
}

exports.isLiteralElement = isLiteralElement;

function isArgumentElement(el) {
  return el.type === TYPE.argument;
}

exports.isArgumentElement = isArgumentElement;

function isNumberElement(el) {
  return el.type === TYPE.number;
}

exports.isNumberElement = isNumberElement;

function isDateElement(el) {
  return el.type === TYPE.date;
}

exports.isDateElement = isDateElement;

function isTimeElement(el) {
  return el.type === TYPE.time;
}

exports.isTimeElement = isTimeElement;

function isSelectElement(el) {
  return el.type === TYPE.select;
}

exports.isSelectElement = isSelectElement;

function isPluralElement(el) {
  return el.type === TYPE.plural;
}

exports.isPluralElement = isPluralElement;

function isPoundElement(el) {
  return el.type === TYPE.pound;
}

exports.isPoundElement = isPoundElement;

function isTagElement(el) {
  return el.type === TYPE.tag;
}

exports.isTagElement = isTagElement;

function isNumberSkeleton(el) {
  return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.number);
}

exports.isNumberSkeleton = isNumberSkeleton;

function isDateTimeSkeleton(el) {
  return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.dateTime);
}

exports.isDateTimeSkeleton = isDateTimeSkeleton;

function createLiteralElement(value) {
  return {
    type: TYPE.literal,
    value: value
  };
}

exports.createLiteralElement = createLiteralElement;

function createNumberElement(value, style) {
  return {
    type: TYPE.number,
    value: value,
    style: style
  };
}

exports.createNumberElement = createNumberElement;
});

var regex_generated$1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WHITE_SPACE_REGEX = exports.SPACE_SEPARATOR_END_REGEX = exports.SPACE_SEPARATOR_START_REGEX = void 0; // @generated from regex-gen.ts

exports.SPACE_SEPARATOR_START_REGEX = /^[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]*/i;
exports.SPACE_SEPARATOR_END_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]*$/i;
exports.WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
});

var dateTime = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseDateTimeSkeleton = void 0;
/**
 * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
 * with some tweaks
 */

var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
/**
 * Parse Date time skeleton into Intl.DateTimeFormatOptions
 * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * @public
 * @param skeleton skeleton string
 */

function parseDateTimeSkeleton(skeleton) {
  var result = {};
  skeleton.replace(DATE_TIME_REGEX, function (match) {
    var len = match.length;

    switch (match[0]) {
      // Era
      case 'G':
        result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
        break;
      // Year

      case 'y':
        result.year = len === 2 ? '2-digit' : 'numeric';
        break;

      case 'Y':
      case 'u':
      case 'U':
      case 'r':
        throw new RangeError('`Y/u/U/r` (year) patterns are not supported, use `y` instead');
      // Quarter

      case 'q':
      case 'Q':
        throw new RangeError('`q/Q` (quarter) patterns are not supported');
      // Month

      case 'M':
      case 'L':
        result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
        break;
      // Week

      case 'w':
      case 'W':
        throw new RangeError('`w/W` (week) patterns are not supported');

      case 'd':
        result.day = ['numeric', '2-digit'][len - 1];
        break;

      case 'D':
      case 'F':
      case 'g':
        throw new RangeError('`D/F/g` (day) patterns are not supported, use `d` instead');
      // Weekday

      case 'E':
        result.weekday = len === 4 ? 'short' : len === 5 ? 'narrow' : 'short';
        break;

      case 'e':
        if (len < 4) {
          throw new RangeError('`e..eee` (weekday) patterns are not supported');
        }

        result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
        break;

      case 'c':
        if (len < 4) {
          throw new RangeError('`c..ccc` (weekday) patterns are not supported');
        }

        result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
        break;
      // Period

      case 'a':
        // AM, PM
        result.hour12 = true;
        break;

      case 'b': // am, pm, noon, midnight

      case 'B':
        // flexible day periods
        throw new RangeError('`b/B` (period) patterns are not supported, use `a` instead');
      // Hour

      case 'h':
        result.hourCycle = 'h12';
        result.hour = ['numeric', '2-digit'][len - 1];
        break;

      case 'H':
        result.hourCycle = 'h23';
        result.hour = ['numeric', '2-digit'][len - 1];
        break;

      case 'K':
        result.hourCycle = 'h11';
        result.hour = ['numeric', '2-digit'][len - 1];
        break;

      case 'k':
        result.hourCycle = 'h24';
        result.hour = ['numeric', '2-digit'][len - 1];
        break;

      case 'j':
      case 'J':
      case 'C':
        throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
      // Minute

      case 'm':
        result.minute = ['numeric', '2-digit'][len - 1];
        break;
      // Second

      case 's':
        result.second = ['numeric', '2-digit'][len - 1];
        break;

      case 'S':
      case 'A':
        throw new RangeError('`S/A` (second) patterns are not supported, use `s` instead');
      // Zone

      case 'z':
        // 1..3, 4: specific non-location format
        result.timeZoneName = len < 4 ? 'short' : 'long';
        break;

      case 'Z': // 1..3, 4, 5: The ISO8601 varios formats

      case 'O': // 1, 4: miliseconds in day short, long

      case 'v': // 1, 4: generic non-location format

      case 'V': // 1, 2, 3, 4: time zone ID or city

      case 'X': // 1, 2, 3, 4: The ISO8601 varios formats

      case 'x':
        // 1, 2, 3, 4: The ISO8601 varios formats
        throw new RangeError('`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead');
    }

    return '';
  });
  return result;
}

exports.parseDateTimeSkeleton = parseDateTimeSkeleton;
});

var regex_generated = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WHITE_SPACE_REGEX = void 0; // @generated from regex-gen.ts

exports.WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
});

var tslib_1 = /*@__PURE__*/getAugmentedNamespace(tslib_es6);

var number = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseNumberSkeleton = exports.parseNumberSkeletonFromString = void 0;





function parseNumberSkeletonFromString(skeleton) {
  if (skeleton.length === 0) {
    throw new Error('Number skeleton cannot be empty');
  } // Parse the skeleton


  var stringTokens = skeleton.split(regex_generated.WHITE_SPACE_REGEX).filter(function (x) {
    return x.length > 0;
  });
  var tokens = [];

  for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
    var stringToken = stringTokens_1[_i];
    var stemAndOptions = stringToken.split('/');

    if (stemAndOptions.length === 0) {
      throw new Error('Invalid number skeleton');
    }

    var stem = stemAndOptions[0],
        options = stemAndOptions.slice(1);

    for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
      var option = options_1[_a];

      if (option.length === 0) {
        throw new Error('Invalid number skeleton');
      }
    }

    tokens.push({
      stem: stem,
      options: options
    });
  }

  return tokens;
}

exports.parseNumberSkeletonFromString = parseNumberSkeletonFromString;

function icuUnitToEcma(unit) {
  return unit.replace(/^(.*?)-/, '');
}

var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?$/g;
var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;

function parseSignificantPrecision(str) {
  var result = {};
  str.replace(SIGNIFICANT_PRECISION_REGEX, function (_, g1, g2) {
    // @@@ case
    if (typeof g2 !== 'string') {
      result.minimumSignificantDigits = g1.length;
      result.maximumSignificantDigits = g1.length;
    } // @@@+ case
    else if (g2 === '+') {
        result.minimumSignificantDigits = g1.length;
      } // .### case
      else if (g1[0] === '#') {
          result.maximumSignificantDigits = g1.length;
        } // .@@## or .@@@ case
        else {
            result.minimumSignificantDigits = g1.length;
            result.maximumSignificantDigits = g1.length + (typeof g2 === 'string' ? g2.length : 0);
          }

    return '';
  });
  return result;
}

function parseSign(str) {
  switch (str) {
    case 'sign-auto':
      return {
        signDisplay: 'auto'
      };

    case 'sign-accounting':
    case '()':
      return {
        currencySign: 'accounting'
      };

    case 'sign-always':
    case '+!':
      return {
        signDisplay: 'always'
      };

    case 'sign-accounting-always':
    case '()!':
      return {
        signDisplay: 'always',
        currencySign: 'accounting'
      };

    case 'sign-except-zero':
    case '+?':
      return {
        signDisplay: 'exceptZero'
      };

    case 'sign-accounting-except-zero':
    case '()?':
      return {
        signDisplay: 'exceptZero',
        currencySign: 'accounting'
      };

    case 'sign-never':
    case '+_':
      return {
        signDisplay: 'never'
      };
  }
}

function parseConciseScientificAndEngineeringStem(stem) {
  // Engineering
  var result;

  if (stem[0] === 'E' && stem[1] === 'E') {
    result = {
      notation: 'engineering'
    };
    stem = stem.slice(2);
  } else if (stem[0] === 'E') {
    result = {
      notation: 'scientific'
    };
    stem = stem.slice(1);
  }

  if (result) {
    var signDisplay = stem.slice(0, 2);

    if (signDisplay === '+!') {
      result.signDisplay = 'always';
      stem = stem.slice(2);
    } else if (signDisplay === '+?') {
      result.signDisplay = 'exceptZero';
      stem = stem.slice(2);
    }

    if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
      throw new Error('Malformed concise eng/scientific notation');
    }

    result.minimumIntegerDigits = stem.length;
  }

  return result;
}

function parseNotationOptions(opt) {
  var result = {};
  var signOpts = parseSign(opt);

  if (signOpts) {
    return signOpts;
  }

  return result;
}
/**
 * https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md#skeleton-stems-and-options
 */


function parseNumberSkeleton(tokens) {
  var result = {};

  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];

    switch (token.stem) {
      case 'percent':
      case '%':
        result.style = 'percent';
        continue;

      case '%x100':
        result.style = 'percent';
        result.scale = 100;
        continue;

      case 'currency':
        result.style = 'currency';
        result.currency = token.options[0];
        continue;

      case 'group-off':
      case ',_':
        result.useGrouping = false;
        continue;

      case 'precision-integer':
      case '.':
        result.maximumFractionDigits = 0;
        continue;

      case 'measure-unit':
      case 'unit':
        result.style = 'unit';
        result.unit = icuUnitToEcma(token.options[0]);
        continue;

      case 'compact-short':
      case 'K':
        result.notation = 'compact';
        result.compactDisplay = 'short';
        continue;

      case 'compact-long':
      case 'KK':
        result.notation = 'compact';
        result.compactDisplay = 'long';
        continue;

      case 'scientific':
        result = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, result), {
          notation: 'scientific'
        }), token.options.reduce(function (all, opt) {
          return tslib_1.__assign(tslib_1.__assign({}, all), parseNotationOptions(opt));
        }, {}));
        continue;

      case 'engineering':
        result = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, result), {
          notation: 'engineering'
        }), token.options.reduce(function (all, opt) {
          return tslib_1.__assign(tslib_1.__assign({}, all), parseNotationOptions(opt));
        }, {}));
        continue;

      case 'notation-simple':
        result.notation = 'standard';
        continue;
      // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h

      case 'unit-width-narrow':
        result.currencyDisplay = 'narrowSymbol';
        result.unitDisplay = 'narrow';
        continue;

      case 'unit-width-short':
        result.currencyDisplay = 'code';
        result.unitDisplay = 'short';
        continue;

      case 'unit-width-full-name':
        result.currencyDisplay = 'name';
        result.unitDisplay = 'long';
        continue;

      case 'unit-width-iso-code':
        result.currencyDisplay = 'symbol';
        continue;

      case 'scale':
        result.scale = parseFloat(token.options[0]);
        continue;
      // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width

      case 'integer-width':
        if (token.options.length > 1) {
          throw new RangeError('integer-width stems only accept a single optional option');
        }

        token.options[0].replace(INTEGER_WIDTH_REGEX, function (_, g1, g2, g3, g4, g5) {
          if (g1) {
            result.minimumIntegerDigits = g2.length;
          } else if (g3 && g4) {
            throw new Error('We currently do not support maximum integer digits');
          } else if (g5) {
            throw new Error('We currently do not support exact integer digits');
          }

          return '';
        });
        continue;
    } // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width


    if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
      result.minimumIntegerDigits = token.stem.length;
      continue;
    }

    if (FRACTION_PRECISION_REGEX.test(token.stem)) {
      // Precision
      // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#fraction-precision
      // precision-integer case
      if (token.options.length > 1) {
        throw new RangeError('Fraction-precision stems only accept a single optional option');
      }

      token.stem.replace(FRACTION_PRECISION_REGEX, function (_, g1, g2, g3, g4, g5) {
        // .000* case (before ICU67 it was .000+)
        if (g2 === '*') {
          result.minimumFractionDigits = g1.length;
        } // .### case
        else if (g3 && g3[0] === '#') {
            result.maximumFractionDigits = g3.length;
          } // .00## case
          else if (g4 && g5) {
              result.minimumFractionDigits = g4.length;
              result.maximumFractionDigits = g4.length + g5.length;
            } else {
              result.minimumFractionDigits = g1.length;
              result.maximumFractionDigits = g1.length;
            }

        return '';
      });

      if (token.options.length) {
        result = tslib_1.__assign(tslib_1.__assign({}, result), parseSignificantPrecision(token.options[0]));
      }

      continue;
    } // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#significant-digits-precision


    if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
      result = tslib_1.__assign(tslib_1.__assign({}, result), parseSignificantPrecision(token.stem));
      continue;
    }

    var signOpts = parseSign(token.stem);

    if (signOpts) {
      result = tslib_1.__assign(tslib_1.__assign({}, result), signOpts);
    }

    var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);

    if (conciseScientificAndEngineeringOpts) {
      result = tslib_1.__assign(tslib_1.__assign({}, result), conciseScientificAndEngineeringOpts);
    }
  }

  return result;
}

exports.parseNumberSkeleton = parseNumberSkeleton;
});

var icuSkeletonParser = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});



tslib_1.__exportStar(dateTime, exports);

tslib_1.__exportStar(number, exports);
});

var parser = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Parser = void 0;











function createLocation(start, end) {
  return {
    start: start,
    end: end
  };
} // #region Ponyfills
// Consolidate these variables up top for easier toggling during debugging


var hasNativeStartsWith = !!String.prototype.startsWith;
var hasNativeFromCodePoint = !!String.fromCodePoint;
var hasNativeFromEntries = !!Object.fromEntries;
var hasNativeCodePointAt = !!String.prototype.codePointAt;
var hasTrimStart = !!String.prototype.trimStart;
var hasTrimEnd = !!String.prototype.trimEnd;
var hasNativeIsSafeInteger = !!Number.isSafeInteger;
var isSafeInteger = hasNativeIsSafeInteger ? Number.isSafeInteger : function (n) {
  return typeof n === 'number' && isFinite(n) && Math.floor(n) === n && Math.abs(n) <= 0x1fffffffffffff;
}; // IE11 does not support y and u.

var REGEX_SUPPORTS_U_AND_Y = true;

try {
  RE('', 'yu');
} catch (_) {
  REGEX_SUPPORTS_U_AND_Y = false;
}

var startsWith = hasNativeStartsWith ? // Native
function startsWith(s, search, position) {
  return s.startsWith(search, position);
} : // For IE11
function startsWith(s, search, position) {
  return s.slice(position, position + search.length) === search;
};
var fromCodePoint = hasNativeFromCodePoint ? String.fromCodePoint : // IE11
function fromCodePoint() {
  var codePoints = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    codePoints[_i] = arguments[_i];
  }

  var elements = '';
  var length = codePoints.length;
  var i = 0;
  var code;

  while (length > i) {
    code = codePoints[i++];
    if (code > 0x10ffff) throw RangeError(code + ' is not a valid code point');
    elements += code < 0x10000 ? String.fromCharCode(code) : String.fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00);
  }

  return elements;
};
var fromEntries = // native
hasNativeFromEntries ? Object.fromEntries : // Ponyfill
function fromEntries(entries) {
  var obj = {};

  for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
    var _a = entries_1[_i],
        k = _a[0],
        v = _a[1];
    obj[k] = v;
  }

  return obj;
};
var codePointAt = hasNativeCodePointAt ? // Native
function codePointAt(s, index) {
  return s.codePointAt(index);
} : // IE 11
function codePointAt(s, index) {
  var size = s.length;

  if (index < 0 || index >= size) {
    return undefined;
  }

  var first = s.charCodeAt(index);
  var second;
  return first < 0xd800 || first > 0xdbff || index + 1 === size || (second = s.charCodeAt(index + 1)) < 0xdc00 || second > 0xdfff ? first : (first - 0xd800 << 10) + (second - 0xdc00) + 0x10000;
};
var trimStart = hasTrimStart ? // Native
function trimStart(s) {
  return s.trimStart();
} : // Ponyfill
function trimStart(s) {
  return s.replace(regex_generated$1.SPACE_SEPARATOR_START_REGEX, '');
};
var trimEnd = hasTrimEnd ? // Native
function trimEnd(s) {
  return s.trimEnd();
} : // Ponyfill
function trimEnd(s) {
  return s.replace(regex_generated$1.SPACE_SEPARATOR_END_REGEX, '');
}; // Prevent minifier to translate new RegExp to literal form that might cause syntax error on IE11.

function RE(s, flag) {
  return new RegExp(s, flag);
} // #endregion


var matchIdentifierAtIndex;

if (REGEX_SUPPORTS_U_AND_Y) {
  // Native
  var IDENTIFIER_PREFIX_RE_1 = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');

  matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
    var _a;

    IDENTIFIER_PREFIX_RE_1.lastIndex = index;
    var match = IDENTIFIER_PREFIX_RE_1.exec(s);
    return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
  };
} else {
  // IE11
  matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
    var match = [];

    while (true) {
      var c = codePointAt(s, index);

      if (c === undefined || _isWhiteSpace(c) || _isPatternSyntax(c)) {
        break;
      }

      match.push(c);
      index += c >= 0x10000 ? 2 : 1;
    }

    return fromCodePoint.apply(void 0, match);
  };
}

var Parser =
/** @class */
function () {
  function Parser(message, options) {
    if (options === void 0) {
      options = {};
    }

    this.message = message;
    this.position = {
      offset: 0,
      line: 1,
      column: 1
    };
    this.ignoreTag = !!options.ignoreTag;
    this.requiresOtherClause = !!options.requiresOtherClause;
    this.shouldParseSkeletons = !!options.shouldParseSkeletons;
  }

  Parser.prototype.parse = function () {
    if (this.offset() !== 0) {
      throw Error('parser can only be used once');
    }

    return this.parseMessage(0, '', false);
  };

  Parser.prototype.parseMessage = function (nestingLevel, parentArgType, expectingCloseTag) {
    var elements = [];

    while (!this.isEOF()) {
      var char = this.char();

      if (char === 123
      /* `{` */
      ) {
          var result = this.parseArgument(nestingLevel, expectingCloseTag);

          if (result.err) {
            return result;
          }

          elements.push(result.val);
        } else if (char === 125
      /* `}` */
      && nestingLevel > 0) {
        break;
      } else if (char === 35
      /* `#` */
      && (parentArgType === 'plural' || parentArgType === 'selectordinal')) {
        var position = this.clonePosition();
        this.bump();
        elements.push({
          type: types.TYPE.pound,
          location: createLocation(position, this.clonePosition())
        });
      } else if (char === 60
      /* `<` */
      && !this.ignoreTag && this.peek() === 47 // char code for '/'
      ) {
          if (expectingCloseTag) {
            break;
          } else {
            return this.error(error.ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
          }
        } else if (char === 60
      /* `<` */
      && !this.ignoreTag && _isAlpha(this.peek() || 0)) {
        var result = this.parseTag(nestingLevel, parentArgType);

        if (result.err) {
          return result;
        }

        elements.push(result.val);
      } else {
        var result = this.parseLiteral(nestingLevel, parentArgType);

        if (result.err) {
          return result;
        }

        elements.push(result.val);
      }
    }

    return {
      val: elements,
      err: null
    };
  };
  /**
   * A tag name must start with an ASCII lower case letter. The grammar is based on the
   * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
   * are accepted:
   *
   * ```
   * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
   * tagName ::= [a-z] (PENChar)*
   * PENChar ::=
   *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
   *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
   *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
   * ```
   *
   * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
   */


  Parser.prototype.parseTag = function (nestingLevel, parentArgType) {
    var startPosition = this.clonePosition();
    this.bump(); // `<`

    var tagName = this.parseTagName();
    this.bumpSpace();

    if (this.bumpIf('/>')) {
      // Self closing tag
      return {
        val: {
          type: types.TYPE.literal,
          value: "<" + tagName + "/>",
          location: createLocation(startPosition, this.clonePosition())
        },
        err: null
      };
    } else if (this.bumpIf('>')) {
      var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);

      if (childrenResult.err) {
        return childrenResult;
      }

      var children = childrenResult.val; // Expecting a close tag

      var endTagStartPosition = this.clonePosition();

      if (this.bumpIf('</')) {
        if (this.isEOF() || !_isAlpha(this.char())) {
          return this.error(error.ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
        }

        var closingTagNameStartPosition = this.clonePosition();
        var closingTagName = this.parseTagName();

        if (tagName !== closingTagName) {
          return this.error(error.ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
        }

        this.bumpSpace();

        if (!this.bumpIf('>')) {
          return this.error(error.ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
        }

        return {
          val: {
            type: types.TYPE.tag,
            value: tagName,
            children: children,
            location: createLocation(startPosition, this.clonePosition())
          },
          err: null
        };
      } else {
        return this.error(error.ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
      }
    } else {
      return this.error(error.ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
    }
  };
  /**
   * This method assumes that the caller has peeked ahead for the first tag character.
   */


  Parser.prototype.parseTagName = function () {
    var startOffset = this.offset();
    this.bump(); // the first tag name character

    while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
      this.bump();
    }

    return this.message.slice(startOffset, this.offset());
  };

  Parser.prototype.parseLiteral = function (nestingLevel, parentArgType) {
    var start = this.clonePosition();
    var value = '';

    while (true) {
      var parseQuoteResult = this.tryParseQuote(parentArgType);

      if (parseQuoteResult) {
        value += parseQuoteResult;
        continue;
      }

      var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);

      if (parseUnquotedResult) {
        value += parseUnquotedResult;
        continue;
      }

      var parseLeftAngleResult = this.tryParseLeftAngleBracket();

      if (parseLeftAngleResult) {
        value += parseLeftAngleResult;
        continue;
      }

      break;
    }

    var location = createLocation(start, this.clonePosition());
    return {
      val: {
        type: types.TYPE.literal,
        value: value,
        location: location
      },
      err: null
    };
  };

  Parser.prototype.tryParseLeftAngleBracket = function () {
    if (!this.isEOF() && this.char() === 60
    /* `<` */
    && (this.ignoreTag || // If at the opening tag or closing tag position, bail.
    !_isAlphaOrSlash(this.peek() || 0))) {
      this.bump(); // `<`

      return '<';
    }

    return null;
  };
  /**
   * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
   * a character that requires quoting (that is, "only where needed"), and works the same in
   * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
   */


  Parser.prototype.tryParseQuote = function (parentArgType) {
    if (this.isEOF() || this.char() !== 39
    /* `'` */
    ) {
        return null;
      } // Parse escaped char following the apostrophe, or early return if there is no escaped char.
    // Check if is valid escaped character


    switch (this.peek()) {
      case 39
      /* `'` */
      :
        // double quote, should return as a single quote.
        this.bump();
        this.bump();
        return "'";
      // '{', '<', '>', '}'

      case 123:
      case 60:
      case 62:
      case 125:
        break;

      case 35:
        // '#'
        if (parentArgType === 'plural' || parentArgType === 'selectordinal') {
          break;
        }

        return null;

      default:
        return null;
    }

    this.bump(); // apostrophe

    var codePoints = [this.char()]; // escaped char

    this.bump(); // read chars until the optional closing apostrophe is found

    while (!this.isEOF()) {
      var ch = this.char();

      if (ch === 39
      /* `'` */
      ) {
          if (this.peek() === 39
          /* `'` */
          ) {
              codePoints.push(39); // Bump one more time because we need to skip 2 characters.

              this.bump();
            } else {
            // Optional closing apostrophe.
            this.bump();
            break;
          }
        } else {
        codePoints.push(ch);
      }

      this.bump();
    }

    return fromCodePoint.apply(void 0, codePoints);
  };

  Parser.prototype.tryParseUnquoted = function (nestingLevel, parentArgType) {
    if (this.isEOF()) {
      return null;
    }

    var ch = this.char();

    if (ch === 60
    /* `<` */
    || ch === 123
    /* `{` */
    || ch === 35
    /* `#` */
    && (parentArgType === 'plural' || parentArgType === 'selectordinal') || ch === 125
    /* `}` */
    && nestingLevel > 0) {
      return null;
    } else {
      this.bump();
      return fromCodePoint(ch);
    }
  };

  Parser.prototype.parseArgument = function (nestingLevel, expectingCloseTag) {
    var openingBracePosition = this.clonePosition();
    this.bump(); // `{`

    this.bumpSpace();

    if (this.isEOF()) {
      return this.error(error.ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
    }

    if (this.char() === 125
    /* `}` */
    ) {
        this.bump();
        return this.error(error.ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
      } // argument name


    var value = this.parseIdentifierIfPossible().value;

    if (!value) {
      return this.error(error.ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
    }

    this.bumpSpace();

    if (this.isEOF()) {
      return this.error(error.ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
    }

    switch (this.char()) {
      // Simple argument: `{name}`
      case 125
      /* `}` */
      :
        {
          this.bump(); // `}`

          return {
            val: {
              type: types.TYPE.argument,
              // value does not include the opening and closing braces.
              value: value,
              location: createLocation(openingBracePosition, this.clonePosition())
            },
            err: null
          };
        }
      // Argument with options: `{name, format, ...}`

      case 44
      /* `,` */
      :
        {
          this.bump(); // `,`

          this.bumpSpace();

          if (this.isEOF()) {
            return this.error(error.ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
          }

          return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
        }

      default:
        return this.error(error.ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
    }
  };
  /**
   * Advance the parser until the end of the identifier, if it is currently on
   * an identifier character. Return an empty string otherwise.
   */


  Parser.prototype.parseIdentifierIfPossible = function () {
    var startingPosition = this.clonePosition();
    var startOffset = this.offset();
    var value = matchIdentifierAtIndex(this.message, startOffset);
    var endOffset = startOffset + value.length;
    this.bumpTo(endOffset);
    var endPosition = this.clonePosition();
    var location = createLocation(startingPosition, endPosition);
    return {
      value: value,
      location: location
    };
  };

  Parser.prototype.parseArgumentOptions = function (nestingLevel, expectingCloseTag, value, openingBracePosition) {
    var _a; // Parse this range:
    // {name, type, style}
    //        ^---^


    var typeStartPosition = this.clonePosition();
    var argType = this.parseIdentifierIfPossible().value;
    var typeEndPosition = this.clonePosition();

    switch (argType) {
      case '':
        // Expecting a style string number, date, time, plural, selectordinal, or select.
        return this.error(error.ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));

      case 'number':
      case 'date':
      case 'time':
        {
          // Parse this range:
          // {name, number, style}
          //              ^-------^
          this.bumpSpace();
          var styleAndLocation = null;

          if (this.bumpIf(',')) {
            this.bumpSpace();
            var styleStartPosition = this.clonePosition();
            var result = this.parseSimpleArgStyleIfPossible();

            if (result.err) {
              return result;
            }

            var style = trimEnd(result.val);

            if (style.length === 0) {
              return this.error(error.ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
            }

            var styleLocation = createLocation(styleStartPosition, this.clonePosition());
            styleAndLocation = {
              style: style,
              styleLocation: styleLocation
            };
          }

          var argCloseResult = this.tryParseArgumentClose(openingBracePosition);

          if (argCloseResult.err) {
            return argCloseResult;
          }

          var location_1 = createLocation(openingBracePosition, this.clonePosition()); // Extract style or skeleton

          if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, '::', 0)) {
            // Skeleton starts with `::`.
            var skeleton = trimStart(styleAndLocation.style.slice(2));

            if (argType === 'number') {
              var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);

              if (result.err) {
                return result;
              }

              return {
                val: {
                  type: types.TYPE.number,
                  value: value,
                  location: location_1,
                  style: result.val
                },
                err: null
              };
            } else {
              if (skeleton.length === 0) {
                return this.error(error.ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
              }

              var style = {
                type: types.SKELETON_TYPE.dateTime,
                pattern: skeleton,
                location: styleAndLocation.styleLocation,
                parsedOptions: this.shouldParseSkeletons ? icuSkeletonParser.parseDateTimeSkeleton(skeleton) : {}
              };
              var type = argType === 'date' ? types.TYPE.date : types.TYPE.time;
              return {
                val: {
                  type: type,
                  value: value,
                  location: location_1,
                  style: style
                },
                err: null
              };
            }
          } // Regular style or no style.


          return {
            val: {
              type: argType === 'number' ? types.TYPE.number : argType === 'date' ? types.TYPE.date : types.TYPE.time,
              value: value,
              location: location_1,
              style: (_a = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a !== void 0 ? _a : null
            },
            err: null
          };
        }

      case 'plural':
      case 'selectordinal':
      case 'select':
        {
          // Parse this range:
          // {name, plural, options}
          //              ^---------^
          var typeEndPosition_1 = this.clonePosition();
          this.bumpSpace();

          if (!this.bumpIf(',')) {
            return this.error(error.ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, tslib_1.__assign({}, typeEndPosition_1)));
          }

          this.bumpSpace(); // Parse offset:
          // {name, plural, offset:1, options}
          //                ^-----^
          //
          // or the first option:
          //
          // {name, plural, one {...} other {...}}
          //                ^--^

          var identifierAndLocation = this.parseIdentifierIfPossible();
          var pluralOffset = 0;

          if (argType !== 'select' && identifierAndLocation.value === 'offset') {
            if (!this.bumpIf(':')) {
              return this.error(error.ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
            }

            this.bumpSpace();
            var result = this.tryParseDecimalInteger(error.ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, error.ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);

            if (result.err) {
              return result;
            } // Parse another identifier for option parsing


            this.bumpSpace();
            identifierAndLocation = this.parseIdentifierIfPossible();
            pluralOffset = result.val;
          }

          var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);

          if (optionsResult.err) {
            return optionsResult;
          }

          var argCloseResult = this.tryParseArgumentClose(openingBracePosition);

          if (argCloseResult.err) {
            return argCloseResult;
          }

          var location_2 = createLocation(openingBracePosition, this.clonePosition());

          if (argType === 'select') {
            return {
              val: {
                type: types.TYPE.select,
                value: value,
                options: fromEntries(optionsResult.val),
                location: location_2
              },
              err: null
            };
          } else {
            return {
              val: {
                type: types.TYPE.plural,
                value: value,
                options: fromEntries(optionsResult.val),
                offset: pluralOffset,
                pluralType: argType === 'plural' ? 'cardinal' : 'ordinal',
                location: location_2
              },
              err: null
            };
          }
        }

      default:
        return this.error(error.ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
    }
  };

  Parser.prototype.tryParseArgumentClose = function (openingBracePosition) {
    // Parse: {value, number, ::currency/GBP }
    //
    if (this.isEOF() || this.char() !== 125
    /* `}` */
    ) {
        return this.error(error.ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
      }

    this.bump(); // `}`

    return {
      val: true,
      err: null
    };
  };
  /**
   * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
   */


  Parser.prototype.parseSimpleArgStyleIfPossible = function () {
    var nestedBraces = 0;
    var startPosition = this.clonePosition();

    while (!this.isEOF()) {
      var ch = this.char();

      switch (ch) {
        case 39
        /* `'` */
        :
          {
            // Treat apostrophe as quoting but include it in the style part.
            // Find the end of the quoted literal text.
            this.bump();
            var apostrophePosition = this.clonePosition();

            if (!this.bumpUntil("'")) {
              return this.error(error.ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
            }

            this.bump();
            break;
          }

        case 123
        /* `{` */
        :
          {
            nestedBraces += 1;
            this.bump();
            break;
          }

        case 125
        /* `}` */
        :
          {
            if (nestedBraces > 0) {
              nestedBraces -= 1;
            } else {
              return {
                val: this.message.slice(startPosition.offset, this.offset()),
                err: null
              };
            }

            break;
          }

        default:
          this.bump();
          break;
      }
    }

    return {
      val: this.message.slice(startPosition.offset, this.offset()),
      err: null
    };
  };

  Parser.prototype.parseNumberSkeletonFromString = function (skeleton, location) {
    var tokens = [];

    try {
      tokens = icuSkeletonParser.parseNumberSkeletonFromString(skeleton);
    } catch (e) {
      return this.error(error.ErrorKind.INVALID_NUMBER_SKELETON, location);
    }

    return {
      val: {
        type: types.SKELETON_TYPE.number,
        tokens: tokens,
        location: location,
        parsedOptions: this.shouldParseSkeletons ? icuSkeletonParser.parseNumberSkeleton(tokens) : {}
      },
      err: null
    };
  };
  /**
   * @param nesting_level The current nesting level of messages.
   *     This can be positive when parsing message fragment in select or plural argument options.
   * @param parent_arg_type The parent argument's type.
   * @param parsed_first_identifier If provided, this is the first identifier-like selector of
   *     the argument. It is a by-product of a previous parsing attempt.
   * @param expecting_close_tag If true, this message is directly or indirectly nested inside
   *     between a pair of opening and closing tags. The nested message will not parse beyond
   *     the closing tag boundary.
   */


  Parser.prototype.tryParsePluralOrSelectOptions = function (nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
    var _a;

    var hasOtherClause = false;
    var options = [];
    var parsedSelectors = new Set();
    var selector = parsedFirstIdentifier.value,
        selectorLocation = parsedFirstIdentifier.location; // Parse:
    // one {one apple}
    // ^--^

    while (true) {
      if (selector.length === 0) {
        var startPosition = this.clonePosition();

        if (parentArgType !== 'select' && this.bumpIf('=')) {
          // Try parse `={number}` selector
          var result = this.tryParseDecimalInteger(error.ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, error.ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);

          if (result.err) {
            return result;
          }

          selectorLocation = createLocation(startPosition, this.clonePosition());
          selector = this.message.slice(startPosition.offset, this.offset());
        } else {
          break;
        }
      } // Duplicate selector clauses


      if (parsedSelectors.has(selector)) {
        return this.error(parentArgType === 'select' ? error.ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR : error.ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
      }

      if (selector === 'other') {
        hasOtherClause = true;
      } // Parse:
      // one {one apple}
      //     ^----------^


      this.bumpSpace();
      var openingBracePosition = this.clonePosition();

      if (!this.bumpIf('{')) {
        return this.error(parentArgType === 'select' ? error.ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : error.ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
      }

      var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);

      if (fragmentResult.err) {
        return fragmentResult;
      }

      var argCloseResult = this.tryParseArgumentClose(openingBracePosition);

      if (argCloseResult.err) {
        return argCloseResult;
      }

      options.push([selector, {
        value: fragmentResult.val,
        location: createLocation(openingBracePosition, this.clonePosition())
      }]); // Keep track of the existing selectors

      parsedSelectors.add(selector); // Prep next selector clause.

      this.bumpSpace();
      _a = this.parseIdentifierIfPossible(), selector = _a.value, selectorLocation = _a.location;
    }

    if (options.length === 0) {
      return this.error(parentArgType === 'select' ? error.ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR : error.ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
    }

    if (this.requiresOtherClause && !hasOtherClause) {
      return this.error(error.ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
    }

    return {
      val: options,
      err: null
    };
  };

  Parser.prototype.tryParseDecimalInteger = function (expectNumberError, invalidNumberError) {
    var sign = 1;
    var startingPosition = this.clonePosition();

    if (this.bumpIf('+')) ; else if (this.bumpIf('-')) {
      sign = -1;
    }

    var hasDigits = false;
    var decimal = 0;

    while (!this.isEOF()) {
      var ch = this.char();

      if (ch >= 48
      /* `0` */
      && ch <= 57
      /* `9` */
      ) {
          hasDigits = true;
          decimal = decimal * 10 + (ch - 48);
          this.bump();
        } else {
        break;
      }
    }

    var location = createLocation(startingPosition, this.clonePosition());

    if (!hasDigits) {
      return this.error(expectNumberError, location);
    }

    decimal *= sign;

    if (!isSafeInteger(decimal)) {
      return this.error(invalidNumberError, location);
    }

    return {
      val: decimal,
      err: null
    };
  };

  Parser.prototype.offset = function () {
    return this.position.offset;
  };

  Parser.prototype.isEOF = function () {
    return this.offset() === this.message.length;
  };

  Parser.prototype.clonePosition = function () {
    // This is much faster than `Object.assign` or spread.
    return {
      offset: this.position.offset,
      line: this.position.line,
      column: this.position.column
    };
  };
  /**
   * Return the code point at the current position of the parser.
   * Throws if the index is out of bound.
   */


  Parser.prototype.char = function () {
    var offset = this.position.offset;

    if (offset >= this.message.length) {
      throw Error('out of bound');
    }

    var code = codePointAt(this.message, offset);

    if (code === undefined) {
      throw Error("Offset " + offset + " is at invalid UTF-16 code unit boundary");
    }

    return code;
  };

  Parser.prototype.error = function (kind, location) {
    return {
      val: null,
      err: {
        kind: kind,
        message: this.message,
        location: location
      }
    };
  };
  /** Bump the parser to the next UTF-16 code unit. */


  Parser.prototype.bump = function () {
    if (this.isEOF()) {
      return;
    }

    var code = this.char();

    if (code === 10
    /* '\n' */
    ) {
        this.position.line += 1;
        this.position.column = 1;
        this.position.offset += 1;
      } else {
      this.position.column += 1; // 0 ~ 0x10000 -> unicode BMP, otherwise skip the surrogate pair.

      this.position.offset += code < 0x10000 ? 1 : 2;
    }
  };
  /**
   * If the substring starting at the current position of the parser has
   * the given prefix, then bump the parser to the character immediately
   * following the prefix and return true. Otherwise, don't bump the parser
   * and return false.
   */


  Parser.prototype.bumpIf = function (prefix) {
    if (startsWith(this.message, prefix, this.offset())) {
      for (var i = 0; i < prefix.length; i++) {
        this.bump();
      }

      return true;
    }

    return false;
  };
  /**
   * Bump the parser until the pattern character is found and return `true`.
   * Otherwise bump to the end of the file and return `false`.
   */


  Parser.prototype.bumpUntil = function (pattern) {
    var currentOffset = this.offset();
    var index = this.message.indexOf(pattern, currentOffset);

    if (index >= 0) {
      this.bumpTo(index);
      return true;
    } else {
      this.bumpTo(this.message.length);
      return false;
    }
  };
  /**
   * Bump the parser to the target offset.
   * If target offset is beyond the end of the input, bump the parser to the end of the input.
   */


  Parser.prototype.bumpTo = function (targetOffset) {
    if (this.offset() > targetOffset) {
      throw Error("targetOffset " + targetOffset + " must be greater than or equal to the current offset " + this.offset());
    }

    targetOffset = Math.min(targetOffset, this.message.length);

    while (true) {
      var offset = this.offset();

      if (offset === targetOffset) {
        break;
      }

      if (offset > targetOffset) {
        throw Error("targetOffset " + targetOffset + " is at invalid UTF-16 code unit boundary");
      }

      this.bump();

      if (this.isEOF()) {
        break;
      }
    }
  };
  /** advance the parser through all whitespace to the next non-whitespace code unit. */


  Parser.prototype.bumpSpace = function () {
    while (!this.isEOF() && _isWhiteSpace(this.char())) {
      this.bump();
    }
  };
  /**
   * Peek at the *next* Unicode codepoint in the input without advancing the parser.
   * If the input has been exhausted, then this returns null.
   */


  Parser.prototype.peek = function () {
    if (this.isEOF()) {
      return null;
    }

    var code = this.char();
    var offset = this.offset();
    var nextCode = this.message.charCodeAt(offset + (code >= 0x10000 ? 2 : 1));
    return nextCode !== null && nextCode !== void 0 ? nextCode : null;
  };

  return Parser;
}();

exports.Parser = Parser;

function _isAlpha(codepoint) {
  return codepoint >= 97 && codepoint <= 122;
}

function _isAlphaOrSlash(codepoint) {
  return _isAlpha(codepoint) || codepoint === 47;
  /* '/' */
}
/** See `parseTag` function docs. */


function _isPotentialElementNameChar(c) {
  return c === 45
  /* '-' */
  || c === 46
  /* '.' */
  || c >= 48 && c <= 57
  /* 0..9 */
  || c === 95
  /* '_' */
  || c >= 97 && c <= 122
  /** a..z */
  || c >= 65 && c <= 90
  /* A..Z */
  || c == 0xb7 || c >= 0xc0 && c <= 0xd6 || c >= 0xd8 && c <= 0xf6 || c >= 0xf8 && c <= 0x37d || c >= 0x37f && c <= 0x1fff || c >= 0x200c && c <= 0x200d || c >= 0x203f && c <= 0x2040 || c >= 0x2070 && c <= 0x218f || c >= 0x2c00 && c <= 0x2fef || c >= 0x3001 && c <= 0xd7ff || c >= 0xf900 && c <= 0xfdcf || c >= 0xfdf0 && c <= 0xfffd || c >= 0x10000 && c <= 0xeffff;
}
/**
 * Code point equivalent of regex `\p{White_Space}`.
 * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */


function _isWhiteSpace(c) {
  return c >= 0x0009 && c <= 0x000d || c === 0x0020 || c === 0x0085 || c >= 0x200e && c <= 0x200f || c === 0x2028 || c === 0x2029;
}
/**
 * Code point equivalent of regex `\p{Pattern_Syntax}`.
 * See https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */


function _isPatternSyntax(c) {
  return c >= 0x0021 && c <= 0x0023 || c === 0x0024 || c >= 0x0025 && c <= 0x0027 || c === 0x0028 || c === 0x0029 || c === 0x002a || c === 0x002b || c === 0x002c || c === 0x002d || c >= 0x002e && c <= 0x002f || c >= 0x003a && c <= 0x003b || c >= 0x003c && c <= 0x003e || c >= 0x003f && c <= 0x0040 || c === 0x005b || c === 0x005c || c === 0x005d || c === 0x005e || c === 0x0060 || c === 0x007b || c === 0x007c || c === 0x007d || c === 0x007e || c === 0x00a1 || c >= 0x00a2 && c <= 0x00a5 || c === 0x00a6 || c === 0x00a7 || c === 0x00a9 || c === 0x00ab || c === 0x00ac || c === 0x00ae || c === 0x00b0 || c === 0x00b1 || c === 0x00b6 || c === 0x00bb || c === 0x00bf || c === 0x00d7 || c === 0x00f7 || c >= 0x2010 && c <= 0x2015 || c >= 0x2016 && c <= 0x2017 || c === 0x2018 || c === 0x2019 || c === 0x201a || c >= 0x201b && c <= 0x201c || c === 0x201d || c === 0x201e || c === 0x201f || c >= 0x2020 && c <= 0x2027 || c >= 0x2030 && c <= 0x2038 || c === 0x2039 || c === 0x203a || c >= 0x203b && c <= 0x203e || c >= 0x2041 && c <= 0x2043 || c === 0x2044 || c === 0x2045 || c === 0x2046 || c >= 0x2047 && c <= 0x2051 || c === 0x2052 || c === 0x2053 || c >= 0x2055 && c <= 0x205e || c >= 0x2190 && c <= 0x2194 || c >= 0x2195 && c <= 0x2199 || c >= 0x219a && c <= 0x219b || c >= 0x219c && c <= 0x219f || c === 0x21a0 || c >= 0x21a1 && c <= 0x21a2 || c === 0x21a3 || c >= 0x21a4 && c <= 0x21a5 || c === 0x21a6 || c >= 0x21a7 && c <= 0x21ad || c === 0x21ae || c >= 0x21af && c <= 0x21cd || c >= 0x21ce && c <= 0x21cf || c >= 0x21d0 && c <= 0x21d1 || c === 0x21d2 || c === 0x21d3 || c === 0x21d4 || c >= 0x21d5 && c <= 0x21f3 || c >= 0x21f4 && c <= 0x22ff || c >= 0x2300 && c <= 0x2307 || c === 0x2308 || c === 0x2309 || c === 0x230a || c === 0x230b || c >= 0x230c && c <= 0x231f || c >= 0x2320 && c <= 0x2321 || c >= 0x2322 && c <= 0x2328 || c === 0x2329 || c === 0x232a || c >= 0x232b && c <= 0x237b || c === 0x237c || c >= 0x237d && c <= 0x239a || c >= 0x239b && c <= 0x23b3 || c >= 0x23b4 && c <= 0x23db || c >= 0x23dc && c <= 0x23e1 || c >= 0x23e2 && c <= 0x2426 || c >= 0x2427 && c <= 0x243f || c >= 0x2440 && c <= 0x244a || c >= 0x244b && c <= 0x245f || c >= 0x2500 && c <= 0x25b6 || c === 0x25b7 || c >= 0x25b8 && c <= 0x25c0 || c === 0x25c1 || c >= 0x25c2 && c <= 0x25f7 || c >= 0x25f8 && c <= 0x25ff || c >= 0x2600 && c <= 0x266e || c === 0x266f || c >= 0x2670 && c <= 0x2767 || c === 0x2768 || c === 0x2769 || c === 0x276a || c === 0x276b || c === 0x276c || c === 0x276d || c === 0x276e || c === 0x276f || c === 0x2770 || c === 0x2771 || c === 0x2772 || c === 0x2773 || c === 0x2774 || c === 0x2775 || c >= 0x2794 && c <= 0x27bf || c >= 0x27c0 && c <= 0x27c4 || c === 0x27c5 || c === 0x27c6 || c >= 0x27c7 && c <= 0x27e5 || c === 0x27e6 || c === 0x27e7 || c === 0x27e8 || c === 0x27e9 || c === 0x27ea || c === 0x27eb || c === 0x27ec || c === 0x27ed || c === 0x27ee || c === 0x27ef || c >= 0x27f0 && c <= 0x27ff || c >= 0x2800 && c <= 0x28ff || c >= 0x2900 && c <= 0x2982 || c === 0x2983 || c === 0x2984 || c === 0x2985 || c === 0x2986 || c === 0x2987 || c === 0x2988 || c === 0x2989 || c === 0x298a || c === 0x298b || c === 0x298c || c === 0x298d || c === 0x298e || c === 0x298f || c === 0x2990 || c === 0x2991 || c === 0x2992 || c === 0x2993 || c === 0x2994 || c === 0x2995 || c === 0x2996 || c === 0x2997 || c === 0x2998 || c >= 0x2999 && c <= 0x29d7 || c === 0x29d8 || c === 0x29d9 || c === 0x29da || c === 0x29db || c >= 0x29dc && c <= 0x29fb || c === 0x29fc || c === 0x29fd || c >= 0x29fe && c <= 0x2aff || c >= 0x2b00 && c <= 0x2b2f || c >= 0x2b30 && c <= 0x2b44 || c >= 0x2b45 && c <= 0x2b46 || c >= 0x2b47 && c <= 0x2b4c || c >= 0x2b4d && c <= 0x2b73 || c >= 0x2b74 && c <= 0x2b75 || c >= 0x2b76 && c <= 0x2b95 || c === 0x2b96 || c >= 0x2b97 && c <= 0x2bff || c >= 0x2e00 && c <= 0x2e01 || c === 0x2e02 || c === 0x2e03 || c === 0x2e04 || c === 0x2e05 || c >= 0x2e06 && c <= 0x2e08 || c === 0x2e09 || c === 0x2e0a || c === 0x2e0b || c === 0x2e0c || c === 0x2e0d || c >= 0x2e0e && c <= 0x2e16 || c === 0x2e17 || c >= 0x2e18 && c <= 0x2e19 || c === 0x2e1a || c === 0x2e1b || c === 0x2e1c || c === 0x2e1d || c >= 0x2e1e && c <= 0x2e1f || c === 0x2e20 || c === 0x2e21 || c === 0x2e22 || c === 0x2e23 || c === 0x2e24 || c === 0x2e25 || c === 0x2e26 || c === 0x2e27 || c === 0x2e28 || c === 0x2e29 || c >= 0x2e2a && c <= 0x2e2e || c === 0x2e2f || c >= 0x2e30 && c <= 0x2e39 || c >= 0x2e3a && c <= 0x2e3b || c >= 0x2e3c && c <= 0x2e3f || c === 0x2e40 || c === 0x2e41 || c === 0x2e42 || c >= 0x2e43 && c <= 0x2e4f || c >= 0x2e50 && c <= 0x2e51 || c === 0x2e52 || c >= 0x2e53 && c <= 0x2e7f || c >= 0x3001 && c <= 0x3003 || c === 0x3008 || c === 0x3009 || c === 0x300a || c === 0x300b || c === 0x300c || c === 0x300d || c === 0x300e || c === 0x300f || c === 0x3010 || c === 0x3011 || c >= 0x3012 && c <= 0x3013 || c === 0x3014 || c === 0x3015 || c === 0x3016 || c === 0x3017 || c === 0x3018 || c === 0x3019 || c === 0x301a || c === 0x301b || c === 0x301c || c === 0x301d || c >= 0x301e && c <= 0x301f || c === 0x3020 || c === 0x3030 || c === 0xfd3e || c === 0xfd3f || c >= 0xfe45 && c <= 0xfe46;
}
});

var icuMessageformatParser = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = void 0;









function pruneLocation(els) {
  els.forEach(function (el) {
    delete el.location;

    if (types.isSelectElement(el) || types.isPluralElement(el)) {
      for (var k in el.options) {
        delete el.options[k].location;
        pruneLocation(el.options[k].value);
      }
    } else if (types.isNumberElement(el) && types.isNumberSkeleton(el.style)) {
      delete el.style.location;
    } else if ((types.isDateElement(el) || types.isTimeElement(el)) && types.isDateTimeSkeleton(el.style)) {
      delete el.style.location;
    } else if (types.isTagElement(el)) {
      pruneLocation(el.children);
    }
  });
}

function parse(message, opts) {
  if (opts === void 0) {
    opts = {};
  }

  opts = tslib_1.__assign({
    shouldParseSkeletons: true
  }, opts);
  var result = new parser.Parser(message, opts).parse();

  if (result.err) {
    var error$1 = SyntaxError(error.ErrorKind[result.err.kind]); // @ts-expect-error Assign to error object

    error$1.location = result.err.location;
    throw error$1;
  }

  if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
    pruneLocation(result.val);
  }

  return result.val;
}

exports.parse = parse;

tslib_1.__exportStar(types, exports);
});

//
// Main
//
function memoize(fn, options) {
  var cache = options && options.cache ? options.cache : cacheDefault;
  var serializer = options && options.serializer ? options.serializer : serializerDefault;
  var strategy = options && options.strategy ? options.strategy : strategyDefault;
  return strategy(fn, {
    cache: cache,
    serializer: serializer
  });
} //
// Strategy
//


function isPrimitive(value) {
  return value == null || typeof value === 'number' || typeof value === 'boolean'; // || typeof value === "string" 'unsafe' primitive for our needs
}

function monadic(fn, cache, serializer, arg) {
  var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
  var computedValue = cache.get(cacheKey);

  if (typeof computedValue === 'undefined') {
    computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
  }

  return computedValue;
}

function variadic(fn, cache, serializer) {
  var args = Array.prototype.slice.call(arguments, 3);
  var cacheKey = serializer(args);
  var computedValue = cache.get(cacheKey);

  if (typeof computedValue === 'undefined') {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }

  return computedValue;
}

function assemble(fn, context, strategy, cache, serialize) {
  return strategy.bind(context, fn, cache, serialize);
}

function strategyDefault(fn, options) {
  var strategy = fn.length === 1 ? monadic : variadic;
  return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}

function strategyVariadic(fn, options) {
  var strategy = variadic;
  return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}

function strategyMonadic(fn, options) {
  var strategy = monadic;
  return assemble(fn, this, strategy, options.cache.create(), options.serializer);
} //
// Serializer
//


function serializerDefault() {
  return JSON.stringify(arguments);
} //
// Cache
//


function ObjectWithoutPrototypeCache() {
  this.cache = Object.create(null);
}

ObjectWithoutPrototypeCache.prototype.has = function (key) {
  return key in this.cache;
};

ObjectWithoutPrototypeCache.prototype.get = function (key) {
  return this.cache[key];
};

ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
  this.cache[key] = value;
};

var cacheDefault = {
  create: function create() {
    return new ObjectWithoutPrototypeCache();
  }
}; //
// API
//

var src = memoize;
var strategies = {
  variadic: strategyVariadic,
  monadic: strategyMonadic
};
src.strategies = strategies;

var memoize$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), src, {
    'default': src,
    strategies: strategies
}));

var ErrorCode;

(function (ErrorCode) {
  // When we have a placeholder but no value to format
  ErrorCode["MISSING_VALUE"] = "MISSING_VALUE"; // When value supplied is invalid

  ErrorCode["INVALID_VALUE"] = "INVALID_VALUE"; // When we need specific Intl API but it's not available

  ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
})(ErrorCode || (ErrorCode = {}));

var FormatError =
/** @class */
function (_super) {
  __extends(FormatError, _super);

  function FormatError(msg, code, originalMessage) {
    var _this = _super.call(this, msg) || this;

    _this.code = code;
    _this.originalMessage = originalMessage;
    return _this;
  }

  FormatError.prototype.toString = function () {
    return "[formatjs Error: " + this.code + "] " + this.message;
  };

  return FormatError;
}(Error);

var InvalidValueError =
/** @class */
function (_super) {
  __extends(InvalidValueError, _super);

  function InvalidValueError(variableId, value, options, originalMessage) {
    return _super.call(this, "Invalid values for \"" + variableId + "\": \"" + value + "\". Options are \"" + Object.keys(options).join('", "') + "\"", ErrorCode.INVALID_VALUE, originalMessage) || this;
  }

  return InvalidValueError;
}(FormatError);

var InvalidValueTypeError =
/** @class */
function (_super) {
  __extends(InvalidValueTypeError, _super);

  function InvalidValueTypeError(value, type, originalMessage) {
    return _super.call(this, "Value for \"" + value + "\" must be of type " + type, ErrorCode.INVALID_VALUE, originalMessage) || this;
  }

  return InvalidValueTypeError;
}(FormatError);

var MissingValueError =
/** @class */
function (_super) {
  __extends(MissingValueError, _super);

  function MissingValueError(variableId, originalMessage) {
    return _super.call(this, "The intl string context variable \"" + variableId + "\" was not provided to the string \"" + originalMessage + "\"", ErrorCode.MISSING_VALUE, originalMessage) || this;
  }

  return MissingValueError;
}(FormatError);

var PART_TYPE;

(function (PART_TYPE) {
  PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
  PART_TYPE[PART_TYPE["object"] = 1] = "object";
})(PART_TYPE || (PART_TYPE = {}));

function mergeLiteral(parts) {
  if (parts.length < 2) {
    return parts;
  }

  return parts.reduce(function (all, part) {
    var lastPart = all[all.length - 1];

    if (!lastPart || lastPart.type !== PART_TYPE.literal || part.type !== PART_TYPE.literal) {
      all.push(part);
    } else {
      lastPart.value += part.value;
    }

    return all;
  }, []);
}

function isFormatXMLElementFn(el) {
  return typeof el === 'function';
} // TODO(skeleton): add skeleton support

function formatToParts(els, locales, formatters, formats, values, currentPluralValue, // For debugging
originalMessage) {
  // Hot path for straight simple msg translations
  if (els.length === 1 && icuMessageformatParser.isLiteralElement(els[0])) {
    return [{
      type: PART_TYPE.literal,
      value: els[0].value
    }];
  }

  var result = [];

  for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
    var el = els_1[_i]; // Exit early for string parts.

    if (icuMessageformatParser.isLiteralElement(el)) {
      result.push({
        type: PART_TYPE.literal,
        value: el.value
      });
      continue;
    } // TODO: should this part be literal type?
    // Replace `#` in plural rules with the actual numeric value.


    if (icuMessageformatParser.isPoundElement(el)) {
      if (typeof currentPluralValue === 'number') {
        result.push({
          type: PART_TYPE.literal,
          value: formatters.getNumberFormat(locales).format(currentPluralValue)
        });
      }

      continue;
    }

    var varName = el.value; // Enforce that all required values are provided by the caller.

    if (!(values && varName in values)) {
      throw new MissingValueError(varName, originalMessage);
    }

    var value = values[varName];

    if (icuMessageformatParser.isArgumentElement(el)) {
      if (!value || typeof value === 'string' || typeof value === 'number') {
        value = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
      }

      result.push({
        type: typeof value === 'string' ? PART_TYPE.literal : PART_TYPE.object,
        value: value
      });
      continue;
    } // Recursively format plural and select parts' option — which can be a
    // nested pattern structure. The choosing of the option to use is
    // abstracted-by and delegated-to the part helper object.


    if (icuMessageformatParser.isDateElement(el)) {
      var style = typeof el.style === 'string' ? formats.date[el.style] : icuMessageformatParser.isDateTimeSkeleton(el.style) ? el.style.parsedOptions : undefined;
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }

    if (icuMessageformatParser.isTimeElement(el)) {
      var style = typeof el.style === 'string' ? formats.time[el.style] : icuMessageformatParser.isDateTimeSkeleton(el.style) ? el.style.parsedOptions : undefined;
      result.push({
        type: PART_TYPE.literal,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }

    if (icuMessageformatParser.isNumberElement(el)) {
      var style = typeof el.style === 'string' ? formats.number[el.style] : icuMessageformatParser.isNumberSkeleton(el.style) ? el.style.parsedOptions : undefined;

      if (style && style.scale) {
        value = value * (style.scale || 1);
      }

      result.push({
        type: PART_TYPE.literal,
        value: formatters.getNumberFormat(locales, style).format(value)
      });
      continue;
    }

    if (icuMessageformatParser.isTagElement(el)) {
      var children = el.children,
          value_1 = el.value;
      var formatFn = values[value_1];

      if (!isFormatXMLElementFn(formatFn)) {
        throw new InvalidValueTypeError(value_1, 'function', originalMessage);
      }

      var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
      var chunks = formatFn(parts.map(function (p) {
        return p.value;
      }));

      if (!Array.isArray(chunks)) {
        chunks = [chunks];
      }

      result.push.apply(result, chunks.map(function (c) {
        return {
          type: typeof c === 'string' ? PART_TYPE.literal : PART_TYPE.object,
          value: c
        };
      }));
    }

    if (icuMessageformatParser.isSelectElement(el)) {
      var opt = el.options[value] || el.options.other;

      if (!opt) {
        throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      }

      result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
      continue;
    }

    if (icuMessageformatParser.isPluralElement(el)) {
      var opt = el.options["=" + value];

      if (!opt) {
        if (!Intl.PluralRules) {
          throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
        }

        var rule = formatters.getPluralRules(locales, {
          type: el.pluralType
        }).select(value - (el.offset || 0));
        opt = el.options[rule] || el.options.other;
      }

      if (!opt) {
        throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      }

      result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
      continue;
    }
  }

  return mergeLiteral(result);
}

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

function mergeConfig(c1, c2) {
  if (!c2) {
    return c1;
  }

  return __assign(__assign(__assign({}, c1 || {}), c2 || {}), Object.keys(c1).reduce(function (all, k) {
    all[k] = __assign(__assign({}, c1[k]), c2[k] || {});
    return all;
  }, {}));
}

function mergeConfigs(defaultConfig, configs) {
  if (!configs) {
    return defaultConfig;
  }

  return Object.keys(defaultConfig).reduce(function (all, k) {
    all[k] = mergeConfig(defaultConfig[k], configs[k]);
    return all;
  }, __assign({}, defaultConfig));
}

function createFastMemoizeCache(store) {
  return {
    create: function () {
      return {
        has: function (key) {
          return key in store;
        },
        get: function (key) {
          return store[key];
        },
        set: function (key, value) {
          store[key] = value;
        }
      };
    }
  };
} // @ts-ignore this is to deal with rollup's default import shenanigans


var _memoizeIntl = src || memoize$1;

var memoizeIntl = _memoizeIntl;

function createDefaultFormatters(cache) {
  if (cache === void 0) {
    cache = {
      number: {},
      dateTime: {},
      pluralRules: {}
    };
  }

  return {
    getNumberFormat: memoizeIntl(function () {
      var _a;

      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args)))();
    }, {
      cache: createFastMemoizeCache(cache.number),
      strategy: memoizeIntl.strategies.variadic
    }),
    getDateTimeFormat: memoizeIntl(function () {
      var _a;

      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args)))();
    }, {
      cache: createFastMemoizeCache(cache.dateTime),
      strategy: memoizeIntl.strategies.variadic
    }),
    getPluralRules: memoizeIntl(function () {
      var _a;

      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args)))();
    }, {
      cache: createFastMemoizeCache(cache.pluralRules),
      strategy: memoizeIntl.strategies.variadic
    })
  };
}

var IntlMessageFormat =
/** @class */
function () {
  function IntlMessageFormat(message, locales, overrideFormats, opts) {
    var _this = this;

    if (locales === void 0) {
      locales = IntlMessageFormat.defaultLocale;
    }

    this.formatterCache = {
      number: {},
      dateTime: {},
      pluralRules: {}
    };

    this.format = function (values) {
      var parts = _this.formatToParts(values); // Hot path for straight simple msg translations


      if (parts.length === 1) {
        return parts[0].value;
      }

      var result = parts.reduce(function (all, part) {
        if (!all.length || part.type !== PART_TYPE.literal || typeof all[all.length - 1] !== 'string') {
          all.push(part.value);
        } else {
          all[all.length - 1] += part.value;
        }

        return all;
      }, []);

      if (result.length <= 1) {
        return result[0] || '';
      }

      return result;
    };

    this.formatToParts = function (values) {
      return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, undefined, _this.message);
    };

    this.resolvedOptions = function () {
      return {
        locale: Intl.NumberFormat.supportedLocalesOf(_this.locales)[0]
      };
    };

    this.getAst = function () {
      return _this.ast;
    };

    if (typeof message === 'string') {
      this.message = message;

      if (!IntlMessageFormat.__parse) {
        throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
      } // Parse string messages into an AST.


      this.ast = IntlMessageFormat.__parse(message, {
        ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag
      });
    } else {
      this.ast = message;
    }

    if (!Array.isArray(this.ast)) {
      throw new TypeError('A message must be provided as a String or AST.');
    } // Creates a new object with the specified `formats` merged with the default
    // formats.


    this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats); // Defined first because it's used to build the format pattern.

    this.locales = locales;
    this.formatters = opts && opts.formatters || createDefaultFormatters(this.formatterCache);
  }

  Object.defineProperty(IntlMessageFormat, "defaultLocale", {
    get: function () {
      if (!IntlMessageFormat.memoizedDefaultLocale) {
        IntlMessageFormat.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale;
      }

      return IntlMessageFormat.memoizedDefaultLocale;
    },
    enumerable: false,
    configurable: true
  });
  IntlMessageFormat.memoizedDefaultLocale = null;
  IntlMessageFormat.__parse = icuMessageformatParser.parse; // Default format options used as the prototype of the `formats` provided to the
  // constructor. These are used when constructing the internal Intl.NumberFormat
  // and Intl.DateTimeFormat instances.

  IntlMessageFormat.formats = {
    number: {
      currency: {
        style: 'currency'
      },
      percent: {
        style: 'percent'
      }
    },
    date: {
      short: {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      },
      medium: {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      },
      long: {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      },
      full: {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    },
    time: {
      short: {
        hour: 'numeric',
        minute: 'numeric'
      },
      medium: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      },
      long: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
      },
      full: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
      }
    }
  };
  return IntlMessageFormat;
}();

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function () {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return {
      default: obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj.default = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}
/* eslint-disable node/no-unsupported-features/es-syntax */

/**
 * @callback getJSONCallback
 * @param {string|string[]} jsonURL
 * @param {SimpleJSONCallback} cb
 * @param {SimpleJSONErrback} errBack
 * @returns {Promise<JSON>}
 */

/**
 * @param {PlainObject} cfg
 * @param {fetch} cfg.fetch
 * @returns {getJSONCallback}
 */


function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

function _invoke(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
}

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

function buildGetJSONWithFetch({
  // eslint-disable-next-line no-shadow
  fetch = typeof window !== 'undefined' ? window.fetch : self.fetch
} = {}) {
  /**
  * @callback SimpleJSONCallback
  * @param {JSON} json
  * @returns {void}
  */

  /**
  * @callback SimpleJSONErrback
  * @param {Error} err
  * @param {string|string[]} jsonURL
  * @returns {void}
  */

  /**
  * @type {getJSONCallback}
  */
  return function getJSON(jsonURL, cb, errBack) {
    try {
      let _exit = false;
      return _catch(function () {
        return _invoke(function () {
          if (Array.isArray(jsonURL)) {
            return _await(Promise.all(jsonURL.map(url => {
              return getJSON(url);
            })), function (arrResult) {
              if (cb) {
                // eslint-disable-next-line node/callback-return, node/no-callback-literal, promise/prefer-await-to-callbacks
                cb(...arrResult);
              }

              _exit = true;
              return arrResult;
            });
          }
        }, function (_result) {
          return _exit ? _result : _await(fetch(jsonURL), function (resp) {
            return _await(resp.json(), function (result) {
              return typeof cb === 'function' // eslint-disable-next-line promise/prefer-await-to-callbacks
              ? cb(result) : result; // https://github.com/bcoe/c8/issues/135

              /* c8 ignore next */
            });
          });
        });
      }, function (e) {
        e.message += ` (File: ${jsonURL})`;

        if (errBack) {
          return errBack(e, jsonURL);
        }

        throw e; // https://github.com/bcoe/c8/issues/135

        /* c8 ignore next */
      });
      /* c8 ignore next */
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

function _await$1(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}
/* eslint-disable node/no-unsupported-features/node-builtins,
  node/no-unsupported-features/es-syntax, compat/compat */
// Needed for polyglot support (no `path` in browser); even if
//  polyglot using dynamic `import` not supported by Rollup (complaining
//  of inability to do tree-shaking in UMD builds), still useful to delay
//  path import for our testing, so that test can import this file in
//  the browser without compilation without it choking


let dirname, isWindows;

function _empty() {}
/**
 * @param {string} path
 * @returns {string}
 */


function _invokeIgnored(body) {
  var result = body();

  if (result && result.then) {
    return result.then(_empty);
  }
}

function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

const setDirname = _async(function () {
  return _invokeIgnored(function () {
    if (!dirname) {
      return _await$1(Promise.resolve().then(() => _interopRequireWildcard(require('path'))), function (_import) {
        ({
          dirname
        } = _import);
      });
    }
  });
});

function fixWindowsPath(path) {
  if (!isWindows) {
    isWindows = process.platform === 'win32';
  }

  return path.slice( // https://github.com/bcoe/c8/issues/135

  /* c8 ignore next */
  isWindows ? 1 : 0);
}
/**
 * @param {string} url
 * @returns {string}
 */


function getDirectoryForURL(url) {
  // Node should be ok with this, but transpiling
  //  to `require` doesn't work, so detect Windows
  //  to remove slash instead
  // "file://" +
  return fixWindowsPath(dirname(new URL(url).pathname));
}

function _await$2(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }

  if (!value || !value.then) {
    value = Promise.resolve(value);
  }

  return then ? value.then(then) : value;
}

let nodeFetch;
/**
 * @param {PlainObject} cfg
 * @param {string} cfg.baseURL
 * @param {string} cfg.cwd
 * @returns {getJSONCallback}
 */

function _invoke$1(body, then) {
  var result = body();

  if (result && result.then) {
    return result.then(then);
  }

  return then(result);
}

function _call(body, then, direct) {
  if (direct) {
    return then ? then(body()) : body();
  }

  try {
    var result = Promise.resolve(body());
    return then ? result.then(then) : result;
  } catch (e) {
    return Promise.reject(e);
  }
}

function _async$1(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }

    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

function buildGetJSON({
  baseURL,
  cwd: basePath
} = {}) {
  const _fetch = typeof fetch !== 'undefined' ? fetch : _async$1(function (jsonURL) {
    let _exit = false;
    return _invoke$1(function () {
      if (/^https?:/u.test(jsonURL)) {
        return _invoke$1(function () {
          if (!nodeFetch) {
            return _await$2(Promise.resolve().then(() => _interopRequireWildcard(require('node-fetch'))), function (_import) {
              nodeFetch = _import;
            });
          }
        }, function () {
          _exit = true;
          return nodeFetch.default(jsonURL);
        });
      }
    }, function (_result) {
      return _exit ? _result : _invoke$1(function () {
        if (!basePath) {
          return _call(setDirname, function () {
            basePath = baseURL ? getDirectoryForURL(baseURL) : typeof fetch === 'undefined' && process.cwd();
          });
        }
      }, function () {
        // Filed https://github.com/bergos/file-fetch/issues/12 to see
        //  about getting relative basePaths in `file-fetch` and using
        //  that better-tested package instead
        return _await$2(Promise.resolve().then(() => _interopRequireWildcard(require('local-xmlhttprequest'))), function (localXMLHttpRequest) {
          // eslint-disable-next-line no-shadow
          const XMLHttpRequest = localXMLHttpRequest.default({
            basePath
          }); // Don't change to an import as won't resolve for browser testing
          // eslint-disable-next-line promise/avoid-new

          return new Promise((resolve, reject) => {
            const r = new XMLHttpRequest();
            r.open('GET', jsonURL, true); // r.responseType = 'json';

            r.onreadystatechange = function () {
              // Not sure how to simulate `if`

              /* c8 ignore next */
              if (r.readyState !== 4) {
                return;
              }

              if (r.status === 200) {
                // var json = r.json;
                const response = r.responseText;
                resolve({
                  json: () => JSON.parse(response)
                });
                return;
              }

              reject(new SyntaxError('Failed to fetch URL: ' + jsonURL + 'state: ' + r.readyState + '; status: ' + r.status));
            };

            r.send(); // https://github.com/bcoe/c8/issues/135

            /* c8 ignore next */
          });
          /* c8 ignore next */
        });
      });
    });
  });

  const ret = buildGetJSONWithFetch({
    fetch: _fetch
  });
  ret._fetch = _fetch;
  ret.hasURLBasePath = Boolean(baseURL);
  ret.basePath = basePath;
  return ret;
}

const getJSON = buildGetJSON();

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

      const msg = new IntlMessageFormat(message, this.langs, formats);
      return msg.format(values);
    };
  }

  loadLocales(langs, cb, avoidSettingLocales) {
    langs = langs || navigator.language || 'en-US';
    langs = Array.isArray(langs) ? langs : [langs];

    if (!avoidSettingLocales) {
      this.langs = langs;
    }

    return getJSON(langs.map(this.localeFileResolver, this), (...locales) => {
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
  global.IntlMessageFormat = IntlMessageFormat;
}

export { IMF, IMFClass };
