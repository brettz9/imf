'use strict';

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */
var hop = Object.prototype.hasOwnProperty;
function extend(obj) {
  var sources = Array.prototype.slice.call(arguments, 1),
      i,
      len,
      source,
      key;

  for (i = 0, len = sources.length; i < len; i += 1) {
    source = sources[i];

    if (!source) {
      continue;
    }

    for (key in source) {
      if (hop.call(source, key)) {
        obj[key] = source[key];
      }
    }
  }

  return obj;
}

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
// Copyright 2013 Andy Earnshaw, MIT License

var realDefineProp = function () {
  try {
    return !!Object.defineProperty({}, 'a', {});
  } catch (e) {
    return false;
  }
}();
var defineProperty = realDefineProp ? Object.defineProperty : function (obj, name, desc) {
  if ('get' in desc && obj.__defineGetter__) {
    obj.__defineGetter__(name, desc.get);
  } else if (!hop.call(obj, name) || 'value' in desc) {
    obj[name] = desc.value;
  }
};

var objCreate = Object.create || function (proto, props) {
  var obj, k;

  function F() {}

  F.prototype = proto;
  obj = new F();

  for (k in props) {
    if (hop.call(props, k)) {
      defineProperty(obj, k, props[k]);
    }
  }

  return obj;
};

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

function Compiler(locales, formats, pluralFn) {
  this.locales = locales;
  this.formats = formats;
  this.pluralFn = pluralFn;
}

Compiler.prototype.compile = function (ast) {
  this.pluralStack = [];
  this.currentPlural = null;
  this.pluralNumberFormat = null;
  return this.compileMessage(ast);
};

Compiler.prototype.compileMessage = function (ast) {
  if (!(ast && ast.type === 'messageFormatPattern')) {
    throw new Error('Message AST is not of type: "messageFormatPattern"');
  }

  var elements = ast.elements,
      pattern = [];
  var i, len, element;

  for (i = 0, len = elements.length; i < len; i += 1) {
    element = elements[i];

    switch (element.type) {
      case 'messageTextElement':
        pattern.push(this.compileMessageText(element));
        break;

      case 'argumentElement':
        pattern.push(this.compileArgument(element));
        break;

      default:
        throw new Error('Message element does not have a valid type');
    }
  }

  return pattern;
};

Compiler.prototype.compileMessageText = function (element) {
  // When this `element` is part of plural sub-pattern and its value contains
  // an unescaped '#', use a `PluralOffsetString` helper to properly output
  // the number with the correct offset in the string.
  if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
    // Create a cache a NumberFormat instance that can be reused for any
    // PluralOffsetString instance in this message.
    if (!this.pluralNumberFormat) {
      this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
    }

    return new PluralOffsetString(this.currentPlural.id, this.currentPlural.format.offset, this.pluralNumberFormat, element.value);
  } // Unescape the escaped '#'s in the message text.


  return element.value.replace(/\\#/g, '#');
};

Compiler.prototype.compileArgument = function (element) {
  var format = element.format;

  if (!format) {
    return new StringFormat(element.id);
  }

  var formats = this.formats,
      locales = this.locales,
      pluralFn = this.pluralFn,
      options;

  switch (format.type) {
    case 'numberFormat':
      options = formats.number[format.style];
      return {
        id: element.id,
        format: new Intl.NumberFormat(locales, options).format
      };

    case 'dateFormat':
      options = formats.date[format.style];
      return {
        id: element.id,
        format: new Intl.DateTimeFormat(locales, options).format
      };

    case 'timeFormat':
      options = formats.time[format.style];
      return {
        id: element.id,
        format: new Intl.DateTimeFormat(locales, options).format
      };

    case 'pluralFormat':
      options = this.compileOptions(element);
      return new PluralFormat(element.id, format.ordinal, format.offset, options, pluralFn);

    case 'selectFormat':
      options = this.compileOptions(element);
      return new SelectFormat(element.id, options);

    default:
      throw new Error('Message element does not have a valid format type');
  }
};

Compiler.prototype.compileOptions = function (element) {
  var format = element.format,
      options = format.options,
      optionsHash = {}; // Save the current plural element, if any, then set it to a new value when
  // compiling the options sub-patterns. This conforms the spec's algorithm
  // for handling `"#"` syntax in message text.

  this.pluralStack.push(this.currentPlural);
  this.currentPlural = format.type === 'pluralFormat' ? element : null;
  var i, len, option;

  for (i = 0, len = options.length; i < len; i += 1) {
    option = options[i]; // Compile the sub-pattern and save it under the options's selector.

    optionsHash[option.selector] = this.compileMessage(option.value);
  } // Pop the plural stack to put back the original current plural value.


  this.currentPlural = this.pluralStack.pop();
  return optionsHash;
}; // -- Compiler Helper Classes --------------------------------------------------


function StringFormat(id) {
  this.id = id;
}

StringFormat.prototype.format = function (value) {
  if (!value && typeof value !== 'number') {
    return '';
  }

  return typeof value === 'string' ? value : String(value);
};

function PluralFormat(id, useOrdinal, offset, options, pluralFn) {
  this.id = id;
  this.useOrdinal = useOrdinal;
  this.offset = offset;
  this.options = options;
  this.pluralFn = pluralFn;
}

PluralFormat.prototype.getOption = function (value) {
  var options = this.options;
  var option = options['=' + value] || options[this.pluralFn(value - this.offset, this.useOrdinal)];
  return option || options.other;
};

function PluralOffsetString(id, offset, numberFormat, string) {
  this.id = id;
  this.offset = offset;
  this.numberFormat = numberFormat;
  this.string = string;
}

PluralOffsetString.prototype.format = function (value) {
  var number = this.numberFormat.format(value - this.offset);
  return this.string.replace(/(^|[^\\])#/g, '$1' + number).replace(/\\#/g, '#');
};

function SelectFormat(id, options) {
  this.id = id;
  this.options = options;
}

SelectFormat.prototype.getOption = function (value) {
  var options = this.options;
  return options[value] || options.other;
};

var parser = (function () {
  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() {
      this.constructor = child;
    }

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message = message;
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        peg$FAILED = {},
        peg$startRuleFunctions = {
      start: peg$parsestart
    },
        peg$startRuleFunction = peg$parsestart,
        peg$c0 = function (elements) {
      return {
        type: 'messageFormatPattern',
        elements: elements,
        location: location()
      };
    },
        peg$c1 = function (text) {
      var string = '',
          i,
          j,
          outerLen,
          inner,
          innerLen;

      for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
        inner = text[i];

        for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
          string += inner[j];
        }
      }

      return string;
    },
        peg$c2 = function (messageText) {
      return {
        type: 'messageTextElement',
        value: messageText,
        location: location()
      };
    },
        peg$c3 = /^[^ \t\n\r,.+={}#]/,
        peg$c4 = {
      type: "class",
      value: "[^ \\t\\n\\r,.+={}#]",
      description: "[^ \\t\\n\\r,.+={}#]"
    },
        peg$c5 = "{",
        peg$c6 = {
      type: "literal",
      value: "{",
      description: "\"{\""
    },
        peg$c7 = ",",
        peg$c8 = {
      type: "literal",
      value: ",",
      description: "\",\""
    },
        peg$c9 = "}",
        peg$c10 = {
      type: "literal",
      value: "}",
      description: "\"}\""
    },
        peg$c11 = function (id, format) {
      return {
        type: 'argumentElement',
        id: id,
        format: format && format[2],
        location: location()
      };
    },
        peg$c12 = "number",
        peg$c13 = {
      type: "literal",
      value: "number",
      description: "\"number\""
    },
        peg$c14 = "date",
        peg$c15 = {
      type: "literal",
      value: "date",
      description: "\"date\""
    },
        peg$c16 = "time",
        peg$c17 = {
      type: "literal",
      value: "time",
      description: "\"time\""
    },
        peg$c18 = function (type, style) {
      return {
        type: type + 'Format',
        style: style && style[2],
        location: location()
      };
    },
        peg$c19 = "plural",
        peg$c20 = {
      type: "literal",
      value: "plural",
      description: "\"plural\""
    },
        peg$c21 = function (pluralStyle) {
      return {
        type: pluralStyle.type,
        ordinal: false,
        offset: pluralStyle.offset || 0,
        options: pluralStyle.options,
        location: location()
      };
    },
        peg$c22 = "selectordinal",
        peg$c23 = {
      type: "literal",
      value: "selectordinal",
      description: "\"selectordinal\""
    },
        peg$c24 = function (pluralStyle) {
      return {
        type: pluralStyle.type,
        ordinal: true,
        offset: pluralStyle.offset || 0,
        options: pluralStyle.options,
        location: location()
      };
    },
        peg$c25 = "select",
        peg$c26 = {
      type: "literal",
      value: "select",
      description: "\"select\""
    },
        peg$c27 = function (options) {
      return {
        type: 'selectFormat',
        options: options,
        location: location()
      };
    },
        peg$c28 = "=",
        peg$c29 = {
      type: "literal",
      value: "=",
      description: "\"=\""
    },
        peg$c30 = function (selector, pattern) {
      return {
        type: 'optionalFormatPattern',
        selector: selector,
        value: pattern,
        location: location()
      };
    },
        peg$c31 = "offset:",
        peg$c32 = {
      type: "literal",
      value: "offset:",
      description: "\"offset:\""
    },
        peg$c33 = function (number) {
      return number;
    },
        peg$c34 = function (offset, options) {
      return {
        type: 'pluralFormat',
        offset: offset,
        options: options,
        location: location()
      };
    },
        peg$c35 = {
      type: "other",
      description: "whitespace"
    },
        peg$c36 = /^[ \t\n\r]/,
        peg$c37 = {
      type: "class",
      value: "[ \\t\\n\\r]",
      description: "[ \\t\\n\\r]"
    },
        peg$c38 = {
      type: "other",
      description: "optionalWhitespace"
    },
        peg$c39 = /^[0-9]/,
        peg$c40 = {
      type: "class",
      value: "[0-9]",
      description: "[0-9]"
    },
        peg$c41 = /^[0-9a-f]/i,
        peg$c42 = {
      type: "class",
      value: "[0-9a-f]i",
      description: "[0-9a-f]i"
    },
        peg$c43 = "0",
        peg$c44 = {
      type: "literal",
      value: "0",
      description: "\"0\""
    },
        peg$c45 = /^[1-9]/,
        peg$c46 = {
      type: "class",
      value: "[1-9]",
      description: "[1-9]"
    },
        peg$c47 = function (digits) {
      return parseInt(digits, 10);
    },
        peg$c48 = /^[^{}\\\0-\x1F \t\n\r]/,
        peg$c49 = {
      type: "class",
      value: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]",
      description: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]"
    },
        peg$c50 = "\\\\",
        peg$c51 = {
      type: "literal",
      value: "\\\\",
      description: "\"\\\\\\\\\""
    },
        peg$c52 = function () {
      return '\\';
    },
        peg$c53 = "\\#",
        peg$c54 = {
      type: "literal",
      value: "\\#",
      description: "\"\\\\#\""
    },
        peg$c55 = function () {
      return '\\#';
    },
        peg$c56 = "\\{",
        peg$c57 = {
      type: "literal",
      value: "\\{",
      description: "\"\\\\{\""
    },
        peg$c58 = function () {
      return '\u007B';
    },
        peg$c59 = "\\}",
        peg$c60 = {
      type: "literal",
      value: "\\}",
      description: "\"\\\\}\""
    },
        peg$c61 = function () {
      return '\u007D';
    },
        peg$c62 = "\\u",
        peg$c63 = {
      type: "literal",
      value: "\\u",
      description: "\"\\\\u\""
    },
        peg$c64 = function (digits) {
      return String.fromCharCode(parseInt(digits, 16));
    },
        peg$c65 = function (chars) {
      return chars.join('');
    },
        peg$currPos = 0,
        peg$savedPos = 0,
        peg$posDetailsCache = [{
      line: 1,
      column: 1,
      seenCR: false
    }],
        peg$maxFailPos = 0,
        peg$maxFailExpected = [],
        peg$silentFails = 0,
        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p,
          ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;

        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line: details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);

          if (ch === "\n") {
            if (!details.seenCR) {
              details.line++;
            }

            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails = peg$computePosDetails(endPos);
      return {
        start: {
          offset: startPos,
          line: startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line: endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) {
        return;
      }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;
        expected.sort(function (a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) {
            return ch.charCodeAt(0).toString(16).toUpperCase();
          }

          return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\x08/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
            return '\\x0' + hex(ch);
          }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
            return '\\x' + hex(ch);
          }).replace(/[\u0100-\u0FFF]/g, function (ch) {
            return '\\u0' + hex(ch);
          }).replace(/[\u1000-\uFFFF]/g, function (ch) {
            return '\\u' + hex(ch);
          });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc,
            foundDesc,
            i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];
        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, location);
    }

    function peg$parsestart() {
      var s0;
      s0 = peg$parsemessageFormatPattern();
      return s0;
    }

    function peg$parsemessageFormatPattern() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsemessageFormatElement();

      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsemessageFormatElement();
      }

      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s1);
      }

      s0 = s1;
      return s0;
    }

    function peg$parsemessageFormatElement() {
      var s0;
      s0 = peg$parsemessageTextElement();

      if (s0 === peg$FAILED) {
        s0 = peg$parseargumentElement();
      }

      return s0;
    }

    function peg$parsemessageText() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parse_();

      if (s3 !== peg$FAILED) {
        s4 = peg$parsechars();

        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();

          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }

      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parse_();

          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();

            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();

              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }

      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1);
      }

      s0 = s1;

      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsews();

        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parsemessageTextElement() {
      var s0, s1;
      s0 = peg$currPos;
      s1 = peg$parsemessageText();

      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c2(s1);
      }

      s0 = s1;
      return s0;
    }

    function peg$parseargument() {
      var s0, s1, s2;
      s0 = peg$parsenumber();

      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];

        if (peg$c3.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c4);
          }
        }

        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);

            if (peg$c3.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c4);
              }
            }
          }
        } else {
          s1 = peg$FAILED;
        }

        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseargumentElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      s0 = peg$currPos;

      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c5;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c6);
        }
      }

      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();

        if (s2 !== peg$FAILED) {
          s3 = peg$parseargument();

          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();

            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;

              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c7;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c8);
                }
              }

              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();

                if (s7 !== peg$FAILED) {
                  s8 = peg$parseelementFormat();

                  if (s8 !== peg$FAILED) {
                    s6 = [s6, s7, s8];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }

              if (s5 === peg$FAILED) {
                s5 = null;
              }

              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();

                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s7 = peg$c9;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;

                    if (peg$silentFails === 0) {
                      peg$fail(peg$c10);
                    }
                  }

                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c11(s3, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseelementFormat() {
      var s0;
      s0 = peg$parsesimpleFormat();

      if (s0 === peg$FAILED) {
        s0 = peg$parsepluralFormat();

        if (s0 === peg$FAILED) {
          s0 = peg$parseselectOrdinalFormat();

          if (s0 === peg$FAILED) {
            s0 = peg$parseselectFormat();
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleFormat() {
      var s0, s1, s2, s3, s4, s5, s6;
      s0 = peg$currPos;

      if (input.substr(peg$currPos, 6) === peg$c12) {
        s1 = peg$c12;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c13);
        }
      }

      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c14) {
          s1 = peg$c14;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c15);
          }
        }

        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c16) {
            s1 = peg$c16;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c17);
            }
          }
        }
      }

      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();

        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;

          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c7;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c8);
            }
          }

          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();

            if (s5 !== peg$FAILED) {
              s6 = peg$parsechars();

              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }

          if (s3 === peg$FAILED) {
            s3 = null;
          }

          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c18(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsepluralFormat() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;

      if (input.substr(peg$currPos, 6) === peg$c19) {
        s1 = peg$c19;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c20);
        }
      }

      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();

        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c8);
            }
          }

          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();

            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();

              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c21(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselectOrdinalFormat() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;

      if (input.substr(peg$currPos, 13) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 13;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c23);
        }
      }

      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();

        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c8);
            }
          }

          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();

            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();

              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c24(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselectFormat() {
      var s0, s1, s2, s3, s4, s5, s6;
      s0 = peg$currPos;

      if (input.substr(peg$currPos, 6) === peg$c25) {
        s1 = peg$c25;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c26);
        }
      }

      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();

        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c8);
            }
          }

          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();

            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseoptionalFormatPattern();

              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseoptionalFormatPattern();
                }
              } else {
                s5 = peg$FAILED;
              }

              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c27(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselector() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$currPos;

      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c28;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c29);
        }
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();

        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }

      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }

      if (s0 === peg$FAILED) {
        s0 = peg$parsechars();
      }

      return s0;
    }

    function peg$parseoptionalFormatPattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      s0 = peg$currPos;
      s1 = peg$parse_();

      if (s1 !== peg$FAILED) {
        s2 = peg$parseselector();

        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();

          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c5;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c6);
              }
            }

            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();

              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();

                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();

                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c9;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;

                      if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                      }
                    }

                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c30(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseoffset() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;

      if (input.substr(peg$currPos, 7) === peg$c31) {
        s1 = peg$c31;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c32);
        }
      }

      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();

        if (s2 !== peg$FAILED) {
          s3 = peg$parsenumber();

          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c33(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsepluralStyle() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$parseoffset();

      if (s1 === peg$FAILED) {
        s1 = null;
      }

      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();

        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseoptionalFormatPattern();

          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseoptionalFormatPattern();
            }
          } else {
            s3 = peg$FAILED;
          }

          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c34(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;
      peg$silentFails++;
      s0 = [];

      if (peg$c36.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c37);
        }
      }

      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);

          if (peg$c36.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c37);
            }
          }
        }
      } else {
        s0 = peg$FAILED;
      }

      peg$silentFails--;

      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c35);
        }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsews();

      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsews();
      }

      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }

      peg$silentFails--;

      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c38);
        }
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c39.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c40);
        }
      }

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c41.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c42);
        }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;

      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c43;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c44);
        }
      }

      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = peg$currPos;

        if (peg$c45.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c46);
          }
        }

        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsedigit();

          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsedigit();
          }

          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }

        if (s2 !== peg$FAILED) {
          s1 = input.substring(s1, peg$currPos);
        } else {
          s1 = s2;
        }
      }

      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c47(s1);
      }

      s0 = s1;
      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      if (peg$c48.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c49);
        }
      }

      if (s0 === peg$FAILED) {
        s0 = peg$currPos;

        if (input.substr(peg$currPos, 2) === peg$c50) {
          s1 = peg$c50;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c51);
          }
        }

        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c52();
        }

        s0 = s1;

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.substr(peg$currPos, 2) === peg$c53) {
            s1 = peg$c53;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c54);
            }
          }

          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c55();
          }

          s0 = s1;

          if (s0 === peg$FAILED) {
            s0 = peg$currPos;

            if (input.substr(peg$currPos, 2) === peg$c56) {
              s1 = peg$c56;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c57);
              }
            }

            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c58();
            }

            s0 = s1;

            if (s0 === peg$FAILED) {
              s0 = peg$currPos;

              if (input.substr(peg$currPos, 2) === peg$c59) {
                s1 = peg$c59;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c60);
                }
              }

              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c61();
              }

              s0 = s1;

              if (s0 === peg$FAILED) {
                s0 = peg$currPos;

                if (input.substr(peg$currPos, 2) === peg$c62) {
                  s1 = peg$c62;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c63);
                  }
                }

                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  s3 = peg$currPos;
                  s4 = peg$parsehexDigit();

                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsehexDigit();

                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsehexDigit();

                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsehexDigit();

                        if (s7 !== peg$FAILED) {
                          s4 = [s4, s5, s6, s7];
                          s3 = s4;
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }

                  if (s3 !== peg$FAILED) {
                    s2 = input.substring(s2, peg$currPos);
                  } else {
                    s2 = s3;
                  }

                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c64(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();

      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechar();
        }
      } else {
        s1 = peg$FAILED;
      }

      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c65(s1);
      }

      s0 = s1;
      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({
          type: "end",
          description: "end of input"
        });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
  };
})();

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

function MessageFormat(message, locales, formats) {
  // Parse string messages into an AST.
  var ast = typeof message === 'string' ? MessageFormat.__parse(message) : message;

  if (!(ast && ast.type === 'messageFormatPattern')) {
    throw new TypeError('A message must be provided as a String or AST.');
  } // Creates a new object with the specified `formats` merged with the default
  // formats.


  formats = this._mergeFormats(MessageFormat.formats, formats); // Defined first because it's used to build the format pattern.

  defineProperty(this, '_locale', {
    value: this._resolveLocale(locales)
  }); // Compile the `ast` to a pattern that is highly optimized for repeated
  // `format()` invocations. **Note:** This passes the `locales` set provided
  // to the constructor instead of just the resolved locale.

  var pluralFn = this._findPluralRuleFunction(this._locale);

  var pattern = this._compilePattern(ast, locales, formats, pluralFn); // "Bind" `format()` method to `this` so it can be passed by reference like
  // the other `Intl` APIs.


  var messageFormat = this;

  this.format = function (values) {
    try {
      return messageFormat._format(pattern, values);
    } catch (e) {
      if (e.variableId) {
        throw new Error('The intl string context variable \'' + e.variableId + '\'' + ' was not provided to the string \'' + message + '\'');
      } else {
        throw e;
      }
    }
  };
} // Default format options used as the prototype of the `formats` provided to the
// constructor. These are used when constructing the internal Intl.NumberFormat
// and Intl.DateTimeFormat instances.


defineProperty(MessageFormat, 'formats', {
  enumerable: true,
  value: {
    number: {
      'currency': {
        style: 'currency'
      },
      'percent': {
        style: 'percent'
      }
    },
    date: {
      'short': {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      },
      'medium': {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      },
      'long': {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      },
      'full': {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    },
    time: {
      'short': {
        hour: 'numeric',
        minute: 'numeric'
      },
      'medium': {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      },
      'long': {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
      },
      'full': {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
      }
    }
  }
}); // Define internal private properties for dealing with locale data.

defineProperty(MessageFormat, '__localeData__', {
  value: objCreate(null)
});
defineProperty(MessageFormat, '__addLocaleData', {
  value: function (data) {
    if (!(data && data.locale)) {
      throw new Error('Locale data provided to IntlMessageFormat is missing a ' + '`locale` property');
    }

    MessageFormat.__localeData__[data.locale.toLowerCase()] = data;
  }
}); // Defines `__parse()` static method as an exposed private.

defineProperty(MessageFormat, '__parse', {
  value: parser.parse
}); // Define public `defaultLocale` property which defaults to English, but can be
// set by the developer.

defineProperty(MessageFormat, 'defaultLocale', {
  enumerable: true,
  writable: true,
  value: undefined
});

MessageFormat.prototype.resolvedOptions = function () {
  // TODO: Provide anything else?
  return {
    locale: this._locale
  };
};

MessageFormat.prototype._compilePattern = function (ast, locales, formats, pluralFn) {
  var compiler = new Compiler(locales, formats, pluralFn);
  return compiler.compile(ast);
};

MessageFormat.prototype._findPluralRuleFunction = function (locale) {
  var localeData = MessageFormat.__localeData__;
  var data = localeData[locale.toLowerCase()]; // The locale data is de-duplicated, so we have to traverse the locale's
  // hierarchy until we find a `pluralRuleFunction` to return.

  while (data) {
    if (data.pluralRuleFunction) {
      return data.pluralRuleFunction;
    }

    data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
  }

  throw new Error('Locale data added to IntlMessageFormat is missing a ' + '`pluralRuleFunction` for :' + locale);
};

MessageFormat.prototype._format = function (pattern, values) {
  var result = '',
      i,
      len,
      part,
      id,
      value,
      err;

  for (i = 0, len = pattern.length; i < len; i += 1) {
    part = pattern[i]; // Exist early for string parts.

    if (typeof part === 'string') {
      result += part;
      continue;
    }

    id = part.id; // Enforce that all required values are provided by the caller.

    if (!(values && hop.call(values, id))) {
      err = new Error('A value must be provided for: ' + id);
      err.variableId = id;
      throw err;
    }

    value = values[id]; // Recursively format plural and select parts' option — which can be a
    // nested pattern structure. The choosing of the option to use is
    // abstracted-by and delegated-to the part helper object.

    if (part.options) {
      result += this._format(part.getOption(value), values);
    } else {
      result += part.format(value);
    }
  }

  return result;
};

MessageFormat.prototype._mergeFormats = function (defaults, formats) {
  var mergedFormats = {},
      type,
      mergedType;

  for (type in defaults) {
    if (!hop.call(defaults, type)) {
      continue;
    }

    mergedFormats[type] = mergedType = objCreate(defaults[type]);

    if (formats && hop.call(formats, type)) {
      extend(mergedType, formats[type]);
    }
  }

  return mergedFormats;
};

MessageFormat.prototype._resolveLocale = function (locales) {
  if (typeof locales === 'string') {
    locales = [locales];
  } // Create a copy of the array so we can push on the default locale.


  locales = (locales || []).concat(MessageFormat.defaultLocale);
  var localeData = MessageFormat.__localeData__;
  var i, len, localeParts, data; // Using the set of locales + the default locale, we look for the first one
  // which that has been registered. When data does not exist for a locale, we
  // traverse its ancestors to find something that's been registered within
  // its hierarchy of locales. Since we lack the proper `parentLocale` data
  // here, we must take a naive approach to traversal.

  for (i = 0, len = locales.length; i < len; i += 1) {
    localeParts = locales[i].toLowerCase().split('-');

    while (localeParts.length) {
      data = localeData[localeParts.join('-')];

      if (data) {
        // Return the normalized locale string; e.g., we return "en-US",
        // instead of "en-us".
        return data.locale;
      }

      localeParts.pop();
    }
  }

  var defaultLocale = locales.pop();
  throw new Error('No locale data has been added to IntlMessageFormat for: ' + locales.join(', ') + ', or the default locale: ' + defaultLocale);
};

// GENERATED FILE
var defaultLocale = {
  "locale": "en",
  "pluralRuleFunction": function (n, ord) {
    var s = String(n).split("."),
        v0 = !s[1],
        t0 = Number(s[0]) == n,
        n10 = t0 && s[0].slice(-1),
        n100 = t0 && s[0].slice(-2);
    if (ord) return n10 == 1 && n100 != 11 ? "one" : n10 == 2 && n100 != 12 ? "two" : n10 == 3 && n100 != 13 ? "few" : "other";
    return n == 1 && v0 ? "one" : "other";
  }
};

/* jslint esnext: true */

MessageFormat.__addLocaleData(defaultLocale);

MessageFormat.defaultLocale = 'en';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var toStr = Object.prototype.toString;

var isArguments = function isArguments(value) {
  var str = toStr.call(value);
  var isArgs = str === '[object Arguments]';

  if (!isArgs) {
    isArgs = str !== '[object Array]' && value !== null && typeof value === 'object' && typeof value.length === 'number' && value.length >= 0 && toStr.call(value.callee) === '[object Function]';
  }

  return isArgs;
};

var has = Object.prototype.hasOwnProperty;
var toStr$1 = Object.prototype.toString;
var slice = Array.prototype.slice;



var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({
  toString: null
}, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];

var equalsConstructorPrototype = function (o) {
  var ctor = o.constructor;
  return ctor && ctor.prototype === o;
};

var excludedKeys = {
  $applicationCache: true,
  $console: true,
  $external: true,
  $frame: true,
  $frameElement: true,
  $frames: true,
  $innerHeight: true,
  $innerWidth: true,
  $outerHeight: true,
  $outerWidth: true,
  $pageXOffset: true,
  $pageYOffset: true,
  $parent: true,
  $scrollLeft: true,
  $scrollTop: true,
  $scrollX: true,
  $scrollY: true,
  $self: true,
  $webkitIndexedDB: true,
  $webkitStorageInfo: true,
  $window: true
};

var hasAutomationEqualityBug = function () {
  /* global window */
  if (typeof window === 'undefined') {
    return false;
  }

  for (var k in window) {
    try {
      if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
        try {
          equalsConstructorPrototype(window[k]);
        } catch (e) {
          return true;
        }
      }
    } catch (e) {
      return true;
    }
  }

  return false;
}();

var equalsConstructorPrototypeIfNotBuggy = function (o) {
  /* global window */
  if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
    return equalsConstructorPrototype(o);
  }

  try {
    return equalsConstructorPrototype(o);
  } catch (e) {
    return false;
  }
};

var keysShim = function keys(object) {
  var isObject = object !== null && typeof object === 'object';
  var isFunction = toStr$1.call(object) === '[object Function]';
  var isArguments$$1 = isArguments(object);
  var isString = isObject && toStr$1.call(object) === '[object String]';
  var theKeys = [];

  if (!isObject && !isFunction && !isArguments$$1) {
    throw new TypeError('Object.keys called on a non-object');
  }

  var skipProto = hasProtoEnumBug && isFunction;

  if (isString && object.length > 0 && !has.call(object, 0)) {
    for (var i = 0; i < object.length; ++i) {
      theKeys.push(String(i));
    }
  }

  if (isArguments$$1 && object.length > 0) {
    for (var j = 0; j < object.length; ++j) {
      theKeys.push(String(j));
    }
  } else {
    for (var name in object) {
      if (!(skipProto && name === 'prototype') && has.call(object, name)) {
        theKeys.push(String(name));
      }
    }
  }

  if (hasDontEnumBug) {
    var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

    for (var k = 0; k < dontEnums.length; ++k) {
      if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
        theKeys.push(dontEnums[k]);
      }
    }
  }

  return theKeys;
};

keysShim.shim = function shimObjectKeys() {
  if (Object.keys) {
    var keysWorksWithArguments = function () {
      // Safari 5.0 bug
      return (Object.keys(arguments) || '').length === 2;
    }(1, 2);

    if (!keysWorksWithArguments) {
      var originalKeys = Object.keys;

      Object.keys = function keys(object) {
        // eslint-disable-line func-name-matching
        if (isArguments(object)) {
          return originalKeys(slice.call(object));
        } else {
          return originalKeys(object);
        }
      };
    }
  } else {
    Object.keys = keysShim;
  }

  return Object.keys || keysShim;
};

var objectKeys = keysShim;

var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';
var toStr$2 = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction = function (fn) {
  return typeof fn === 'function' && toStr$2.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
  var obj = {};

  try {
    origDefineProperty(obj, 'x', {
      enumerable: false,
      value: obj
    }); // eslint-disable-next-line no-unused-vars, no-restricted-syntax

    for (var _ in obj) {
      // jscs:ignore disallowUnusedVariables
      return false;
    }

    return obj.x === obj;
  } catch (e) {
    /* this is IE 8. */
    return false;
  }
};

var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

var defineProperty$1 = function (object, name, value, predicate) {
  if (name in object && (!isFunction(predicate) || !predicate())) {
    return;
  }

  if (supportsDescriptors) {
    origDefineProperty(object, name, {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    });
  } else {
    object[name] = value;
  }
};

var defineProperties = function (object, map) {
  var predicates = arguments.length > 2 ? arguments[2] : {};
  var props = objectKeys(map);

  if (hasSymbols) {
    props = concat.call(props, Object.getOwnPropertySymbols(map));
  }

  for (var i = 0; i < props.length; i += 1) {
    defineProperty$1(object, props[i], map[props[i]], predicates[props[i]]);
  }
};

defineProperties.supportsDescriptors = !!supportsDescriptors;
var defineProperties_1 = defineProperties;

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice$1 = Array.prototype.slice;
var toStr$3 = Object.prototype.toString;
var funcType = '[object Function]';

var implementation = function bind(that) {
  var target = this;

  if (typeof target !== 'function' || toStr$3.call(target) !== funcType) {
    throw new TypeError(ERROR_MESSAGE + target);
  }

  var args = slice$1.call(arguments, 1);
  var bound;

  var binder = function () {
    if (this instanceof bound) {
      var result = target.apply(this, args.concat(slice$1.call(arguments)));

      if (Object(result) === result) {
        return result;
      }

      return this;
    } else {
      return target.apply(that, args.concat(slice$1.call(arguments)));
    }
  };

  var boundLength = Math.max(0, target.length - args.length);
  var boundArgs = [];

  for (var i = 0; i < boundLength; i++) {
    boundArgs.push('$' + i);
  }

  bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

  if (target.prototype) {
    var Empty = function Empty() {};

    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }

  return bound;
};

var functionBind = Function.prototype.bind || implementation;

var src = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

var isPrimitive = function isPrimitive(value) {
  return value === null || typeof value !== 'function' && typeof value !== 'object';
};

var fnToStr = Function.prototype.toString;
var constructorRegex = /^\s*class\b/;

var isES6ClassFn = function isES6ClassFunction(value) {
  try {
    var fnStr = fnToStr.call(value);
    return constructorRegex.test(fnStr);
  } catch (e) {
    return false; // not a function
  }
};

var tryFunctionObject = function tryFunctionToStr(value) {
  try {
    if (isES6ClassFn(value)) {
      return false;
    }

    fnToStr.call(value);
    return true;
  } catch (e) {
    return false;
  }
};

var toStr$4 = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

var isCallable = function isCallable(value) {
  if (!value) {
    return false;
  }

  if (typeof value !== 'function' && typeof value !== 'object') {
    return false;
  }

  if (typeof value === 'function' && !value.prototype) {
    return true;
  }

  if (hasToStringTag) {
    return tryFunctionObject(value);
  }

  if (isES6ClassFn(value)) {
    return false;
  }

  var strClass = toStr$4.call(value);
  return strClass === fnClass || strClass === genClass;
};

var getDay = Date.prototype.getDay;

var tryDateObject = function tryDateObject(value) {
  try {
    getDay.call(value);
    return true;
  } catch (e) {
    return false;
  }
};

var toStr$5 = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag$1 = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

var isDateObject = function isDateObject(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return hasToStringTag$1 ? tryDateObject(value) : toStr$5.call(value) === dateClass;
};

/* eslint complexity: [2, 17], max-statements: [2, 33] */

var shams = function hasSymbols() {
  if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
    return false;
  }

  if (typeof Symbol.iterator === 'symbol') {
    return true;
  }

  var obj = {};
  var sym = Symbol('test');
  var symObj = Object(sym);

  if (typeof sym === 'string') {
    return false;
  }

  if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
    return false;
  }

  if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
    return false;
  } // temp disabled per https://github.com/ljharb/object.assign/issues/17
  // if (sym instanceof Symbol) { return false; }
  // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
  // if (!(symObj instanceof Symbol)) { return false; }
  // if (typeof Symbol.prototype.toString !== 'function') { return false; }
  // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }


  var symVal = 42;
  obj[sym] = symVal;

  for (sym in obj) {
    return false;
  } // eslint-disable-line no-restricted-syntax


  if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
    return false;
  }

  if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
    return false;
  }

  var syms = Object.getOwnPropertySymbols(obj);

  if (syms.length !== 1 || syms[0] !== sym) {
    return false;
  }

  if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
    return false;
  }

  if (typeof Object.getOwnPropertyDescriptor === 'function') {
    var descriptor = Object.getOwnPropertyDescriptor(obj, sym);

    if (descriptor.value !== symVal || descriptor.enumerable !== true) {
      return false;
    }
  }

  return true;
};

var origSymbol = commonjsGlobal.Symbol;



var hasSymbols$1 = function hasNativeSymbols() {
  if (typeof origSymbol !== 'function') {
    return false;
  }

  if (typeof Symbol !== 'function') {
    return false;
  }

  if (typeof origSymbol('foo') !== 'symbol') {
    return false;
  }

  if (typeof Symbol('bar') !== 'symbol') {
    return false;
  }

  return shams();
};

var isSymbol = createCommonjsModule(function (module) {

var toStr = Object.prototype.toString;

var hasSymbols = hasSymbols$1();

if (hasSymbols) {
  var symToStr = Symbol.prototype.toString;
  var symStringRegex = /^Symbol\(.*\)$/;

  var isSymbolObject = function isRealSymbolObject(value) {
    if (typeof value.valueOf() !== 'symbol') {
      return false;
    }

    return symStringRegex.test(symToStr.call(value));
  };

  module.exports = function isSymbol(value) {
    if (typeof value === 'symbol') {
      return true;
    }

    if (toStr.call(value) !== '[object Symbol]') {
      return false;
    }

    try {
      return isSymbolObject(value);
    } catch (e) {
      return false;
    }
  };
} else {
  module.exports = function isSymbol(value) {
    // this environment does not support Symbols.
    return false;
  };
}
});

var hasSymbols$2 = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';









var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
  if (typeof O === 'undefined' || O === null) {
    throw new TypeError('Cannot call method on ' + O);
  }

  if (typeof hint !== 'string' || hint !== 'number' && hint !== 'string') {
    throw new TypeError('hint must be "string" or "number"');
  }

  var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
  var method, result, i;

  for (i = 0; i < methodNames.length; ++i) {
    method = O[methodNames[i]];

    if (isCallable(method)) {
      result = method.call(O);

      if (isPrimitive(result)) {
        return result;
      }
    }
  }

  throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
  var func = O[P];

  if (func !== null && typeof func !== 'undefined') {
    if (!isCallable(func)) {
      throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
    }

    return func;
  }

  return void 0;
}; // http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive


var es2015 = function ToPrimitive(input) {
  if (isPrimitive(input)) {
    return input;
  }

  var hint = 'default';

  if (arguments.length > 1) {
    if (arguments[1] === String) {
      hint = 'string';
    } else if (arguments[1] === Number) {
      hint = 'number';
    }
  }

  var exoticToPrim;

  if (hasSymbols$2) {
    if (Symbol.toPrimitive) {
      exoticToPrim = GetMethod(input, Symbol.toPrimitive);
    } else if (isSymbol(input)) {
      exoticToPrim = Symbol.prototype.valueOf;
    }
  }

  if (typeof exoticToPrim !== 'undefined') {
    var result = exoticToPrim.call(input, hint);

    if (isPrimitive(result)) {
      return result;
    }

    throw new TypeError('unable to convert exotic object to primitive');
  }

  if (hint === 'default' && (isDateObject(input) || isSymbol(input))) {
    hint = 'string';
  }

  return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

var es6 = es2015;

/* globals
	Set,
	Map,
	WeakSet,
	WeakMap,

	Promise,

	Symbol,
	Proxy,

	Atomics,
	SharedArrayBuffer,

	ArrayBuffer,
	DataView,
	Uint8Array,
	Float32Array,
	Float64Array,
	Int8Array,
	Int16Array,
	Int32Array,
	Uint8ClampedArray,
	Uint16Array,
	Uint32Array,
*/

var undefined$1; // eslint-disable-line no-shadow-restricted-names

var ThrowTypeError = Object.getOwnPropertyDescriptor ? function () {
  return Object.getOwnPropertyDescriptor(arguments, 'callee').get;
}() : function () {
  throw new TypeError();
};
var hasSymbols$3 = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var getProto = Object.getPrototypeOf || function (x) {
  return x.__proto__;
}; // eslint-disable-line no-proto

var generatorFunction = undefined$1;

var asyncFunction = undefined$1;

var asyncGenFunction = undefined$1;
var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto(Uint8Array);
var INTRINSICS = {
  '$ %Array%': Array,
  '$ %ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
  '$ %ArrayBufferPrototype%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer.prototype,
  '$ %ArrayIteratorPrototype%': hasSymbols$3 ? getProto([][Symbol.iterator]()) : undefined$1,
  '$ %ArrayPrototype%': Array.prototype,
  '$ %ArrayProto_entries%': Array.prototype.entries,
  '$ %ArrayProto_forEach%': Array.prototype.forEach,
  '$ %ArrayProto_keys%': Array.prototype.keys,
  '$ %ArrayProto_values%': Array.prototype.values,
  '$ %AsyncFromSyncIteratorPrototype%': undefined$1,
  '$ %AsyncFunction%': asyncFunction,
  '$ %AsyncFunctionPrototype%': undefined$1,
  '$ %AsyncGenerator%': undefined$1,
  '$ %AsyncGeneratorFunction%': asyncGenFunction,
  '$ %AsyncGeneratorPrototype%': undefined$1,
  '$ %AsyncIteratorPrototype%': undefined$1,
  '$ %Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
  '$ %Boolean%': Boolean,
  '$ %BooleanPrototype%': Boolean.prototype,
  '$ %DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
  '$ %DataViewPrototype%': typeof DataView === 'undefined' ? undefined$1 : DataView.prototype,
  '$ %Date%': Date,
  '$ %DatePrototype%': Date.prototype,
  '$ %decodeURI%': decodeURI,
  '$ %decodeURIComponent%': decodeURIComponent,
  '$ %encodeURI%': encodeURI,
  '$ %encodeURIComponent%': encodeURIComponent,
  '$ %Error%': Error,
  '$ %ErrorPrototype%': Error.prototype,
  '$ %eval%': eval,
  // eslint-disable-line no-eval
  '$ %EvalError%': EvalError,
  '$ %EvalErrorPrototype%': EvalError.prototype,
  '$ %Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
  '$ %Float32ArrayPrototype%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array.prototype,
  '$ %Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
  '$ %Float64ArrayPrototype%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array.prototype,
  '$ %Function%': Function,
  '$ %FunctionPrototype%': Function.prototype,
  '$ %Generator%': undefined$1,
  '$ %GeneratorFunction%': generatorFunction,
  '$ %GeneratorPrototype%': undefined$1,
  '$ %Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
  '$ %Int8ArrayPrototype%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array.prototype,
  '$ %Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
  '$ %Int16ArrayPrototype%': typeof Int16Array === 'undefined' ? undefined$1 : Int8Array.prototype,
  '$ %Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
  '$ %Int32ArrayPrototype%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array.prototype,
  '$ %isFinite%': isFinite,
  '$ %isNaN%': isNaN,
  '$ %IteratorPrototype%': hasSymbols$3 ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
  '$ %JSON%': JSON,
  '$ %JSONParse%': JSON.parse,
  '$ %Map%': typeof Map === 'undefined' ? undefined$1 : Map,
  '$ %MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols$3 ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
  '$ %MapPrototype%': typeof Map === 'undefined' ? undefined$1 : Map.prototype,
  '$ %Math%': Math,
  '$ %Number%': Number,
  '$ %NumberPrototype%': Number.prototype,
  '$ %Object%': Object,
  '$ %ObjectPrototype%': Object.prototype,
  '$ %ObjProto_toString%': Object.prototype.toString,
  '$ %ObjProto_valueOf%': Object.prototype.valueOf,
  '$ %parseFloat%': parseFloat,
  '$ %parseInt%': parseInt,
  '$ %Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
  '$ %PromisePrototype%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype,
  '$ %PromiseProto_then%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype.then,
  '$ %Promise_all%': typeof Promise === 'undefined' ? undefined$1 : Promise.all,
  '$ %Promise_reject%': typeof Promise === 'undefined' ? undefined$1 : Promise.reject,
  '$ %Promise_resolve%': typeof Promise === 'undefined' ? undefined$1 : Promise.resolve,
  '$ %Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
  '$ %RangeError%': RangeError,
  '$ %RangeErrorPrototype%': RangeError.prototype,
  '$ %ReferenceError%': ReferenceError,
  '$ %ReferenceErrorPrototype%': ReferenceError.prototype,
  '$ %Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
  '$ %RegExp%': RegExp,
  '$ %RegExpPrototype%': RegExp.prototype,
  '$ %Set%': typeof Set === 'undefined' ? undefined$1 : Set,
  '$ %SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols$3 ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
  '$ %SetPrototype%': typeof Set === 'undefined' ? undefined$1 : Set.prototype,
  '$ %SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
  '$ %SharedArrayBufferPrototype%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer.prototype,
  '$ %String%': String,
  '$ %StringIteratorPrototype%': hasSymbols$3 ? getProto(''[Symbol.iterator]()) : undefined$1,
  '$ %StringPrototype%': String.prototype,
  '$ %Symbol%': hasSymbols$3 ? Symbol : undefined$1,
  '$ %SymbolPrototype%': hasSymbols$3 ? Symbol.prototype : undefined$1,
  '$ %SyntaxError%': SyntaxError,
  '$ %SyntaxErrorPrototype%': SyntaxError.prototype,
  '$ %ThrowTypeError%': ThrowTypeError,
  '$ %TypedArray%': TypedArray,
  '$ %TypedArrayPrototype%': TypedArray ? TypedArray.prototype : undefined$1,
  '$ %TypeError%': TypeError,
  '$ %TypeErrorPrototype%': TypeError.prototype,
  '$ %Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
  '$ %Uint8ArrayPrototype%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array.prototype,
  '$ %Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
  '$ %Uint8ClampedArrayPrototype%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray.prototype,
  '$ %Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
  '$ %Uint16ArrayPrototype%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array.prototype,
  '$ %Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
  '$ %Uint32ArrayPrototype%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array.prototype,
  '$ %URIError%': URIError,
  '$ %URIErrorPrototype%': URIError.prototype,
  '$ %WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
  '$ %WeakMapPrototype%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap.prototype,
  '$ %WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet,
  '$ %WeakSetPrototype%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet.prototype
};

var GetIntrinsic = function GetIntrinsic(name, allowMissing) {
  if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
    throw new TypeError('"allowMissing" argument must be a boolean');
  }

  var key = '$ ' + name;

  if (!(key in INTRINSICS)) {
    throw new SyntaxError('intrinsic ' + name + ' does not exist!');
  } // istanbul ignore if // hopefully this is impossible to test :-)


  if (typeof INTRINSICS[key] === 'undefined' && !allowMissing) {
    throw new TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
  }

  return INTRINSICS[key];
};

var _isNaN = Number.isNaN || function isNaN(a) {
  return a !== a;
};

var $isNaN = Number.isNaN || function (a) {
  return a !== a;
};

var _isFinite = Number.isFinite || function (x) {
  return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity;
};

var has$1 = functionBind.call(Function.call, Object.prototype.hasOwnProperty);
var $assign = Object.assign;

var assign = function assign(target, source) {
  if ($assign) {
    return $assign(target, source);
  }

  for (var key in source) {
    if (has$1(source, key)) {
      target[key] = source[key];
    }
  }

  return target;
};

var sign = function sign(number) {
  return number >= 0 ? 1 : -1;
};

var mod = function mod(number, modulo) {
  var remain = number % modulo;
  return Math.floor(remain >= 0 ? remain : remain + modulo);
};

var isPrimitive$1 = function isPrimitive(value) {
  return value === null || typeof value !== 'function' && typeof value !== 'object';
};

var toStr$6 = Object.prototype.toString;



 // http://ecma-international.org/ecma-262/5.1/#sec-8.12.8


var ES5internalSlots = {
  '[[DefaultValue]]': function (O) {
    var actualHint;

    if (arguments.length > 1) {
      actualHint = arguments[1];
    } else {
      actualHint = toStr$6.call(O) === '[object Date]' ? String : Number;
    }

    if (actualHint === String || actualHint === Number) {
      var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
      var value, i;

      for (i = 0; i < methods.length; ++i) {
        if (isCallable(O[methods[i]])) {
          value = O[methods[i]]();

          if (isPrimitive(value)) {
            return value;
          }
        }
      }

      throw new TypeError('No default value');
    }

    throw new TypeError('invalid [[DefaultValue]] hint supplied');
  }
}; // http://ecma-international.org/ecma-262/5.1/#sec-9.1

var es5 = function ToPrimitive(input) {
  if (isPrimitive(input)) {
    return input;
  }

  if (arguments.length > 1) {
    return ES5internalSlots['[[DefaultValue]]'](input, arguments[1]);
  }

  return ES5internalSlots['[[DefaultValue]]'](input);
};

var $Object = GetIntrinsic('%Object%');
var $TypeError = GetIntrinsic('%TypeError%');
var $String = GetIntrinsic('%String%');













 // https://es5.github.io/#x9


var ES5 = {
  ToPrimitive: es5,
  ToBoolean: function ToBoolean(value) {
    return !!value;
  },
  ToNumber: function ToNumber(value) {
    return +value; // eslint-disable-line no-implicit-coercion
  },
  ToInteger: function ToInteger(value) {
    var number = this.ToNumber(value);

    if (_isNaN(number)) {
      return 0;
    }

    if (number === 0 || !_isFinite(number)) {
      return number;
    }

    return sign(number) * Math.floor(Math.abs(number));
  },
  ToInt32: function ToInt32(x) {
    return this.ToNumber(x) >> 0;
  },
  ToUint32: function ToUint32(x) {
    return this.ToNumber(x) >>> 0;
  },
  ToUint16: function ToUint16(value) {
    var number = this.ToNumber(value);

    if (_isNaN(number) || number === 0 || !_isFinite(number)) {
      return 0;
    }

    var posInt = sign(number) * Math.floor(Math.abs(number));
    return mod(posInt, 0x10000);
  },
  ToString: function ToString(value) {
    return $String(value);
  },
  ToObject: function ToObject(value) {
    this.CheckObjectCoercible(value);
    return $Object(value);
  },
  CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
    /* jshint eqnull:true */
    if (value == null) {
      throw new $TypeError(optMessage || 'Cannot call method on ' + value);
    }

    return value;
  },
  IsCallable: isCallable,
  SameValue: function SameValue(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical.
      if (x === 0) {
        return 1 / x === 1 / y;
      }

      return true;
    }

    return _isNaN(x) && _isNaN(y);
  },
  // https://www.ecma-international.org/ecma-262/5.1/#sec-8
  Type: function Type(x) {
    if (x === null) {
      return 'Null';
    }

    if (typeof x === 'undefined') {
      return 'Undefined';
    }

    if (typeof x === 'function' || typeof x === 'object') {
      return 'Object';
    }

    if (typeof x === 'number') {
      return 'Number';
    }

    if (typeof x === 'boolean') {
      return 'Boolean';
    }

    if (typeof x === 'string') {
      return 'String';
    }
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type
  IsPropertyDescriptor: function IsPropertyDescriptor(Desc) {
    if (this.Type(Desc) !== 'Object') {
      return false;
    }

    var allowed = {
      '[[Configurable]]': true,
      '[[Enumerable]]': true,
      '[[Get]]': true,
      '[[Set]]': true,
      '[[Value]]': true,
      '[[Writable]]': true
    }; // jscs:disable

    for (var key in Desc) {
      // eslint-disable-line
      if (src(Desc, key) && !allowed[key]) {
        return false;
      }
    } // jscs:enable


    var isData = src(Desc, '[[Value]]');
    var IsAccessor = src(Desc, '[[Get]]') || src(Desc, '[[Set]]');

    if (isData && IsAccessor) {
      throw new $TypeError('Property Descriptors may not be both accessor and data descriptors');
    }

    return true;
  },
  // https://ecma-international.org/ecma-262/5.1/#sec-8.10.1
  IsAccessorDescriptor: function IsAccessorDescriptor(Desc) {
    if (typeof Desc === 'undefined') {
      return false;
    }

    if (!this.IsPropertyDescriptor(Desc)) {
      throw new $TypeError('Desc must be a Property Descriptor');
    }

    if (!src(Desc, '[[Get]]') && !src(Desc, '[[Set]]')) {
      return false;
    }

    return true;
  },
  // https://ecma-international.org/ecma-262/5.1/#sec-8.10.2
  IsDataDescriptor: function IsDataDescriptor(Desc) {
    if (typeof Desc === 'undefined') {
      return false;
    }

    if (!this.IsPropertyDescriptor(Desc)) {
      throw new $TypeError('Desc must be a Property Descriptor');
    }

    if (!src(Desc, '[[Value]]') && !src(Desc, '[[Writable]]')) {
      return false;
    }

    return true;
  },
  // https://ecma-international.org/ecma-262/5.1/#sec-8.10.3
  IsGenericDescriptor: function IsGenericDescriptor(Desc) {
    if (typeof Desc === 'undefined') {
      return false;
    }

    if (!this.IsPropertyDescriptor(Desc)) {
      throw new $TypeError('Desc must be a Property Descriptor');
    }

    if (!this.IsAccessorDescriptor(Desc) && !this.IsDataDescriptor(Desc)) {
      return true;
    }

    return false;
  },
  // https://ecma-international.org/ecma-262/5.1/#sec-8.10.4
  FromPropertyDescriptor: function FromPropertyDescriptor(Desc) {
    if (typeof Desc === 'undefined') {
      return Desc;
    }

    if (!this.IsPropertyDescriptor(Desc)) {
      throw new $TypeError('Desc must be a Property Descriptor');
    }

    if (this.IsDataDescriptor(Desc)) {
      return {
        value: Desc['[[Value]]'],
        writable: !!Desc['[[Writable]]'],
        enumerable: !!Desc['[[Enumerable]]'],
        configurable: !!Desc['[[Configurable]]']
      };
    } else if (this.IsAccessorDescriptor(Desc)) {
      return {
        get: Desc['[[Get]]'],
        set: Desc['[[Set]]'],
        enumerable: !!Desc['[[Enumerable]]'],
        configurable: !!Desc['[[Configurable]]']
      };
    } else {
      throw new $TypeError('FromPropertyDescriptor must be called with a fully populated Property Descriptor');
    }
  },
  // https://ecma-international.org/ecma-262/5.1/#sec-8.10.5
  ToPropertyDescriptor: function ToPropertyDescriptor(Obj) {
    if (this.Type(Obj) !== 'Object') {
      throw new $TypeError('ToPropertyDescriptor requires an object');
    }

    var desc = {};

    if (src(Obj, 'enumerable')) {
      desc['[[Enumerable]]'] = this.ToBoolean(Obj.enumerable);
    }

    if (src(Obj, 'configurable')) {
      desc['[[Configurable]]'] = this.ToBoolean(Obj.configurable);
    }

    if (src(Obj, 'value')) {
      desc['[[Value]]'] = Obj.value;
    }

    if (src(Obj, 'writable')) {
      desc['[[Writable]]'] = this.ToBoolean(Obj.writable);
    }

    if (src(Obj, 'get')) {
      var getter = Obj.get;

      if (typeof getter !== 'undefined' && !this.IsCallable(getter)) {
        throw new TypeError('getter must be a function');
      }

      desc['[[Get]]'] = getter;
    }

    if (src(Obj, 'set')) {
      var setter = Obj.set;

      if (typeof setter !== 'undefined' && !this.IsCallable(setter)) {
        throw new $TypeError('setter must be a function');
      }

      desc['[[Set]]'] = setter;
    }

    if ((src(desc, '[[Get]]') || src(desc, '[[Set]]')) && (src(desc, '[[Value]]') || src(desc, '[[Writable]]'))) {
      throw new $TypeError('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
    }

    return desc;
  }
};
var es5$1 = ES5;

var regexExec = RegExp.prototype.exec;
var gOPD = Object.getOwnPropertyDescriptor;

var tryRegexExecCall = function tryRegexExec(value) {
  try {
    var lastIndex = value.lastIndex;
    value.lastIndex = 0;
    regexExec.call(value);
    return true;
  } catch (e) {
    return false;
  } finally {
    value.lastIndex = lastIndex;
  }
};

var toStr$7 = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag$2 = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

var isRegex = function isRegex(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (!hasToStringTag$2) {
    return toStr$7.call(value) === regexClass;
  }

  var descriptor = gOPD(value, 'lastIndex');
  var hasLastIndexDataProperty = descriptor && src(descriptor, 'value');

  if (!hasLastIndexDataProperty) {
    return false;
  }

  return tryRegexExecCall(value);
};

var $TypeError$1 = GetIntrinsic('%TypeError%');
var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $Array = GetIntrinsic('%Array%');
var $String$1 = GetIntrinsic('%String%');
var $Object$1 = GetIntrinsic('%Object%');
var $Number = GetIntrinsic('%Number%');
var $Symbol = GetIntrinsic('%Symbol%', true);
var $RegExp = GetIntrinsic('%RegExp%');
var hasSymbols$4 = !!$Symbol;





var MAX_SAFE_INTEGER = $Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;









var parseInteger = parseInt;



var arraySlice = functionBind.call(Function.call, $Array.prototype.slice);
var strSlice = functionBind.call(Function.call, $String$1.prototype.slice);
var isBinary = functionBind.call(Function.call, $RegExp.prototype.test, /^0b[01]+$/i);
var isOctal = functionBind.call(Function.call, $RegExp.prototype.test, /^0o[0-7]+$/i);
var regexExec$1 = functionBind.call(Function.call, $RegExp.prototype.exec);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new $RegExp('[' + nonWS + ']', 'g');
var hasNonWS = functionBind.call(Function.call, $RegExp.prototype.test, nonWSregex);
var invalidHexLiteral = /^[-+]0x[0-9a-f]+$/i;
var isInvalidHexLiteral = functionBind.call(Function.call, $RegExp.prototype.test, invalidHexLiteral);
var $charCodeAt = functionBind.call(Function.call, $String$1.prototype.charCodeAt);
var toStr$8 = functionBind.call(Function.call, Object.prototype.toString);
var $floor = Math.floor;
var $abs = Math.abs;
var $ObjectCreate = Object.create;
var $gOPD = $Object$1.getOwnPropertyDescriptor;
var $isExtensible = $Object$1.isExtensible; // whitespace from: http://es5.github.io/#x15.5.4.20
// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324

var ws = ['\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003', '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028', '\u2029\uFEFF'].join('');
var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
var replace = functionBind.call(Function.call, $String$1.prototype.replace);

var trim = function (value) {
  return replace(value, trimRegex, '');
};



 // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations


var ES6 = assign(assign({}, es5$1), {
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
  Call: function Call(F, V) {
    var args = arguments.length > 2 ? arguments[2] : [];

    if (!this.IsCallable(F)) {
      throw new $TypeError$1(F + ' is not a function');
    }

    return F.apply(V, args);
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
  ToPrimitive: es6,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
  // ToBoolean: ES5.ToBoolean,
  // https://ecma-international.org/ecma-262/6.0/#sec-tonumber
  ToNumber: function ToNumber(argument) {
    var value = isPrimitive$1(argument) ? argument : es6(argument, $Number);

    if (typeof value === 'symbol') {
      throw new $TypeError$1('Cannot convert a Symbol value to a number');
    }

    if (typeof value === 'string') {
      if (isBinary(value)) {
        return this.ToNumber(parseInteger(strSlice(value, 2), 2));
      } else if (isOctal(value)) {
        return this.ToNumber(parseInteger(strSlice(value, 2), 8));
      } else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
        return NaN;
      } else {
        var trimmed = trim(value);

        if (trimmed !== value) {
          return this.ToNumber(trimmed);
        }
      }
    }

    return $Number(value);
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
  // ToInteger: ES5.ToNumber,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
  // ToInt32: ES5.ToInt32,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
  // ToUint32: ES5.ToUint32,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
  ToInt16: function ToInt16(argument) {
    var int16bit = this.ToUint16(argument);
    return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
  // ToUint16: ES5.ToUint16,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
  ToInt8: function ToInt8(argument) {
    var int8bit = this.ToUint8(argument);
    return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
  ToUint8: function ToUint8(argument) {
    var number = this.ToNumber(argument);

    if (_isNaN(number) || number === 0 || !_isFinite(number)) {
      return 0;
    }

    var posInt = sign(number) * $floor($abs(number));
    return mod(posInt, 0x100);
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
  ToUint8Clamp: function ToUint8Clamp(argument) {
    var number = this.ToNumber(argument);

    if (_isNaN(number) || number <= 0) {
      return 0;
    }

    if (number >= 0xFF) {
      return 0xFF;
    }

    var f = $floor(argument);

    if (f + 0.5 < number) {
      return f + 1;
    }

    if (number < f + 0.5) {
      return f;
    }

    if (f % 2 !== 0) {
      return f + 1;
    }

    return f;
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
  ToString: function ToString(argument) {
    if (typeof argument === 'symbol') {
      throw new $TypeError$1('Cannot convert a Symbol value to a string');
    }

    return $String$1(argument);
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
  ToObject: function ToObject(value) {
    this.RequireObjectCoercible(value);
    return $Object$1(value);
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
  ToPropertyKey: function ToPropertyKey(argument) {
    var key = this.ToPrimitive(argument, $String$1);
    return typeof key === 'symbol' ? key : this.ToString(key);
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  ToLength: function ToLength(argument) {
    var len = this.ToInteger(argument);

    if (len <= 0) {
      return 0;
    } // includes converting -0 to +0


    if (len > MAX_SAFE_INTEGER) {
      return MAX_SAFE_INTEGER;
    }

    return len;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-canonicalnumericindexstring
  CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
    if (toStr$8(argument) !== '[object String]') {
      throw new $TypeError$1('must be a string');
    }

    if (argument === '-0') {
      return -0;
    }

    var n = this.ToNumber(argument);

    if (this.SameValue(this.ToString(n), argument)) {
      return n;
    }

    return void 0;
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
  RequireObjectCoercible: es5$1.CheckObjectCoercible,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
  IsArray: $Array.isArray || function IsArray(argument) {
    return toStr$8(argument) === '[object Array]';
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
  // IsCallable: ES5.IsCallable,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
  IsConstructor: function IsConstructor(argument) {
    return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
  IsExtensible: Object.preventExtensions ? function IsExtensible(obj) {
    if (isPrimitive$1(obj)) {
      return false;
    }

    return $isExtensible(obj);
  } : function isExtensible(obj) {
    return true;
  },
  // eslint-disable-line no-unused-vars
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
  IsInteger: function IsInteger(argument) {
    if (typeof argument !== 'number' || _isNaN(argument) || !_isFinite(argument)) {
      return false;
    }

    var abs = $abs(argument);
    return $floor(abs) === abs;
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
  IsPropertyKey: function IsPropertyKey(argument) {
    return typeof argument === 'string' || typeof argument === 'symbol';
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-isregexp
  IsRegExp: function IsRegExp(argument) {
    if (!argument || typeof argument !== 'object') {
      return false;
    }

    if (hasSymbols$4) {
      var isRegExp = argument[$Symbol.match];

      if (typeof isRegExp !== 'undefined') {
        return es5$1.ToBoolean(isRegExp);
      }
    }

    return isRegex(argument);
  },
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
  // SameValue: ES5.SameValue,
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
  SameValueZero: function SameValueZero(x, y) {
    return x === y || _isNaN(x) && _isNaN(y);
  },

  /**
   * 7.3.2 GetV (V, P)
   * 1. Assert: IsPropertyKey(P) is true.
   * 2. Let O be ToObject(V).
   * 3. ReturnIfAbrupt(O).
   * 4. Return O.[[Get]](P, V).
   */
  GetV: function GetV(V, P) {
    // 7.3.2.1
    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    } // 7.3.2.2-3


    var O = this.ToObject(V); // 7.3.2.4

    return O[P];
  },

  /**
   * 7.3.9 - https://ecma-international.org/ecma-262/6.0/#sec-getmethod
   * 1. Assert: IsPropertyKey(P) is true.
   * 2. Let func be GetV(O, P).
   * 3. ReturnIfAbrupt(func).
   * 4. If func is either undefined or null, return undefined.
   * 5. If IsCallable(func) is false, throw a TypeError exception.
   * 6. Return func.
   */
  GetMethod: function GetMethod(O, P) {
    // 7.3.9.1
    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    } // 7.3.9.2


    var func = this.GetV(O, P); // 7.3.9.4

    if (func == null) {
      return void 0;
    } // 7.3.9.5


    if (!this.IsCallable(func)) {
      throw new $TypeError$1(P + 'is not a function');
    } // 7.3.9.6


    return func;
  },

  /**
   * 7.3.1 Get (O, P) - https://ecma-international.org/ecma-262/6.0/#sec-get-o-p
   * 1. Assert: Type(O) is Object.
   * 2. Assert: IsPropertyKey(P) is true.
   * 3. Return O.[[Get]](P, O).
   */
  Get: function Get(O, P) {
    // 7.3.1.1
    if (this.Type(O) !== 'Object') {
      throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    } // 7.3.1.2


    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    } // 7.3.1.3


    return O[P];
  },
  Type: function Type(x) {
    if (typeof x === 'symbol') {
      return 'Symbol';
    }

    return es5$1.Type(x);
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-speciesconstructor
  SpeciesConstructor: function SpeciesConstructor(O, defaultConstructor) {
    if (this.Type(O) !== 'Object') {
      throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    }

    var C = O.constructor;

    if (typeof C === 'undefined') {
      return defaultConstructor;
    }

    if (this.Type(C) !== 'Object') {
      throw new $TypeError$1('O.constructor is not an Object');
    }

    var S = hasSymbols$4 && $Symbol.species ? C[$Symbol.species] : void 0;

    if (S == null) {
      return defaultConstructor;
    }

    if (this.IsConstructor(S)) {
      return S;
    }

    throw new $TypeError$1('no constructor found');
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-completepropertydescriptor
  CompletePropertyDescriptor: function CompletePropertyDescriptor(Desc) {
    if (!this.IsPropertyDescriptor(Desc)) {
      throw new $TypeError$1('Desc must be a Property Descriptor');
    }

    if (this.IsGenericDescriptor(Desc) || this.IsDataDescriptor(Desc)) {
      if (!src(Desc, '[[Value]]')) {
        Desc['[[Value]]'] = void 0;
      }

      if (!src(Desc, '[[Writable]]')) {
        Desc['[[Writable]]'] = false;
      }
    } else {
      if (!src(Desc, '[[Get]]')) {
        Desc['[[Get]]'] = void 0;
      }

      if (!src(Desc, '[[Set]]')) {
        Desc['[[Set]]'] = void 0;
      }
    }

    if (!src(Desc, '[[Enumerable]]')) {
      Desc['[[Enumerable]]'] = false;
    }

    if (!src(Desc, '[[Configurable]]')) {
      Desc['[[Configurable]]'] = false;
    }

    return Desc;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-set-o-p-v-throw
  Set: function Set(O, P, V, Throw) {
    if (this.Type(O) !== 'Object') {
      throw new $TypeError$1('O must be an Object');
    }

    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('P must be a Property Key');
    }

    if (this.Type(Throw) !== 'Boolean') {
      throw new $TypeError$1('Throw must be a Boolean');
    }

    if (Throw) {
      O[P] = V;
      return true;
    } else {
      try {
        O[P] = V;
      } catch (e) {
        return false;
      }
    }
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-hasownproperty
  HasOwnProperty: function HasOwnProperty(O, P) {
    if (this.Type(O) !== 'Object') {
      throw new $TypeError$1('O must be an Object');
    }

    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('P must be a Property Key');
    }

    return src(O, P);
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-hasproperty
  HasProperty: function HasProperty(O, P) {
    if (this.Type(O) !== 'Object') {
      throw new $TypeError$1('O must be an Object');
    }

    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('P must be a Property Key');
    }

    return P in O;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable
  IsConcatSpreadable: function IsConcatSpreadable(O) {
    if (this.Type(O) !== 'Object') {
      return false;
    }

    if (hasSymbols$4 && typeof $Symbol.isConcatSpreadable === 'symbol') {
      var spreadable = this.Get(O, Symbol.isConcatSpreadable);

      if (typeof spreadable !== 'undefined') {
        return this.ToBoolean(spreadable);
      }
    }

    return this.IsArray(O);
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-invoke
  Invoke: function Invoke(O, P) {
    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('P must be a Property Key');
    }

    var argumentsList = arraySlice(arguments, 2);
    var func = this.GetV(O, P);
    return this.Call(func, O, argumentsList);
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-getiterator
  GetIterator: function GetIterator(obj, method) {
    if (!hasSymbols$4) {
      throw new SyntaxError('ES.GetIterator depends on native iterator support.');
    }

    var actualMethod = method;

    if (arguments.length < 2) {
      actualMethod = this.GetMethod(obj, $Symbol.iterator);
    }

    var iterator = this.Call(actualMethod, obj);

    if (this.Type(iterator) !== 'Object') {
      throw new $TypeError$1('iterator must return an object');
    }

    return iterator;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-iteratornext
  IteratorNext: function IteratorNext(iterator, value) {
    var result = this.Invoke(iterator, 'next', arguments.length < 2 ? [] : [value]);

    if (this.Type(result) !== 'Object') {
      throw new $TypeError$1('iterator next must return an object');
    }

    return result;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-iteratorcomplete
  IteratorComplete: function IteratorComplete(iterResult) {
    if (this.Type(iterResult) !== 'Object') {
      throw new $TypeError$1('Assertion failed: Type(iterResult) is not Object');
    }

    return this.ToBoolean(this.Get(iterResult, 'done'));
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-iteratorvalue
  IteratorValue: function IteratorValue(iterResult) {
    if (this.Type(iterResult) !== 'Object') {
      throw new $TypeError$1('Assertion failed: Type(iterResult) is not Object');
    }

    return this.Get(iterResult, 'value');
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-iteratorstep
  IteratorStep: function IteratorStep(iterator) {
    var result = this.IteratorNext(iterator);
    var done = this.IteratorComplete(result);
    return done === true ? false : result;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-iteratorclose
  IteratorClose: function IteratorClose(iterator, completion) {
    if (this.Type(iterator) !== 'Object') {
      throw new $TypeError$1('Assertion failed: Type(iterator) is not Object');
    }

    if (!this.IsCallable(completion)) {
      throw new $TypeError$1('Assertion failed: completion is not a thunk for a Completion Record');
    }

    var completionThunk = completion;
    var iteratorReturn = this.GetMethod(iterator, 'return');

    if (typeof iteratorReturn === 'undefined') {
      return completionThunk();
    }

    var completionRecord;

    try {
      var innerResult = this.Call(iteratorReturn, iterator, []);
    } catch (e) {
      // if we hit here, then "e" is the innerResult completion that needs re-throwing
      // if the completion is of type "throw", this will throw.
      completionRecord = completionThunk();
      completionThunk = null; // ensure it's not called twice.
      // if not, then return the innerResult completion

      throw e;
    }

    completionRecord = completionThunk(); // if innerResult worked, then throw if the completion does

    completionThunk = null; // ensure it's not called twice.

    if (this.Type(innerResult) !== 'Object') {
      throw new $TypeError$1('iterator .return must return an object');
    }

    return completionRecord;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-createiterresultobject
  CreateIterResultObject: function CreateIterResultObject(value, done) {
    if (this.Type(done) !== 'Boolean') {
      throw new $TypeError$1('Assertion failed: Type(done) is not Boolean');
    }

    return {
      value: value,
      done: done
    };
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-regexpexec
  RegExpExec: function RegExpExec(R, S) {
    if (this.Type(R) !== 'Object') {
      throw new $TypeError$1('R must be an Object');
    }

    if (this.Type(S) !== 'String') {
      throw new $TypeError$1('S must be a String');
    }

    var exec = this.Get(R, 'exec');

    if (this.IsCallable(exec)) {
      var result = this.Call(exec, R, [S]);

      if (result === null || this.Type(result) === 'Object') {
        return result;
      }

      throw new $TypeError$1('"exec" method must return `null` or an Object');
    }

    return regexExec$1(R, S);
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-arrayspeciescreate
  ArraySpeciesCreate: function ArraySpeciesCreate(originalArray, length) {
    if (!this.IsInteger(length) || length < 0) {
      throw new $TypeError$1('Assertion failed: length must be an integer >= 0');
    }

    var len = length === 0 ? 0 : length;
    var C;
    var isArray = this.IsArray(originalArray);

    if (isArray) {
      C = this.Get(originalArray, 'constructor'); // TODO: figure out how to make a cross-realm normal Array, a same-realm Array
      // if (this.IsConstructor(C)) {
      // 	if C is another realm's Array, C = undefined
      // 	Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Array))) === null ?
      // }

      if (this.Type(C) === 'Object' && hasSymbols$4 && $Symbol.species) {
        C = this.Get(C, $Symbol.species);

        if (C === null) {
          C = void 0;
        }
      }
    }

    if (typeof C === 'undefined') {
      return $Array(len);
    }

    if (!this.IsConstructor(C)) {
      throw new $TypeError$1('C must be a constructor');
    }

    return new C(len); // this.Construct(C, len);
  },
  CreateDataProperty: function CreateDataProperty(O, P, V) {
    if (this.Type(O) !== 'Object') {
      throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    }

    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    }

    var oldDesc = $gOPD(O, P);
    var extensible = oldDesc || typeof $isExtensible !== 'function' || $isExtensible(O);
    var immutable = oldDesc && (!oldDesc.writable || !oldDesc.configurable);

    if (immutable || !extensible) {
      return false;
    }

    var newDesc = {
      configurable: true,
      enumerable: true,
      value: V,
      writable: true
    };
    Object.defineProperty(O, P, newDesc);
    return true;
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-createdatapropertyorthrow
  CreateDataPropertyOrThrow: function CreateDataPropertyOrThrow(O, P, V) {
    if (this.Type(O) !== 'Object') {
      throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    }

    if (!this.IsPropertyKey(P)) {
      throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    }

    var success = this.CreateDataProperty(O, P, V);

    if (!success) {
      throw new $TypeError$1('unable to create data property');
    }

    return success;
  },
  // https://www.ecma-international.org/ecma-262/6.0/#sec-objectcreate
  ObjectCreate: function ObjectCreate(proto, internalSlotsList) {
    if (proto !== null && this.Type(proto) !== 'Object') {
      throw new $TypeError$1('Assertion failed: proto must be null or an object');
    }

    var slots = arguments.length < 2 ? [] : internalSlotsList;

    if (slots.length > 0) {
      throw new $SyntaxError('es-abstract does not yet support internal slots');
    }

    if (proto === null && !$ObjectCreate) {
      throw new $SyntaxError('native Object.create support is required to create null objects');
    }

    return $ObjectCreate(proto);
  },
  // https://ecma-international.org/ecma-262/6.0/#sec-advancestringindex
  AdvanceStringIndex: function AdvanceStringIndex(S, index, unicode) {
    if (this.Type(S) !== 'String') {
      throw new $TypeError$1('S must be a String');
    }

    if (!this.IsInteger(index) || index < 0 || index > MAX_SAFE_INTEGER) {
      throw new $TypeError$1('Assertion failed: length must be an integer >= 0 and <= 2**53');
    }

    if (this.Type(unicode) !== 'Boolean') {
      throw new $TypeError$1('Assertion failed: unicode must be a Boolean');
    }

    if (!unicode) {
      return index + 1;
    }

    var length = S.length;

    if (index + 1 >= length) {
      return index + 1;
    }

    var first = $charCodeAt(S, index);

    if (first < 0xD800 || first > 0xDBFF) {
      return index + 1;
    }

    var second = $charCodeAt(S, index + 1);

    if (second < 0xDC00 || second > 0xDFFF) {
      return index + 1;
    }

    return index + 2;
  }
});
delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

var es2015$1 = ES6;

var es6$1 = es2015$1;

var implementation$1 = function find(predicate) {
  var list = es6$1.ToObject(this);
  var length = es6$1.ToInteger(es6$1.ToLength(list.length));

  if (!es6$1.IsCallable(predicate)) {
    throw new TypeError('Array#find: predicate must be a function');
  }

  if (length === 0) {
    return undefined;
  }

  var thisArg = arguments[1];

  for (var i = 0, value; i < length; i++) {
    value = list[i];

    if (es6$1.Call(predicate, thisArg, [value, i, list])) {
      return value;
    }
  }

  return undefined;
};

var polyfill = function getPolyfill() {
  // Detect if an implementation exists
  // Detect early implementations which skipped holes in sparse arrays
  // eslint-disable-next-line no-sparse-arrays
  var implemented = Array.prototype.find && [, 1].find(function () {
    return true;
  }) !== 1; // eslint-disable-next-line global-require

  return implemented ? Array.prototype.find : implementation$1;
};

var shim = function shimArrayPrototypeFind() {
  var polyfill$$1 = polyfill();
  defineProperties_1(Array.prototype, {
    find: polyfill$$1
  }, {
    find: function () {
      return Array.prototype.find !== polyfill$$1;
    }
  });
  return polyfill$$1;
};

var slice$2 = Array.prototype.slice;
var polyfill$1 = polyfill();

var boundFindShim = function find(array, predicate) {
  // eslint-disable-line no-unused-vars
  es6$1.RequireObjectCoercible(array);
  var args = slice$2.call(arguments, 1);
  return polyfill$1.apply(array, args);
};

defineProperties_1(boundFindShim, {
  getPolyfill: polyfill,
  implementation: implementation$1,
  shim: shim
});

/*! https://mths.be/includes v0.2.0 by @mathias */
if (!String.prototype.includes) {
  (function () {

    var toString = {}.toString;

    var defineProperty = function () {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch (error) {}

      return result;
    }();

    var indexOf = ''.indexOf;

    var includes = function (search) {
      if (this == null) {
        throw TypeError();
      }

      var string = String(this);

      if (search && toString.call(search) == '[object RegExp]') {
        throw TypeError();
      }

      var stringLength = string.length;
      var searchString = String(search);
      var searchLength = searchString.length;
      var position = arguments.length > 1 ? arguments[1] : undefined; // `ToInteger`

      var pos = position ? Number(position) : 0;

      if (pos != pos) {
        // better `isNaN`
        pos = 0;
      }

      var start = Math.min(Math.max(pos, 0), stringLength); // Avoid the `indexOf` call if no match is possible

      if (searchLength + start > stringLength) {
        return false;
      }

      return indexOf.call(string, searchString, pos) != -1;
    };

    if (defineProperty) {
      defineProperty(String.prototype, 'includes', {
        'value': includes,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.includes = includes;
    }
  })();
}

/*! https://mths.be/punycode v1.4.1 by @mathias */

/** Highest positive signed 32-bit float value */
var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */

var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80

var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars

var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */

var errors = {
  'overflow': 'Overflow: input needs wider integers to process',
  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  'invalid-input': 'Invalid input'
};
/** Convenience shortcuts */

var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;
/*--------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */

function error(type) {
  throw new RangeError(errors[type]);
}
/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */


function map(array, fn) {
  var length = array.length;
  var result = [];

  while (length--) {
    result[length] = fn(array[length]);
  }

  return result;
}
/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {Array} A new string of characters returned by the callback
 * function.
 */


function mapDomain(string, fn) {
  var parts = string.split('@');
  var result = '';

  if (parts.length > 1) {
    // In email addresses, only the domain name should be punycoded. Leave
    // the local part (i.e. everything up to `@`) intact.
    result = parts[0] + '@';
    string = parts[1];
  } // Avoid `split(regex)` for IE8 compatibility. See #17.


  string = string.replace(regexSeparators, '\x2E');
  var labels = string.split('.');
  var encoded = map(labels, fn).join('.');
  return result + encoded;
}
/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */


function ucs2decode(string) {
  var output = [],
      counter = 0,
      length = string.length,
      value,
      extra;

  while (counter < length) {
    value = string.charCodeAt(counter++);

    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // high surrogate, and there is a next character
      extra = string.charCodeAt(counter++);

      if ((extra & 0xFC00) == 0xDC00) {
        // low surrogate
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // unmatched surrogate; only append this code unit, in case the next
        // code unit is the high surrogate of a surrogate pair
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }

  return output;
}
/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */


function digitToBasic(digit, flag) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
}
/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */


function adapt(delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);

  for (;
  /* no initialization */
  delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }

  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
}
/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */

function encode(input) {
  var n,
      delta,
      handledCPCount,
      basicLength,
      bias,
      j,
      m,
      q,
      k,
      t,
      currentValue,
      output = [],

  /** `inputLength` will hold the number of code points in `input`. */
  inputLength,

  /** Cached calculation results */
  handledCPCountPlusOne,
      baseMinusT,
      qMinusT; // Convert the input in UCS-2 to Unicode

  input = ucs2decode(input); // Cache the length

  inputLength = input.length; // Initialize the state

  n = initialN;
  delta = 0;
  bias = initialBias; // Handle the basic code points

  for (j = 0; j < inputLength; ++j) {
    currentValue = input[j];

    if (currentValue < 0x80) {
      output.push(stringFromCharCode(currentValue));
    }
  }

  handledCPCount = basicLength = output.length; // `handledCPCount` is the number of code points that have been handled;
  // `basicLength` is the number of basic code points.
  // Finish the basic string - if it is not empty - with a delimiter

  if (basicLength) {
    output.push(delimiter);
  } // Main encoding loop:


  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next
    // larger one:
    for (m = maxInt, j = 0; j < inputLength; ++j) {
      currentValue = input[j];

      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    } // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
    // but guard against overflow


    handledCPCountPlusOne = handledCPCount + 1;

    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      error('overflow');
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (j = 0; j < inputLength; ++j) {
      currentValue = input[j];

      if (currentValue < n && ++delta > maxInt) {
        error('overflow');
      }

      if (currentValue == n) {
        // Represent delta as a generalized variable-length integer
        for (q = delta, k = base;;
        /* no condition */
        k += base) {
          t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

          if (q < t) {
            break;
          }

          qMinusT = q - t;
          baseMinusT = base - t;
          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
          q = floor(qMinusT / baseMinusT);
        }

        output.push(stringFromCharCode(digitToBasic(q, 0)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;
  }

  return output.join('');
}
/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */

function toASCII(input) {
  return mapDomain(input, function (string) {
    return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
  });
}

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js
function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;

if (typeof global.setTimeout === 'function') {
  cachedSetTimeout = setTimeout;
}

if (typeof global.clearTimeout === 'function') {
  cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

function nextTick(fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
} // v8 likes predictible objects

function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

var title = 'browser';
var platform = 'browser';
var browser = true;
var env = {};
var argv = [];
var version$1 = ''; // empty string to avoid regexp issues

var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
  throw new Error('process.binding is not supported');
}
function cwd() {
  return '/';
}
function chdir(dir) {
  throw new Error('process.chdir is not supported');
}
function umask() {
  return 0;
} // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js

var performance = global.performance || {};

var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
  return new Date().getTime();
}; // generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime


function hrtime(previousTimestamp) {
  var clocktime = performanceNow.call(performance) * 1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor(clocktime % 1 * 1e9);

  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];

    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }

  return [seconds, nanoseconds];
}
var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}
var process$1 = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: env,
  argv: argv,
  version: version$1,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

var inherits;

if (typeof Object.create === 'function') {
  inherits = function inherits(ctor, superCtor) {
    // implementation from standard node.js 'util' module
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;

    var TempCtor = function () {};

    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

var inherits$1 = inherits;

// Copyright Joyent, Inc. and other Node contributors.
var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (!isString(f)) {
    var objects = [];

    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }

    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function (x) {
    if (x === '%%') return '%';
    if (i >= len) return x;

    switch (x) {
      case '%s':
        return String(args[i++]);

      case '%d':
        return Number(args[i++]);

      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }

      default:
        return x;
    }
  });

  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }

  return str;
}
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.

function deprecate(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function () {
      return deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;

  function deprecated() {
    if (!warned) {
      {
        console.error(msg);
      }

      warned = true;
    }

    return fn.apply(this, arguments);
  }

  return deprecated;
}
var debugs = {};
var debugEnviron;
function debuglog(set) {
  if (isUndefined(debugEnviron)) debugEnviron = process$1.env.NODE_DEBUG || '';
  set = set.toUpperCase();

  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = 0;

      debugs[set] = function () {
        var msg = format.apply(null, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function () {};
    }
  }

  return debugs[set];
}
/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */

/* legacy: obj, showHidden, depth, colors*/

function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  }; // legacy...

  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];

  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    _extend(ctx, opts);
  } // set default options


  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
} // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics

inspect.colors = {
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  'white': [37, 39],
  'grey': [90, 39],
  'black': [30, 39],
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
}; // Don't use 'blue' not visible on cmd.exe

inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str + '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  var hash = {};
  array.forEach(function (val, idx) {
    hash[val] = true;
  });
  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect && value && isFunction$1(value.inspect) && // Filter out the util module, it's inspect function is special
  value.inspect !== inspect && // Also filter out any prototype objects using the circular check.
  !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);

    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }

    return ret;
  } // Primitive types cannot have properties


  var primitive = formatPrimitive(ctx, value);

  if (primitive) {
    return primitive;
  } // Look up the keys of the object.


  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  } // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx


  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  } // Some type of object without properties can be shortcutted.


  if (keys.length === 0) {
    if (isFunction$1(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }

    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }

    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }

    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '',
      array = false,
      braces = ['{', '}']; // Make Array say that they are Array

  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  } // Make functions say that they are functions


  if (isFunction$1(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  } // Make RegExps say that they are RegExps


  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  } // Make dates with properties first say the date


  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  } // Make error with message first say the error


  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);
  var output;

  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function (key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();
  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');

  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }

  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean'); // For some reason typeof null is "object", so special case here.

  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];

  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }

  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || {
    value: value[key]
  };

  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }

  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }

      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }

  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }

    name = JSON.stringify('' + key);

    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  var length = output.reduce(function (prev, cur) {
    if (cur.indexOf('\n') >= 0) ;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
} // NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.


function isArray(ar) {
  return Array.isArray(ar);
}
function isBoolean(arg) {
  return typeof arg === 'boolean';
}
function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return arg == null;
}
function isNumber(arg) {
  return typeof arg === 'number';
}
function isString(arg) {
  return typeof arg === 'string';
}
function isUndefined(arg) {
  return arg === void 0;
}
function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
function isError(e) {
  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
}
function isFunction$1(arg) {
  return typeof arg === 'function';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
function _extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;
  var keys = Object.keys(add);
  var i = keys.length;

  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }

  return origin;
}

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty$1(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var isArray$1 = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function stringifyPrimitive(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
}

function stringify(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';

  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map$1(objectKeys$1(obj), function (k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;

      if (isArray$1(obj[k])) {
        return map$1(obj[k], function (v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);
  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
}

function map$1(xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];

  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }

  return res;
}

var objectKeys$1 = Object.keys || function (obj) {
  var res = [];

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }

  return res;
};

function parse(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);
  var maxKeys = 1000;

  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length; // maxKeys <= 0 means that we should not limit keys count

  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr,
        vstr,
        k,
        v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty$1(obj, k)) {
      obj[k] = v;
    } else if (isArray$1(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
}

// Copyright Joyent, Inc. and other Node contributors.
var Url = {
  parse: urlParse,
  resolve: urlResolve,
  resolveObject: urlResolveObject,
  format: urlFormat,
  Url: Url$1
};
function Url$1() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
} // Reference: RFC 3986, RFC 1808, RFC 2396
// define these here so at least they only have to be
// compiled once on the first module load.

var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,
    // Special case for a simple path URL
simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
    // RFC 2396: characters reserved for delimiting URLs.
// We actually just auto-escape these.
delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
    // RFC 2396: characters not allowed for various reasons.
unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
// Note that any invalid chars are also handled, but these
// are the ones that are *expected* to be seen, so we fast-path
// them.
nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
unsafeProtocol = {
  'javascript': true,
  'javascript:': true
},
    // protocols that never have a hostname.
hostlessProtocol = {
  'javascript': true,
  'javascript:': true
},
    // protocols that always contain a // bit.
slashedProtocol = {
  'http': true,
  'https': true,
  'ftp': true,
  'gopher': true,
  'file': true,
  'http:': true,
  'https:': true,
  'ftp:': true,
  'gopher:': true,
  'file:': true
};

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url$1) return url;
  var u = new Url$1();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url$1.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
  return parse$1(this, url, parseQueryString, slashesDenoteHost);
};

function parse$1(self, url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError('Parameter \'url\' must be a string, not ' + typeof url);
  } // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916


  var queryIndex = url.indexOf('?'),
      splitter = queryIndex !== -1 && queryIndex < url.indexOf('#') ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);
  var rest = url; // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"

  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);

    if (simplePath) {
      self.path = rest;
      self.href = rest;
      self.pathname = simplePath[1];

      if (simplePath[2]) {
        self.search = simplePath[2];

        if (parseQueryString) {
          self.query = parse(self.search.substr(1));
        } else {
          self.query = self.search.substr(1);
        }
      } else if (parseQueryString) {
        self.search = '';
        self.query = {};
      }

      return self;
    }
  }

  var proto = protocolPattern.exec(rest);

  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    self.protocol = lowerProto;
    rest = rest.substr(proto.length);
  } // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.


  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';

    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      self.slashes = true;
    }
  }

  var i, hec, l, p;

  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c
    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.
    // find the first instance of any hostEndingChars
    var hostEnd = -1;

    for (i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    } // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.


    var auth, atSign;

    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    } // Now we have a portion which is definitely the auth.
    // Pull that off.


    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      self.auth = decodeURIComponent(auth);
    } // the host is the remaining to the left of the first non-host char


    hostEnd = -1;

    for (i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    } // if we still have not hit it, then the entire thing is a host.


    if (hostEnd === -1) hostEnd = rest.length;
    self.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd); // pull out port.

    parseHost(self); // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.

    self.hostname = self.hostname || ''; // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.

    var ipv6Hostname = self.hostname[0] === '[' && self.hostname[self.hostname.length - 1] === ']'; // validate a little.

    if (!ipv6Hostname) {
      var hostparts = self.hostname.split(/\./);

      for (i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;

        if (!part.match(hostnamePartPattern)) {
          var newpart = '';

          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          } // we test again with ASCII char only


          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);

            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }

            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }

            self.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (self.hostname.length > hostnameMaxLen) {
      self.hostname = '';
    } else {
      // hostnames are always lower case.
      self.hostname = self.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      self.hostname = toASCII(self.hostname);
    }

    p = self.port ? ':' + self.port : '';
    var h = self.hostname || '';
    self.host = h + p;
    self.href += self.host; // strip [ and ] from the hostname
    // the host field still retains them, though

    if (ipv6Hostname) {
      self.hostname = self.hostname.substr(1, self.hostname.length - 2);

      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  } // now rest is set to the post-host stuff.
  // chop off any delim chars.


  if (!unsafeProtocol[lowerProto]) {
    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1) continue;
      var esc = encodeURIComponent(ae);

      if (esc === ae) {
        esc = escape(ae);
      }

      rest = rest.split(ae).join(esc);
    }
  } // chop off from the tail first.


  var hash = rest.indexOf('#');

  if (hash !== -1) {
    // got a fragment string.
    self.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }

  var qm = rest.indexOf('?');

  if (qm !== -1) {
    self.search = rest.substr(qm);
    self.query = rest.substr(qm + 1);

    if (parseQueryString) {
      self.query = parse(self.query);
    }

    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    self.search = '';
    self.query = {};
  }

  if (rest) self.pathname = rest;

  if (slashedProtocol[lowerProto] && self.hostname && !self.pathname) {
    self.pathname = '/';
  } //to support http.request


  if (self.pathname || self.search) {
    p = self.pathname || '';
    var s = self.search || '';
    self.path = p + s;
  } // finally, reconstruct the href based on what has been validated.


  self.href = format$1(self);
  return self;
} // format a parsed object into a url string


function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = parse$1({}, obj);
  return format$1(obj);
}

function format$1(self) {
  var auth = self.auth || '';

  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = self.protocol || '',
      pathname = self.pathname || '',
      hash = self.hash || '',
      host = false,
      query = '';

  if (self.host) {
    host = auth + self.host;
  } else if (self.hostname) {
    host = auth + (self.hostname.indexOf(':') === -1 ? self.hostname : '[' + this.hostname + ']');

    if (self.port) {
      host += ':' + self.port;
    }
  }

  if (self.query && isObject(self.query) && Object.keys(self.query).length) {
    query = stringify(self.query);
  }

  var search = self.search || query && '?' + query || '';
  if (protocol && protocol.substr(-1) !== ':') protocol += ':'; // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.

  if (self.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;
  pathname = pathname.replace(/[?#]/g, function (match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');
  return protocol + host + pathname + search + hash;
}

Url$1.prototype.format = function () {
  return format$1(this);
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url$1.prototype.resolve = function (relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url$1.prototype.resolveObject = function (relative) {
  if (isString(relative)) {
    var rel = new Url$1();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url$1();
  var tkeys = Object.keys(this);

  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  } // hash is always overridden, no matter what.
  // even href="" will remove it.


  result.hash = relative.hash; // if the relative url is empty, then there's nothing left to do here.

  if (relative.href === '') {
    result.href = result.format();
    return result;
  } // hrefs like //foo/bar always cut to the protocol.


  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);

    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol') result[rkey] = relative[rkey];
    } //urlParse appends trailing / to urls like http://www.example.com


    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  var relPath;

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);

      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }

      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;

    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      relPath = (relative.pathname || '').split('/');

      while (relPath.length && !(relative.host = relPath.shift()));

      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }

    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port; // to support http.request

    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }

    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = result.pathname && result.pathname.charAt(0) === '/',
      isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/',
      mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname,
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];
  relPath = relative.pathname && relative.pathname.split('/') || []; // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.

  if (psychotic) {
    result.hostname = '';
    result.port = null;

    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;else srcPath.unshift(result.host);
    }

    result.host = '';

    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;

      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;else relPath.unshift(relative.host);
      }

      relative.host = null;
    }

    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  var authInHost;

  if (isRelAbs) {
    // it's absolute.
    result.host = relative.host || relative.host === '' ? relative.host : result.host;
    result.hostname = relative.hostname || relative.hostname === '' ? relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath; // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift(); //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')

      authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;

      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }

    result.search = relative.search;
    result.query = relative.query; //to support http.request

    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
    }

    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null; //to support http.request

    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }

    result.href = result.format();
    return result;
  } // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.


  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '..') || last === ''; // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0

  var up = 0;

  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];

    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  } // if the path is allowed to go above the root, restore leading ..s


  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && srcPath.join('/').substr(-1) !== '/') {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' || srcPath[0] && srcPath[0].charAt(0) === '/'; // put the host back

  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : ''; //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')

    authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;

    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || result.host && srcPath.length;

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  } //to support request.http


  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
  }

  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url$1.prototype.parseHost = function () {
  return parseHost(this);
};

function parseHost(self) {
  var host = self.host;
  var port = portPattern.exec(host);

  if (port) {
    port = port[0];

    if (port !== ':') {
      self.port = port.substr(1);
    }

    host = host.substr(0, host.length - port.length);
  }

  if (host) self.hostname = host;
}

var fs = {};

var hasFetch = isFunction$2(global.fetch) && isFunction$2(global.ReadableStream);

var _blobConstructor;

function blobConstructor() {
  if (typeof _blobConstructor !== 'undefined') {
    return _blobConstructor;
  }

  try {
    new global.Blob([new ArrayBuffer(1)]);
    _blobConstructor = true;
  } catch (e) {
    _blobConstructor = false;
  }

  return _blobConstructor;
}
var xhr;

function checkTypeSupport(type) {
  if (!xhr) {
    xhr = new global.XMLHttpRequest(); // If location.host is empty, e.g. if this page/worker was loaded
    // from a Blob, then use example.com to avoid an error

    xhr.open('GET', global.location.host ? '/' : 'https://example.com');
  }

  try {
    xhr.responseType = type;
    return xhr.responseType === type;
  } catch (e) {
    return false;
  }
} // For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.


var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined';
var haveSlice = haveArrayBuffer && isFunction$2(global.ArrayBuffer.prototype.slice);
var arraybuffer = haveArrayBuffer && checkTypeSupport('arraybuffer'); // These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.

var msstream = !hasFetch && haveSlice && checkTypeSupport('ms-stream');
var mozchunkedarraybuffer = !hasFetch && haveArrayBuffer && checkTypeSupport('moz-chunked-arraybuffer');
var overrideMimeType = isFunction$2(xhr.overrideMimeType);
var vbArray = isFunction$2(global.VBArray);

function isFunction$2(value) {
  return typeof value === 'function';
}

xhr = null; // Help gc

var domain; // This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).

function EventHandlers() {}

EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}
// require('events') === require('events').EventEmitter

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.usingDomains = false;
EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.

EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function () {
  this.domain = null;

  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active && !(this instanceof domain.Domain)) ;
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}; // Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.


EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
}; // These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.


function emitNone(handler, isFn, self) {
  if (isFn) handler.call(self);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self);
  }
}

function emitOne(handler, isFn, self, arg1) {
  if (isFn) handler.call(self, arg1);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self, arg1);
  }
}

function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn) handler.call(self, arg1, arg2);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2);
  }
}

function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn) handler.call(self, arg1, arg2, arg3);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn) handler.apply(self, args);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var doError = type === 'error';
  events = this._events;
  if (events) doError = doError && events.error == null;else if (!doError) return false;
  domain = this.domain; // If there is no 'error' event listener then throw.

  if (doError) {
    er = arguments[1];

    if (domain) {
      if (!er) er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }

    return false;
  }

  handler = events[type];
  if (!handler) return false;
  var isFn = typeof handler === 'function';
  len = arguments.length;

  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;

    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;

    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;

    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower

    default:
      args = new Array(len - 1);

      for (i = 1; i < len; i++) args[i - 1] = arguments[i];

      emitMany(handler, isFn, this, args);
  }
  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  events = target._events;

  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener); // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object

      events = target._events;
    }

    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    } // Check for listener leak


    if (!existing.warned) {
      m = $getMaxListeners(target);

      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + type + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}

function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};

function _onceWrap(target, type, listener) {
  var fired = false;

  function g() {
    target.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }

  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
}; // emits a 'removeListener' event iff the listener was removed


EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  events = this._events;
  if (!events) return this;
  list = events[type];
  if (!list) return this;

  if (list === listener || list.listener && list.listener === listener) {
    if (--this._eventsCount === 0) this._events = new EventHandlers();else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list[0] = undefined;

      if (--this._eventsCount === 0) {
        this._events = new EventHandlers();
        return this;
      } else {
        delete events[type];
      }
    } else {
      spliceOne(list, position);
    }

    if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events;
  events = this._events;
  if (!events) return this; // not listening for removeListener, no need to emit

  if (!events.removeListener) {
    if (arguments.length === 0) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    } else if (events[type]) {
      if (--this._eventsCount === 0) this._events = new EventHandlers();else delete events[type];
    }

    return this;
  } // emit removeListener for all listeners on all events


  if (arguments.length === 0) {
    var keys = Object.keys(events);

    for (var i = 0, key; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }

    this.removeAllListeners('removeListener');
    this._events = new EventHandlers();
    this._eventsCount = 0;
    return this;
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    do {
      this.removeListener(type, listeners[listeners.length - 1]);
    } while (listeners[0]);
  }

  return this;
};

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;
  if (!events) ret = [];else {
    evlistener = events[type];
    if (!evlistener) ret = [];else if (typeof evlistener === 'function') ret = [evlistener.listener || evlistener];else ret = unwrapListeners(evlistener);
  }
  return ret;
};

EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;

function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
}; // About 1.5x faster than the two-arg version of Array#splice().


function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) list[i] = list[k];

  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);

  while (i--) copy[i] = arr[i];

  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);

  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }

  return ret;
}

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;

function init() {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray(b64) {
  if (!inited) {
    init();
  }

  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  } // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice


  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0; // base64 is 4/3 + up to two characters of the original data

  arr = new Arr(len * 3 / 4 - placeHolders); // if there are placeholders, only get up to the last complete 4 chars

  l = placeHolders > 0 ? len - 4 : len;
  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 0xFF;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];

  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output.push(tripletToBase64(tmp));
  }

  return output.join('');
}

function fromByteArray(uint8) {
  if (!inited) {
    init();
  }

  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes

  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3
  // go through the array every three bytes, we'll deal with trailing stuff later

  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  } // pad the end with zeros, but make sure to not forget the extra bytes


  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 0x3F];
    output += lookup[tmp << 2 & 0x3F];
    output += '=';
  }

  parts.push(output);
  return parts.join('');
}

function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;

  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;

  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }

  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);

    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }

    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }

    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;

  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;
var isArray$2 = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
var INSPECT_MAX_BYTES = 50;
/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */

Buffer$1.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : true;

function kMaxLength() {
  return Buffer$1.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
}

function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length');
  }

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer$1.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer$1(length);
    }

    that.length = length;
  }

  return that;
}
/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */


function Buffer$1(arg, encodingOrOffset, length) {
  if (!Buffer$1.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer$1)) {
    return new Buffer$1(arg, encodingOrOffset, length);
  } // Common case.


  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error('If encoding is specified then the first argument must be a string');
    }

    return allocUnsafe(this, arg);
  }

  return from(this, arg, encodingOrOffset, length);
}
Buffer$1.poolSize = 8192; // not used by this implementation
// TODO: Legacy, not needed anymore. Remove in next major version.

Buffer$1._augment = function (arr) {
  arr.__proto__ = Buffer$1.prototype;
  return arr;
};

function from(that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset);
  }

  return fromObject(that, value);
}
/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/


Buffer$1.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length);
};

if (Buffer$1.TYPED_ARRAY_SUPPORT) {
  Buffer$1.prototype.__proto__ = Uint8Array.prototype;
  Buffer$1.__proto__ = Uint8Array;
}

function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}

function alloc(that, size, fill, encoding) {
  assertSize(size);

  if (size <= 0) {
    return createBuffer(that, size);
  }

  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string' ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
  }

  return createBuffer(that, size);
}
/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/


Buffer$1.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding);
};

function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);

  if (!Buffer$1.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }

  return that;
}
/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */


Buffer$1.allocUnsafe = function (size) {
  return allocUnsafe(null, size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */


Buffer$1.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size);
};

function fromString(that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer$1.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);
  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that;
}

function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }

  return that;
}

function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds');
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds');
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer$1.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }

  return that;
}

function fromObject(that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that;
    }

    obj.copy(that, 0, 0, len);
    return that;
  }

  if (obj) {
    if (typeof ArrayBuffer !== 'undefined' && obj.buffer instanceof ArrayBuffer || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0);
      }

      return fromArrayLike(that, obj);
    }

    if (obj.type === 'Buffer' && isArray$2(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
}

function checked(length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
  }

  return length | 0;
}
Buffer$1.isBuffer = isBuffer$1;

function internalIsBuffer(b) {
  return !!(b != null && b._isBuffer);
}

Buffer$1.compare = function compare(a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers');
  }

  if (a === b) return 0;
  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer$1.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;

    default:
      return false;
  }
};

Buffer$1.concat = function concat(list, length) {
  if (!isArray$2(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  if (list.length === 0) {
    return Buffer$1.alloc(0);
  }

  var i;

  if (length === undefined) {
    length = 0;

    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer$1.allocUnsafe(length);
  var pos = 0;

  for (i = 0; i < list.length; ++i) {
    var buf = list[i];

    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }

    buf.copy(buffer, pos);
    pos += buf.length;
  }

  return buffer;
};

function byteLength(string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length;
  }

  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }

  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0; // Use a for loop to avoid recursion

  var loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;

      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length;

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;

      case 'hex':
        return len >>> 1;

      case 'base64':
        return base64ToBytes(string).length;

      default:
        if (loweredCase) return utf8ToBytes(string).length; // assume utf8

        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}

Buffer$1.byteLength = byteLength;

function slowToString(encoding, start, end) {
  var loweredCase = false; // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.
  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.

  if (start === undefined || start < 0) {
    start = 0;
  } // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.


  if (start > this.length) {
    return '';
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return '';
  } // Force coersion to uint32. This will also coerce falsey/NaN values to 0.


  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return '';
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
} // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.


Buffer$1.prototype._isBuffer = true;

function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer$1.prototype.swap16 = function swap16() {
  var len = this.length;

  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }

  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }

  return this;
};

Buffer$1.prototype.swap32 = function swap32() {
  var len = this.length;

  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }

  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }

  return this;
};

Buffer$1.prototype.swap64 = function swap64() {
  var len = this.length;

  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }

  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }

  return this;
};

Buffer$1.prototype.toString = function toString() {
  var length = this.length | 0;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer$1.prototype.equals = function equals(b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer$1.compare(this, b) === 0;
};

Buffer$1.prototype.inspect = function inspect() {
  var str = '';
  var max = INSPECT_MAX_BYTES;

  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }

  return '<Buffer ' + str + '>';
};

Buffer$1.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer');
  }

  if (start === undefined) {
    start = 0;
  }

  if (end === undefined) {
    end = target ? target.length : 0;
  }

  if (thisStart === undefined) {
    thisStart = 0;
  }

  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }

  if (thisStart >= thisEnd) {
    return -1;
  }

  if (start >= end) {
    return 1;
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target) return 0;
  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);
  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
}; // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf


function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1; // Normalize byteOffset

  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }

  byteOffset = +byteOffset; // Coerce to Number.

  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
  } // Normalize byteOffset: negative offsets start from the end of the buffer


  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  } // Normalize val


  if (typeof val === 'string') {
    val = Buffer$1.from(val, encoding);
  } // Finally, search either indexOf (if dir is true) or lastIndexOf


  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }

    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]

    if (Buffer$1.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }

    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError('val must be string, number or Buffer');
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();

    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }

      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read$$1(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  var i;

  if (dir) {
    var foundIndex = -1;

    for (i = byteOffset; i < arrLength; i++) {
      if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

    for (i = byteOffset; i >= 0; i--) {
      var found = true;

      for (var j = 0; j < valLength; j++) {
        if (read$$1(arr, i + j) !== read$$1(val, j)) {
          found = false;
          break;
        }
      }

      if (found) return i;
    }
  }

  return -1;
}

Buffer$1.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};

Buffer$1.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};

Buffer$1.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;

  if (!length) {
    length = remaining;
  } else {
    length = Number(length);

    if (length > remaining) {
      length = remaining;
    }
  } // must be an even number of digits


  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

  if (length > strLen / 2) {
    length = strLen / 2;
  }

  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }

  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer$1.prototype.write = function write$$1(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0; // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0; // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;

    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    } // legacy write(string, encoding, offset, length) - remove in v0.13

  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';
  var loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
        return asciiWrite(this, string, offset, length);

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length);

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer$1.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf);
  } else {
    return fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];
  var i = start;

  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }

          break;

        case 2:
          secondByte = buf[i + 1];

          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }

      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
} // Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety


var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;

  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  } // Decode in chunks to avoid "call stack size exceeded".


  var res = '';
  var i = 0;

  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }

  return res;
}

function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }

  return ret;
}

function latin1Slice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }

  return ret;
}

function hexSlice(buf, start, end) {
  var len = buf.length;
  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;
  var out = '';

  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }

  return out;
}

function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';

  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }

  return res;
}

Buffer$1.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;
  var newBuf;

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer$1.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer$1(sliceLen, undefined);

    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf;
};
/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */


function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer$1.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer$1.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;

  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;

  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer$1.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer$1.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer$1.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer$1.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer$1.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer$1.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var val = this[offset];
  var mul = 1;
  var i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer$1.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];

  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer$1.prototype.readInt8 = function readInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer$1.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer$1.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer$1.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer$1.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer$1.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4);
};

Buffer$1.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4);
};

Buffer$1.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8);
};

Buffer$1.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}

Buffer$1.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;

  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer$1.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;

  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer$1.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = value & 0xff;
  return offset + 1;
};

function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;

  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer$1.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }

  return offset + 2;
};

Buffer$1.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }

  return offset + 2;
};

function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;

  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
  }
}

Buffer$1.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }

  return offset + 4;
};

Buffer$1.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }

  return offset + 4;
};

Buffer$1.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;

  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer$1.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;

  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer$1.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer$1.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }

  return offset + 2;
};

Buffer$1.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }

  return offset + 2;
};

Buffer$1.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }

  return offset + 4;
};

Buffer$1.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }

  return offset + 4;
};

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer$1.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer$1.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer$1.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer$1.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
}; // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)


Buffer$1.prototype.copy = function copy(target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start; // Copy 0 bytes; we're done

  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0; // Fatal error conditions

  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }

  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
  if (end < 0) throw new RangeError('sourceEnd out of bounds'); // Are we oob?

  if (end > this.length) end = this.length;

  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer$1.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
  }

  return len;
}; // Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])


Buffer$1.prototype.fill = function fill(val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }

    if (val.length === 1) {
      var code = val.charCodeAt(0);

      if (code < 256) {
        val = code;
      }
    }

    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }

    if (typeof encoding === 'string' && !Buffer$1.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  } // Invalid ranges are not set to a default, so can range check early.


  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }

  if (end <= start) {
    return this;
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;
  if (!val) val = 0;
  var i;

  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer$1(val, encoding).toString());
    var len = bytes.length;

    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this;
}; // HELPER FUNCTIONS
// ================


var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean(str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, ''); // Node converts strings with length < 2 to ''

  if (str.length < 2) return ''; // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not

  while (str.length % 4 !== 0) {
    str = str + '=';
  }

  return str;
}

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i); // is surrogate component

    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } // valid lead


        leadSurrogate = codePoint;
        continue;
      } // 2 leads in a row


      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      } // valid surrogate pair


      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null; // encode utf8

    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  var byteArray = [];

  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }

  return byteArray;
}

function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];

  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }

  return i;
}

function isnan(val) {
  return val !== val; // eslint-disable-line no-self-compare
} // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually


function isBuffer$1(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
}

function isFastBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
} // For Node v0.10 support. Remove this eventually.


function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0));
}

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = {
    data: v,
    next: null
  };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = {
    data: v,
    next: this.head
  };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;

  while (p = p.next) {
    ret += s + p.data;
  }

  return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return Buffer$1.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = Buffer$1.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;

  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }

  return ret;
};

// Copyright Joyent, Inc. and other Node contributors.

var isBufferEncoding = Buffer$1.isEncoding || function (encoding) {
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
} // StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.


function StringDecoder(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);

  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;

    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;

    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;

    default:
      this.write = passThroughWrite;
      return;
  } // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).


  this.charBuffer = new Buffer$1(6); // Number of bytes received for the current incomplete multi-byte character.

  this.charReceived = 0; // Number of bytes expected for the current incomplete multi-byte character.

  this.charLength = 0;
}
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .

StringDecoder.prototype.write = function (buffer) {
  var charStr = ''; // if our last write ended with an incomplete multibyte character

  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = buffer.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : buffer.length; // add the new bytes to the char buffer

    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    } // remove bytes belonging to the current character from the buffer


    buffer = buffer.slice(available, buffer.length); // get the character that was split

    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding); // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character

    var charCode = charStr.charCodeAt(charStr.length - 1);

    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }

    this.charReceived = this.charLength = 0; // if there are no more bytes in this buffer, just emit our char

    if (buffer.length === 0) {
      return charStr;
    }

    break;
  } // determine and set charLength / charReceived


  this.detectIncompleteChar(buffer);
  var end = buffer.length;

  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);
  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end); // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character

  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  } // or just emit the charStr


  return charStr;
}; // detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.


StringDecoder.prototype.detectIncompleteChar = function (buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = buffer.length >= 3 ? 3 : buffer.length; // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.

  for (; i > 0; i--) {
    var c = buffer[buffer.length - i]; // See http://en.wikipedia.org/wiki/UTF-8#Description
    // 110XXXXX

    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    } // 1110XXXX


    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    } // 11110XXX


    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }

  this.charReceived = i;
};

StringDecoder.prototype.end = function (buffer) {
  var res = '';
  if (buffer && buffer.length) res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

Readable.ReadableState = ReadableState;
var debug = debuglog('stream');
inherits$1(Readable, EventEmitter);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function listenerCount$1(emitter, type) {
  return emitter.listeners(type).length;
}

function ReadableState(options, stream) {
  options = options || {}; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm; // cast to ints.

  this.highWaterMark = ~~this.highWaterMark; // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.

  this.ranOut = false; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {
  if (!(this instanceof Readable)) return new Readable(options);
  this._readableState = new ReadableState(options, this); // legacy

  this.readable = true;
  if (options && typeof options.read === 'function') this._read = options.read;
  EventEmitter.call(this);
} // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.

Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;

    if (encoding !== state.encoding) {
      chunk = Buffer.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);

  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');

      stream.emit('error', _e);
    } else {
      var skipAdd;

      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false; // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode

      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
} // if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.


function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
} // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
}; // Don't raise the hwm > 8MB


var MAX_HWM = 0x800000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;

  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }

  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true; // emit 'readable' now to make sure it gets picked up.

  emitReadable(stream);
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;

  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;else len = state.length;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = !pipeOpts || pipeOpts.end !== false;
  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable) {
    debug('onunpipe');

    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  } // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.


  var increasedAwaitDrain = false;
  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);

    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (listenerCount$1(dest, 'error') === 0) dest.emit('error', er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && src.listeners('data').length) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var _i = 0; _i < len; _i++) {
      dests[_i].emit('unpipe', this);
    }

    return this;
  } // try to find the right one.


  var i = indexOf(state.pipes, dest);
  if (i === -1) return this;
  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = EventEmitter.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;

    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;

      if (!state.reading) {
        nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }

  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {}
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;
  var self = this;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
    var ret = self.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  }); // when we try to consume some more bytes, simply unpause the
  // underlying stream.

  self._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
}; // exposed for testing purposes only.


Readable._fromList = fromList; // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }
  return ret;
} // Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.


function fromListPartial(n, list, hasStrings) {
  var ret;

  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }

  return ret;
} // Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.


function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;

  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;

    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }

      break;
    }

    ++c;
  }

  list.length -= c;
  return ret;
} // Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.


function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;

  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;

    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }

      break;
    }

    ++c;
  }

  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState; // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.

  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}

// A bit simpler than readable streams.
Writable.WritableState = WritableState;
inherits$1(Writable, EventEmitter);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Object.defineProperty(this, 'buffer', {
    get: deprecate(function () {
      return this.getBuffer();
    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
  });
  options = options || {}; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm; // cast to ints.

  this.highWaterMark = ~~this.highWaterMark;
  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};
function Writable(options) {
  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);
  this._writableState = new WritableState(options, this); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  EventEmitter.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.

Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end'); // TODO: defer error events consistently everywhere, not just the cb

  stream.emit('error', er);
  nextTick(cb, er);
} // If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.


function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false; // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }

  if (er) {
    stream.emit('error', er);
    nextTick(cb, er);
    valid = false;
  }

  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;
  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer$1.from(chunk, encoding);
  }

  return chunk;
} // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.


function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) nextTick(cb, er);else cb(er);
  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      nextTick(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;

    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;

    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }

    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}

inherits$1(Duplex, Readable);
var keys = Object.keys(Writable.prototype);

for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  if (options && options.readable === false) this.readable = false;
  if (options && options.writable === false) this.writable = false;
  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
  this.once('end', onend);
} // the no-half-open enforcer

function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

// a transform stream is a readable/writable stream where you do
inherits$1(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));
  ts.writechunk = null;
  ts.writecb = null;
  if (data !== null && data !== undefined) stream.push(data);
  cb(er);
  var rs = stream._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = new TransformState(this); // when the writable side finishes, then flush out anything remaining.

  var stream = this; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er) {
      done(stream, er);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('Not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er) {
  if (er) return stream.emit('error', er); // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  var ws = stream._writableState;
  var ts = stream._transformState;
  if (ws.length) throw new Error('Calling transform done when ws.length != 0');
  if (ts.transforming) throw new Error('Calling transform done when still transforming');
  return stream.push(null);
}

inherits$1(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

inherits$1(Stream, EventEmitter);
Stream.Readable = Readable;
Stream.Writable = Writable;
Stream.Duplex = Duplex;
Stream.Transform = Transform;
Stream.PassThrough = PassThrough; // Backwards-compat with node 0.4.x

Stream.Stream = Stream;
// part of this class) is overridden in the Readable class.

function Stream() {
  EventEmitter.call(this);
}

Stream.prototype.pipe = function (dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain); // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.

  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;

  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;
    dest.end();
  }

  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;
    if (typeof dest.destroy === 'function') dest.destroy();
  } // don't leave dangling pipes when there are errors.


  function onerror(er) {
    cleanup();

    if (EventEmitter.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror); // remove all the event listeners that were added.

  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);
    source.removeListener('end', onend);
    source.removeListener('close', onclose);
    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);
    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);
  dest.on('close', cleanup);
  dest.emit('pipe', source); // Allow for unix-like usage: A.pipe(B).pipe(C)

  return dest;
};

var rStates = {
  UNSENT: 0,
  OPENED: 1,
  HEADERS_RECEIVED: 2,
  LOADING: 3,
  DONE: 4
};
function IncomingMessage(xhr, response, mode) {
  var self = this;
  Readable.call(self);
  self._mode = mode;
  self.headers = {};
  self.rawHeaders = [];
  self.trailers = {};
  self.rawTrailers = []; // Fake the 'close' event, but only once 'end' fires

  self.on('end', function () {
    // The nextTick is necessary to prevent the 'request' module from causing an infinite loop
    process.nextTick(function () {
      self.emit('close');
    });
  });
  var read;

  if (mode === 'fetch') {
    self._fetchResponse = response;
    self.url = response.url;
    self.statusCode = response.status;
    self.statusMessage = response.statusText; // backwards compatible version of for (<item> of <iterable>):
    // for (var <item>,_i,_it = <iterable>[Symbol.iterator](); <item> = (_i = _it.next()).value,!_i.done;)

    for (var header, _i, _it = response.headers[Symbol.iterator](); header = (_i = _it.next()).value, !_i.done;) {
      self.headers[header[0].toLowerCase()] = header[1];
      self.rawHeaders.push(header[0], header[1]);
    } // TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed


    var reader = response.body.getReader();

    read = function () {
      reader.read().then(function (result) {
        if (self._destroyed) return;

        if (result.done) {
          self.push(null);
          return;
        }

        self.push(new Buffer(result.value));
        read();
      });
    };

    read();
  } else {
    self._xhr = xhr;
    self._pos = 0;
    self.url = xhr.responseURL;
    self.statusCode = xhr.status;
    self.statusMessage = xhr.statusText;
    var headers = xhr.getAllResponseHeaders().split(/\r?\n/);
    headers.forEach(function (header) {
      var matches = header.match(/^([^:]+):\s*(.*)/);

      if (matches) {
        var key = matches[1].toLowerCase();

        if (key === 'set-cookie') {
          if (self.headers[key] === undefined) {
            self.headers[key] = [];
          }

          self.headers[key].push(matches[2]);
        } else if (self.headers[key] !== undefined) {
          self.headers[key] += ', ' + matches[2];
        } else {
          self.headers[key] = matches[2];
        }

        self.rawHeaders.push(matches[1], matches[2]);
      }
    });
    self._charset = 'x-user-defined';

    if (!overrideMimeType) {
      var mimeType = self.rawHeaders['mime-type'];

      if (mimeType) {
        var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/);

        if (charsetMatch) {
          self._charset = charsetMatch[1].toLowerCase();
        }
      }

      if (!self._charset) self._charset = 'utf-8'; // best guess
    }
  }
}
inherits$1(IncomingMessage, Readable);

IncomingMessage.prototype._read = function () {};

IncomingMessage.prototype._onXHRProgress = function () {
  var self = this;
  var xhr = self._xhr;
  var response = null;

  switch (self._mode) {
    case 'text:vbarray':
      // For IE9
      if (xhr.readyState !== rStates.DONE) break;

      try {
        // This fails in IE8
        response = new global.VBArray(xhr.responseBody).toArray();
      } catch (e) {// pass
      }

      if (response !== null) {
        self.push(new Buffer(response));
        break;
      }

    // Falls through in IE8

    case 'text':
      try {
        // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
        response = xhr.responseText;
      } catch (e) {
        self._mode = 'text:vbarray';
        break;
      }

      if (response.length > self._pos) {
        var newData = response.substr(self._pos);

        if (self._charset === 'x-user-defined') {
          var buffer = new Buffer(newData.length);

          for (var i = 0; i < newData.length; i++) buffer[i] = newData.charCodeAt(i) & 0xff;

          self.push(buffer);
        } else {
          self.push(newData, self._charset);
        }

        self._pos = response.length;
      }

      break;

    case 'arraybuffer':
      if (xhr.readyState !== rStates.DONE || !xhr.response) break;
      response = xhr.response;
      self.push(new Buffer(new Uint8Array(response)));
      break;

    case 'moz-chunked-arraybuffer':
      // take whole
      response = xhr.response;
      if (xhr.readyState !== rStates.LOADING || !response) break;
      self.push(new Buffer(new Uint8Array(response)));
      break;

    case 'ms-stream':
      response = xhr.response;
      if (xhr.readyState !== rStates.LOADING) break;
      var reader = new global.MSStreamReader();

      reader.onprogress = function () {
        if (reader.result.byteLength > self._pos) {
          self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))));
          self._pos = reader.result.byteLength;
        }
      };

      reader.onload = function () {
        self.push(null);
      }; // reader.onerror = ??? // TODO: this


      reader.readAsArrayBuffer(response);
      break;
  } // The ms-stream case handles end separately in reader.onload()


  if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
    self.push(null);
  }
};

// from https://github.com/jhiesey/to-arraybuffer/blob/6502d9850e70ba7935a7df4ad86b358fc216f9f0/index.js
function toArrayBuffer (buf) {
  // If the buffer is backed by a Uint8Array, a faster version will work
  if (buf instanceof Uint8Array) {
    // If the buffer isn't a subarray, return the underlying ArrayBuffer
    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
      return buf.buffer;
    } else if (typeof buf.buffer.slice === 'function') {
      // Otherwise we need to get a proper copy
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
  }

  if (isBuffer$1(buf)) {
    // This is the slow version that will work with any Buffer
    // implementation (even in old browsers)
    var arrayCopy = new Uint8Array(buf.length);
    var len = buf.length;

    for (var i = 0; i < len; i++) {
      arrayCopy[i] = buf[i];
    }

    return arrayCopy.buffer;
  } else {
    throw new Error('Argument must be a Buffer');
  }
}

function decideMode(preferBinary, useFetch) {
  if (hasFetch && useFetch) {
    return 'fetch';
  } else if (mozchunkedarraybuffer) {
    return 'moz-chunked-arraybuffer';
  } else if (msstream) {
    return 'ms-stream';
  } else if (arraybuffer && preferBinary) {
    return 'arraybuffer';
  } else if (vbArray && preferBinary) {
    return 'text:vbarray';
  } else {
    return 'text';
  }
}

function ClientRequest(opts) {
  var self = this;
  Writable.call(self);
  self._opts = opts;
  self._body = [];
  self._headers = {};
  if (opts.auth) self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'));
  Object.keys(opts.headers).forEach(function (name) {
    self.setHeader(name, opts.headers[name]);
  });
  var preferBinary;
  var useFetch = true;

  if (opts.mode === 'disable-fetch') {
    // If the use of XHR should be preferred and includes preserving the 'content-type' header
    useFetch = false;
    preferBinary = true;
  } else if (opts.mode === 'prefer-streaming') {
    // If streaming is a high priority but binary compatibility and
    // the accuracy of the 'content-type' header aren't
    preferBinary = false;
  } else if (opts.mode === 'allow-wrong-content-type') {
    // If streaming is more important than preserving the 'content-type' header
    preferBinary = !overrideMimeType;
  } else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
    // Use binary if text streaming may corrupt data or the content-type header, or for speed
    preferBinary = true;
  } else {
    throw new Error('Invalid value for opts.mode');
  }

  self._mode = decideMode(preferBinary, useFetch);
  self.on('finish', function () {
    self._onFinish();
  });
}

inherits$1(ClientRequest, Writable); // Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method

var unsafeHeaders = ['accept-charset', 'accept-encoding', 'access-control-request-headers', 'access-control-request-method', 'connection', 'content-length', 'cookie', 'cookie2', 'date', 'dnt', 'expect', 'host', 'keep-alive', 'origin', 'referer', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'user-agent', 'via'];

ClientRequest.prototype.setHeader = function (name, value) {
  var self = this;
  var lowerName = name.toLowerCase(); // This check is not necessary, but it prevents warnings from browsers about setting unsafe
  // headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
  // http-browserify did it, so I will too.

  if (unsafeHeaders.indexOf(lowerName) !== -1) return;
  self._headers[lowerName] = {
    name: name,
    value: value
  };
};

ClientRequest.prototype.getHeader = function (name) {
  var self = this;
  return self._headers[name.toLowerCase()].value;
};

ClientRequest.prototype.removeHeader = function (name) {
  var self = this;
  delete self._headers[name.toLowerCase()];
};

ClientRequest.prototype._onFinish = function () {
  var self = this;
  if (self._destroyed) return;
  var opts = self._opts;
  var headersObj = self._headers;
  var body;

  if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') {
    if (blobConstructor()) {
      body = new global.Blob(self._body.map(function (buffer) {
        return toArrayBuffer(buffer);
      }), {
        type: (headersObj['content-type'] || {}).value || ''
      });
    } else {
      // get utf8 string
      body = Buffer.concat(self._body).toString();
    }
  }

  if (self._mode === 'fetch') {
    var headers = Object.keys(headersObj).map(function (name) {
      return [headersObj[name].name, headersObj[name].value];
    });
    global.fetch(self._opts.url, {
      method: self._opts.method,
      headers: headers,
      body: body,
      mode: 'cors',
      credentials: opts.withCredentials ? 'include' : 'same-origin'
    }).then(function (response) {
      self._fetchResponse = response;

      self._connect();
    }, function (reason) {
      self.emit('error', reason);
    });
  } else {
    var xhr = self._xhr = new global.XMLHttpRequest();

    try {
      xhr.open(self._opts.method, self._opts.url, true);
    } catch (err) {
      process.nextTick(function () {
        self.emit('error', err);
      });
      return;
    } // Can't set responseType on really old browsers


    if ('responseType' in xhr) xhr.responseType = self._mode.split(':')[0];
    if ('withCredentials' in xhr) xhr.withCredentials = !!opts.withCredentials;
    if (self._mode === 'text' && 'overrideMimeType' in xhr) xhr.overrideMimeType('text/plain; charset=x-user-defined');
    Object.keys(headersObj).forEach(function (name) {
      xhr.setRequestHeader(headersObj[name].name, headersObj[name].value);
    });
    self._response = null;

    xhr.onreadystatechange = function () {
      switch (xhr.readyState) {
        case rStates.LOADING:
        case rStates.DONE:
          self._onXHRProgress();

          break;
      }
    }; // Necessary for streaming in Firefox, since xhr.response is ONLY defined
    // in onprogress, not in onreadystatechange with xhr.readyState = 3


    if (self._mode === 'moz-chunked-arraybuffer') {
      xhr.onprogress = function () {
        self._onXHRProgress();
      };
    }

    xhr.onerror = function () {
      if (self._destroyed) return;
      self.emit('error', new Error('XHR error'));
    };

    try {
      xhr.send(body);
    } catch (err) {
      process.nextTick(function () {
        self.emit('error', err);
      });
      return;
    }
  }
};
/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */


function statusValid(xhr) {
  try {
    var status = xhr.status;
    return status !== null && status !== 0;
  } catch (e) {
    return false;
  }
}

ClientRequest.prototype._onXHRProgress = function () {
  var self = this;
  if (!statusValid(self._xhr) || self._destroyed) return;
  if (!self._response) self._connect();

  self._response._onXHRProgress();
};

ClientRequest.prototype._connect = function () {
  var self = this;
  if (self._destroyed) return;
  self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode);
  self.emit('response', self._response);
};

ClientRequest.prototype._write = function (chunk, encoding, cb) {
  var self = this;

  self._body.push(chunk);

  cb();
};

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
  var self = this;
  self._destroyed = true;
  if (self._response) self._response._destroyed = true;
  if (self._xhr) self._xhr.abort(); // Currently, there isn't a way to truly abort a fetch.
  // If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27
};

ClientRequest.prototype.end = function (data, encoding, cb) {
  var self = this;

  if (typeof data === 'function') {
    cb = data;
    data = undefined;
  }

  Writable.prototype.end.call(self, data, encoding, cb);
};

ClientRequest.prototype.flushHeaders = function () {};

ClientRequest.prototype.setTimeout = function () {};

ClientRequest.prototype.setNoDelay = function () {};

ClientRequest.prototype.setSocketKeepAlive = function () {};

/*
this and http-lib folder

The MIT License

Copyright (c) 2015 John Hiesey

Permission is hereby granted, free of charge,
to any person obtaining a copy of this software and
associated documentation files (the "Software"), to
deal in the Software without restriction, including
without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom
the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
function request(opts, cb) {
  if (typeof opts === 'string') opts = urlParse(opts); // Normally, the page is loaded from http or https, so not specifying a protocol
  // will result in a (valid) protocol-relative url. However, this won't work if
  // the protocol is something else, like 'file:'

  var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : '';
  var protocol = opts.protocol || defaultProtocol;
  var host = opts.hostname || opts.host;
  var port = opts.port;
  var path = opts.path || '/'; // Necessary for IPv6 addresses

  if (host && host.indexOf(':') !== -1) host = '[' + host + ']'; // This may be a relative url. The browser should always be able to interpret it correctly.

  opts.url = (host ? protocol + '//' + host : '') + (port ? ':' + port : '') + path;
  opts.method = (opts.method || 'GET').toUpperCase();
  opts.headers = opts.headers || {}; // Also valid opts.auth, opts.mode

  var req = new ClientRequest(opts);
  if (cb) req.on('response', cb);
  return req;
}
function get(opts, cb) {
  var req = request(opts, cb);
  req.end();
  return req;
}
function Agent() {}
Agent.defaultMaxSockets = 4;
var METHODS = ['CHECKOUT', 'CONNECT', 'COPY', 'DELETE', 'GET', 'HEAD', 'LOCK', 'M-SEARCH', 'MERGE', 'MKACTIVITY', 'MKCOL', 'MOVE', 'NOTIFY', 'OPTIONS', 'PATCH', 'POST', 'PROPFIND', 'PROPPATCH', 'PURGE', 'PUT', 'REPORT', 'SEARCH', 'SUBSCRIBE', 'TRACE', 'UNLOCK', 'UNSUBSCRIBE'];
var STATUS_CODES = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  // RFC 2518, obsoleted by RFC 4918
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  // RFC 4918
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Moved Temporarily',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a teapot',
  // RFC 2324
  422: 'Unprocessable Entity',
  // RFC 4918
  423: 'Locked',
  // RFC 4918
  424: 'Failed Dependency',
  // RFC 4918
  425: 'Unordered Collection',
  // RFC 4918
  426: 'Upgrade Required',
  // RFC 2817
  428: 'Precondition Required',
  // RFC 6585
  429: 'Too Many Requests',
  // RFC 6585
  431: 'Request Header Fields Too Large',
  // RFC 6585
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  // RFC 2295
  507: 'Insufficient Storage',
  // RFC 4918
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  // RFC 2774
  511: 'Network Authentication Required' // RFC 6585

};
var require$$4 = {
  request,
  get,
  Agent,
  METHODS,
  STATUS_CODES
};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;

  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];

    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  } // if the path is allowed to go above the root, restore leading ..s


  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
} // Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.


var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

var splitPath = function (filename) {
  return splitPathRe.exec(filename).slice(1);
}; // path.resolve([from ...], to)
// posix version


function resolve() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : '/'; // Skip empty and invalid entries

    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  } // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)
  // Normalize the path


  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
    return !!p;
  }), !resolvedAbsolute).join('/');
  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
}
// posix version

function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/'; // Normalize the path

  path = normalizeArray(filter(path.split('/'), function (p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }

  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}

function isAbsolute(path) {
  return path.charAt(0) === '/';
} // posix version

function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function (p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }

    return p;
  }).join('/'));
} // path.relative(from, to)
// posix version

function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;

    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;

    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;

  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];

  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join('/');
}
var sep = '/';
var delimiter$1 = ':';
function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}
function basename(path, ext) {
  var f = splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?

  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }

  return f;
}
function extname(path) {
  return splitPath(path)[3];
}
var require$$5 = {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter$1,
  relative: relative,
  join: join,
  isAbsolute: isAbsolute,
  normalize: normalize,
  resolve: resolve
};

function filter(xs, f) {
  if (xs.filter) return xs.filter(f);
  var res = [];

  for (var i = 0; i < xs.length; i++) {
    if (f(xs[i], i, xs)) res.push(xs[i]);
  }

  return res;
} // String.prototype.substr - negative index don't work in IE8


var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
  return str.substr(start, len);
} : function (str, start, len) {
  if (start < 0) start = str.length + start;
  return str.substr(start, len);
};

/**
 * Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
 *
 * This can be used with JS designed for browsers to improve reuse of code and
 * allow the use of existing libraries.
 *
 * Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
 *
 * @author Dan DeFelippi <dan@driverdan.com>
 * @contributor David Ellis <d.f.ellis@ieee.org>
 * @license MIT
 */




var spawn = fs.spawn;

var XMLHttpRequest = function (cfg) {
  cfg = cfg || {};

  var http = require$$4;

  var https = require$$4; // Set some default headers


  var defaultHeaders = {
    "User-Agent": "node-XMLHttpRequest",
    "Accept": "*/*"
  };

  function XMLHttpRequest() {
    /**
     * Private variables
     */
    // Holds http.js objects
    // this._request;
    // this._response;
    // Request settings
    this._settings = {}; // Disable header blacklist.
    // Not part of XHR specs.

    this._disableHeaderCheck = false;
    this._headers = defaultHeaders; // Send flag

    this._sendFlag = false; // Error flag, used when errors occur or abort is called

    this._errorFlag = false; // Event listeners

    this._listeners = {};
    /**
     * Constants
     */

    this.UNSENT = 0;
    this.OPENED = 1;
    this.HEADERS_RECEIVED = 2;
    this.LOADING = 3;
    this.DONE = 4;
    /**
     * Public vars
     */
    // Current state

    this.readyState = this.UNSENT; // default ready state change handler in case one is not set or is set late

    this.onreadystatechange = null; // Result & response

    this.responseText = "";
    this.responseXML = "";
    this.status = null;
    this.statusText = null;
    /**
     * Private methods
     */
  }
  // The following are allowed but banned in the spec:
  // * user-agent

  var forbiddenRequestHeaders = ["accept-charset", "accept-encoding", "access-control-request-headers", "access-control-request-method", "connection", "content-length", "content-transfer-encoding", "cookie", "cookie2", "date", "expect", "host", "keep-alive", "origin", "referer", "te", "trailer", "transfer-encoding", "upgrade", "via"];
  /**
   * Check if the specified header is allowed.
   *
   * @param string header Header to validate
   * @return boolean False if not allowed, otherwise true
   */

  XMLHttpRequest.prototype._isAllowedHttpHeader = function (header) {
    return this._disableHeaderCheck || header && forbiddenRequestHeaders.indexOf(header.toLowerCase()) === -1;
  };
  /**
   * Changes readyState and calls onreadystatechange.
   *
   * @param int state New state
   */


  XMLHttpRequest.prototype._setState = function (state) {
    var self = this;

    if (state === self.LOADING || self.readyState !== state) {
      self.readyState = state;

      if (self._settings.async || self.readyState < self.OPENED || self.readyState === self.DONE) {
        self.dispatchEvent("readystatechange");
      }

      if (self.readyState === self.DONE && !self._errorFlag) {
        self.dispatchEvent("load"); // @TODO figure out InspectorInstrumentation::didLoadXHR(cookie)

        self.dispatchEvent("loadend");
      }
    }
  }; // These request methods are not allowed


  var forbiddenRequestMethods = ["TRACE", "TRACK", "CONNECT"];
  /**
   * Check if the specified method is allowed.
   *
   * @param string method Request method to validate
   * @return boolean False if not allowed, otherwise true
   */

  var isAllowedHttpMethod = function (method) {
    return method && forbiddenRequestMethods.indexOf(method) === -1;
  };
  /**
   * Public methods
   */

  /**
   * Open the connection. Currently supports local server requests.
   *
   * @param string method Connection method (eg GET, POST)
   * @param string url URL for the connection.
   * @param boolean async Asynchronous connection. Default is true.
   * @param string user Username for basic authentication (optional)
   * @param string password Password for basic authentication (optional)
   */


  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this.abort();
    this._errorFlag = false; // Check for valid request method

    if (!isAllowedHttpMethod(method)) {
      throw new Error("SecurityError: Request method not allowed");
    }

    this._settings = {
      "method": method,
      "url": url.toString(),
      "async": typeof async !== "boolean" ? true : async,
      "user": user || null,
      "password": password || null
    };

    this._setState(this.OPENED);
  };
  /**
   * Disables or enables isAllowedHttpHeader() check the request. Enabled by default.
   * This does not conform to the W3C spec.
   *
   * @param boolean state Enable or disable header checking.
   */


  XMLHttpRequest.prototype.setDisableHeaderCheck = function (state) {
    this._disableHeaderCheck = state;
  };
  /**
   * Sets a header for the request.
   *
   * @param string header Header name
   * @param string value Header value
   */


  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    if (this.readyState !== this.OPENED) {
      throw new Error("INVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN");
    }

    if (!this._isAllowedHttpHeader(header)) {
      console.warn('Refused to set unsafe header "' + header + '"');
      return;
    }

    if (this._sendFlag) {
      throw new Error("INVALID_STATE_ERR: send flag is true");
    }

    this._headers[header] = value;
  };
  /**
   * Gets a header from the server response.
   *
   * @param string header Name of header to get.
   * @return string Text of the header or null if it doesn't exist.
   */


  XMLHttpRequest.prototype.getResponseHeader = function (header) {
    if (typeof header === "string" && this.readyState > this.OPENED && this._response && this._response.headers && this._response.headers[header.toLowerCase()] && !this._errorFlag) {
      return this._response.headers[header.toLowerCase()];
    }

    return null;
  };
  /**
   * Gets all the response headers.
   *
   * @return string A string with all response headers separated by CR+LF
   */


  XMLHttpRequest.prototype.getAllResponseHeaders = function () {
    if (this.readyState < this.HEADERS_RECEIVED || this._errorFlag) {
      return "";
    }

    var result = "";
    var i;

    for (i in this._response.headers) {
      if (this._response.headers.hasOwnProperty(i)) {
        // Cookie headers are excluded
        if (i !== "set-cookie" && i !== "set-cookie2") {
          result += i + ": " + this._response.headers[i] + "\r\n";
        }
      }
    }

    return result.substr(0, result.length - 2);
  };
  /**
   * Gets a request header
   *
   * @param string name Name of header to get
   * @return string Returns the request header or empty string if not set
   */


  XMLHttpRequest.prototype.getRequestHeader = function (name) {
    // @TODO Make this case insensitive
    if (typeof name === "string" && this._headers[name]) {
      return this._headers[name];
    }

    return "";
  };
  /**
   * Sends the request to the server.
   *
   * @param string data Optional data to send as request body.
   */


  XMLHttpRequest.prototype.send = function (data) {
    var self = this;

    if (this.readyState !== this.OPENED) {
      throw new Error("INVALID_STATE_ERR: connection must be opened before send() is called");
    }

    if (this._sendFlag) {
      throw new Error("INVALID_STATE_ERR: send has already been called");
    }

    var ssl = false,
        local = false;
    var url = Url.parse(this._settings.url);
    var host;

    function getStack() {
      var orig = Error.prepareStackTrace;

      Error.prepareStackTrace = function (_, stack) {
        return stack;
      };

      var err = new Error();
      Error.captureStackTrace(err, arguments.callee); // eslint-disable-line no-caller

      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    } // Determine the server


    switch (url.protocol) {
      case 'https:':
        ssl = true;
      // SSL & non-SSL both need host, no break here.

      /* falls through */

      case 'http:':
        host = url.hostname;
        break;

      case 'file:':
        local = true;
        break;

      case undefined:
      case null:
      case '':
        var stack = getStack();

        var path = require$$5;

        var basePath = cfg.basePath || path.dirname(stack.reverse().find(function (item) {
          var filename = item.getFileName();
          var idx = filename.search(/[/\\]node_modules[/\\]/);

          if (idx === -1) {
            // Should be a user file, as a node executable like nodeunit ought to have node_modules in the path
            return true;
          } // Should be a user file because its last "node_modules" contains this XMLHttpRequest file (i.e., XMLHttpRequest is a dependency of some kind)


          if (__dirname.includes(filename.slice(0, idx))) {
            return true;
          }

          return false;
        }).getFileName()); // var pathName = Url.resolve(basePath, this._settings.url); // We should support this instead if the config were relative to URL

        var pathName = path.resolve(basePath, this._settings.url);
        url = {
          pathname: pathName
        };
        local = true;
        break;

      default:
        throw new Error("Protocol not supported.");
    } // Load files off the local filesystem (file://)


    if (local) {
      if (this._settings.method !== "GET") {
        throw new Error("XMLHttpRequest: Only GET method is supported");
      }

      if (this._settings.async) {
        fs.readFile(url.pathname, 'utf8', function (error, data) {
          if (error) {
            self.handleError(error);
          } else {
            self.status = 200;
            self.responseText = data;

            self._setState(self.DONE);
          }
        });
      } else {
        try {
          this.responseText = fs.readFileSync(url.pathname, 'utf8');
          this.status = 200;

          this._setState(self.DONE);
        } catch (e) {
          this.handleError(e);
        }
      }

      return;
    } // Default to port 80. If accessing localhost on another port be sure
    // to use http://localhost:port/path


    var port = url.port || (ssl ? 443 : 80); // Add query string if one is used

    var uri = url.pathname + (url.search || ''); // Set the Host header or the server may reject the request

    this._headers.Host = host;

    if (!(ssl && port === 443 || port === 80)) {
      this._headers.Host += ':' + url.port;
    } // Set Basic Auth if necessary


    if (this._settings.user) {
      if (this._settings.password === undefined) {
        this._settings.password = "";
      }

      var authBuf = Buffer.from(this._settings.user + ":" + this._settings.password);
      this._headers.Authorization = "Basic " + authBuf.toString("base64");
    } // Set content length header


    if (this._settings.method === "GET" || this._settings.method === "HEAD") {
      data = null;
    } else if (data) {
      this._headers["Content-Length"] = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);

      if (!this._headers["Content-Type"]) {
        this._headers["Content-Type"] = "text/plain;charset=UTF-8";
      }
    } else if (this._settings.method === "POST") {
      // For a post with no data set Content-Length: 0.
      // This is required by buggy servers that don't meet the specs.
      this._headers["Content-Length"] = 0;
    }

    var options = {
      host: host,
      port: port,
      path: uri,
      method: this._settings.method,
      headers: this._headers,
      agent: false
    };
    var doRequest; // Reset error flag

    this._errorFlag = false; // Error handler for the request

    function errorHandler(error) {
      self.handleError(error);
    } // Handler for the response


    function responseHandler(resp) {
      // Set response var to the response we got back
      // This is so it remains accessable outside this scope
      this._response = resp; // Check for redirect
      // @TODO Prevent looped redirects

      if (this._response.statusCode === 301 || this._response.statusCode === 302 || this._response.statusCode === 303 || this._response.statusCode === 307) {
        // Change URL to the redirect location
        this._settings.url = this._response.headers.location;
        url = Url.parse(this._settings.url); // Set host var in case it's used later

        host = url.hostname; // Options for the new request

        var newOptions = {
          hostname: url.hostname,
          port: url.port,
          path: url.path,
          method: this._response.statusCode === 303 ? 'GET' : this._settings.method,
          headers: this._headers
        }; // Issue the new request

        this._request = doRequest(newOptions, responseHandler).on('error', errorHandler);

        this._request.end(); // @TODO Check if an XHR event needs to be fired here


        return;
      }

      this._response.setEncoding("utf8");

      self._setState(self.HEADERS_RECEIVED);

      self.status = this._response.statusCode;

      this._response.on('data', function (chunk) {
        // Make sure there's some data
        if (chunk) {
          self.responseText += chunk;
        } // Don't emit state changes if the connection has been aborted.


        if (self._sendFlag) {
          self._setState(self.LOADING);
        }
      });

      this._response.on('end', function () {
        if (self._sendFlag) {
          // Discard the 'end' event if the connection has been aborted
          self._setState(self.DONE);

          self._sendFlag = false;
        }
      });

      this._response.on('error', function (error) {
        self.handleError(error);
      });
    } // Handle async requests


    if (this._settings.async) {
      // Use the proper protocol
      doRequest = ssl ? https.request : http.request; // Request is being sent, set send flag

      self._sendFlag = true; // As per spec, this is called here for historical reasons.

      self.dispatchEvent("readystatechange"); // Create the request

      this._request = doRequest(options, responseHandler).on('error', errorHandler); // Node 0.4 and later won't accept empty data. Make sure it's needed.

      if (data) {
        this._request.write(data);
      }

      this._request.end();

      self.dispatchEvent("loadstart");
    } else {
      // Synchronous
      // Create a temporary file for communication with the other Node process
      var contentFile = ".node-xmlhttprequest-content-" + process.pid;
      var syncFile = ".node-xmlhttprequest-sync-" + process.pid;
      fs.writeFileSync(syncFile, "", "utf8"); // The async request the other Node process executes

      var execString = "var http = require('http'), https = require('https'), fs = require('fs');" + "var doRequest = http" + (ssl ? "s" : "") + ".request;" + "var options = " + JSON.stringify(options) + ";" + "var responseText = '';" + "var req = doRequest(options, function(response) {" + "response.setEncoding('utf8');" + "response.on('data', function(chunk) {" + "  responseText += chunk;" + "});" + "response.on('end', function() {" + "fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-STATUS:' + response.statusCode + ',' + responseText, 'utf8');" + "fs.unlinkSync('" + syncFile + "');" + "});" + "response.on('error', function(error) {" + "fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');" + "fs.unlinkSync('" + syncFile + "');" + "});" + "}).on('error', function(error) {" + "fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');" + "fs.unlinkSync('" + syncFile + "');" + "});" + (data ? "req.write('" + JSON.stringify(data).slice(1, -1).replace(/'/g, "\\'") + "');" : "") + "req.end();"; // Start the other Node Process, executing this string

      var syncProc = spawn(process.argv[0], ["-e", execString]);

      while (fs.existsSync(syncFile)) {// Wait while the sync file is empty
      }

      self.responseText = fs.readFileSync(contentFile, 'utf8'); // Kill the child process once the file has data

      syncProc.stdin.end(); // Remove the temporary file

      fs.unlinkSync(contentFile);

      if (self.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/)) {
        // If the file returned an error, handle it
        var errorObj = self.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/, "");
        self.handleError(errorObj);
      } else {
        // If the file returned okay, parse its data and move to the DONE state
        self.status = parseInt(self.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/, "$1"), 10);
        self.responseText = self.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/, "$1");

        self._setState(self.DONE);
      }
    }
  };
  /**
   * Called when an error is encountered to deal with it.
   */


  XMLHttpRequest.prototype.handleError = function (error) {
    this.status = 503;
    this.statusText = error;
    this.responseText = error.stack;
    this._errorFlag = true;

    this._setState(this.DONE);
  };
  /**
   * Aborts a request.
   */


  XMLHttpRequest.prototype.abort = function () {
    if (this._request) {
      this._request.abort();

      this._request = null;
    }

    this._headers = defaultHeaders;
    this.responseText = "";
    this.responseXML = "";
    this._errorFlag = true;

    if (this.readyState !== this.UNSENT && (this.readyState !== this.OPENED || this._sendFlag) && this.readyState !== this.DONE) {
      this._sendFlag = false;

      this._setState(this.DONE);
    }

    this.readyState = this.UNSENT;
  };
  /**
   * Adds an event listener. Preferred method of binding to events.
   */


  XMLHttpRequest.prototype.addEventListener = function (event, callback) {
    if (!this._listeners.hasOwnProperty(event)) {
      this._listeners[event] = [];
    } // Currently allows duplicate callbacks. Should it?


    this._listeners[event].push(callback);
  };
  /**
   * Remove an event callback that has already been bound.
   * Only works on the matching funciton, cannot be a copy.
   */


  XMLHttpRequest.prototype.removeEventListener = function (event, callback) {
    if (this._listeners.hasOwnProperty(event)) {
      // Filter will return a new array with the callback removed
      this._listeners[event] = this._listeners[event].filter(function (ev) {
        return ev !== callback;
      });
    }
  };
  /**
   * Dispatch any events, including both "on" methods and events attached using addEventListener.
   */


  XMLHttpRequest.prototype.dispatchEvent = function (event) {
    var self = this;

    if (typeof self["on" + event] === "function") {
      self["on" + event]();
    }

    var i, len;

    if (this._listeners.hasOwnProperty(event)) {
      for (i = 0, len = this._listeners[event].length; i < len; i++) {
        this._listeners[event][i].call(self);
      }
    }
  };

  return XMLHttpRequest;
};

async function getJSON(jsonURL, cb, errBack) {
  try {
    if (Array.isArray(jsonURL)) {
      const arrResult = await Promise.all(jsonURL.map(url => getJSON(url)));

      if (cb) {
        cb.apply(null, arrResult);
      }

      return arrResult;
    }

    const result = await fetch(jsonURL).then(r => r.json());
    return typeof cb === 'function' ? cb(result) : result;
  } catch (e) {
    e.message += ` (File: ${jsonURL})`;

    if (errBack) {
      return errBack(e, jsonURL);
    }

    throw e;
  }
}
/* eslint-env node */


if (typeof fetch === 'undefined') {
  commonjsGlobal.fetch = jsonURL => {
    return new Promise((resolve, reject) => {
      const XMLHttpRequest$$1 = XMLHttpRequest({
        basePath: __dirname
      }); // Don't change to an import as won't resolve for browser testing


      const r = new XMLHttpRequest$$1();
      r.open('GET', jsonURL, true); // r.responseType = 'json';

      r.onreadystatechange = function () {
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

      r.send();
    });
  };
}

var indexCjs = getJSON;

// If strawman approved, this would only be

function IMFClass(opts) {
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

    const msg = new MessageFormat(message, this.langs, formats);
    return msg.format(values);
  };
};

IMFClass.prototype.loadLocales = function (langs, cb, avoidSettingLocales) {
  langs = langs || navigator.language || 'en-US';
  langs = Array.isArray(langs) ? langs : [langs];

  if (!avoidSettingLocales) {
    this.langs = langs;
  }

  return indexCjs(langs.map(this.localeFileResolver, this), (...locales) => {
    if (!avoidSettingLocales) {
      this.locales.push(...locales);
    }

    if (cb) {
      cb.apply(this, locales);
    }
  });
};

/* eslint-env node */

if (typeof global !== 'undefined') {
  global.IntlMessageFormat = MessageFormat;
}

module.exports = IMFClass;
