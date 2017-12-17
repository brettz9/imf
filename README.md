# imf

[![npm Version][npm-badge]][npm]
[![Dependency Status][david-badge]][david]
[![Greenkeeper badge](https://badges.greenkeeper.io/brettz9/imf.svg)](https://greenkeeper.io/)

A convenience wrapper for [intl-messageformat](https://github.com/yahoo/intl-messageformat).

# Installation

`npm install imf`

If you wish to use with another locale retrieving mechanism besides `simple-get-json`,
you may also wish to install `jsonpadding` (see the JSONP section below on usage).

# Usage (Browser)

For a script which will load the specified locale rule files as needed:

```html
<script src="node_modules/imf/dist/index-polyglot.js"></script>
```

or if you wish to supply your own `IntlMessageFormat` (with or without locale rules), use:

```html
<!-- You can substitute the first with the desired IntlMessageFormat and/or any dependencies;
    if it is ever implemented and adequately supported, you should be able to drop it entirely -->
<script src="node_modules/intl-messageformat/dist/intl-messageformat-with-locales.min.js"></script>
<script src="node_modules/imf/dist/index.js"></script>
<script>
const {_} = await imf({avoidRuleLoading: true, ...add other options here});
</script>
```

or:

```js
import {imf} from './node_modules/imf/dist/index-polyglot-es6.js';
const {_} = await imf({...desired options});
```

# Usage (Node)

```js
const imf = require('imf');
imf({...desired options}).then(({_}) => {});
```

# JSON Structure

The following forms are equivalent:

```json
{
    "Localized value!": "Chinese translation of \"Localized value!\"",
    "tablekey.Tablekey localized value!": "Chinese translation of \"tablekey.Tablekey localized value!\"",
    "tablekey": {
        "nestedMore": {
            "Tablekey localized value2": "Put another Chinese translation of \"tablekey.Tablekey localized value!\" here"
        }
    }
}
```

OR

```json
{
    "Localized value!": "Chinese translation of \"Localized value!\"",
    "tablekey": {
        "Tablekey localized value!": "Chinese translation of \"tablekey.Tablekey localized value!\"",
        "nestedMore": {
            "Tablekey localized value2": "Put another Chinese translation of \"tablekey.Tablekey localized value!\" here"
        }
    }
}
```

OR

```json
{
    "Localized value!": "Chinese translation of \"Localized value!\"",
    "tablekey.Tablekey localized value!": "Chinese translation of \"tablekey.Tablekey localized value!\"",
    "tablekey.nestedMore.Tablekey localized value2": "Put another Chinese translation of \"tablekey.Tablekey localized value!\" here"
}
```

We might suggest the possibility of using [cson](https://github.com/bevry/cson)
and/or JSONP with Template literals (see the JSONP section) to make the locale
file format even easier to create and maintain.

(Note that if one wishes to migrate to a more or less flattened structure, [flat](https://www.npmjs.com/package/flat) may be of assistance. It has facilities
for determining overwrite and depth behaviors as well as how to handle or create
arrays.)

# Examples

## Example (detailed)

For the above JSON, one could do the following (within an `async`
function, including possibly an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
one):

```js
// Besides the underscore ("_"), the aliases `f` and `l` are also present (formatter
//   and localizer)
const {
    _, namespacer /*, locales: [zhCNLocale, enUSLocale], fallbackLocales: []*/
} = await imf({
    languages: ['zh-CN', 'en-US']
});

// Looks up "Localized value!" in Chinese file (by
//  default at "locales/zh-CN.json") and in English
//  (by default at "locales/en-US.json") if not present in Chinese
alert(_("Localized value!"));

const tk = namespacer('tablekey');
// The following is equivalent to _("tablekey.Tablekey localized value!")
alert(tk("Tablekey localized value!"));

// Note that the following two sets are equivalent
const tk2 = namespacer(['tablekey', 'nestedMore']);
alert(tk2("Tablekey localized value2"));

const tk3 = namespacer('tablekey.nestedMore');
alert(tk3("Tablekey localized value2"));
```

## JSONP (jsonpadding) usage:

JSONP (a JavaScript file which invokes a callback, `callback`)
allows for use of regular JavaScript in building locale objects,
such as single quotes or (potentially multi-line)
[template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

```js
import JSONP from './node_modules/jsonpadding/dist/index.js';
import {imf} from './node_modules/imf/dist/index-polyglot-es6.js';

// Will look for `locales/zh-CN.js` and `locales/en-US.js`
//   which should define their locales like:
//
// callback({myKey: `My localized value`});
const {_} = await imf({
    languages: ['zh-CN', 'en-US'],
    localeExtension: 'js',
    timeout: 8000,
    retriever: JSONP
});
```

While JSONP offers the advantage of being easier than JSON to craft by hand
and standard JavaScript, it should only be used with trusted users,
since, unlike with typical uses of JSON, JSONP is empowered to run JavaScript
with all its privileges. If you want a more secure, sandboxed solution
while allowing for easier manual creation of files for localizers,
you might wish to utilize [cson](https://github.com/bevry/cson).

JSONP also has poor error reporting. Be sure to set a timeout so that
if the file cannot be obtained in a reasonable time that it will signal
an error.

# imf API

This function accepts an object with the same options documented for the
`IMF` constructor as well as for the options of `IMF.prototype.load`.
While it shouldn't normally be necessary to access, this function also
returns a `imfInstance` property with the underlying `IMF` instance
(which has an `intlMessageFormat` property should access be needed
to that instance).

# IMF API

While the constructor and internal methods are documented here, consumers should
be able to get by with `imf()` without any concern for the internal method or property
names (beyond the option names of the constructor and `IMF.prototype.load`
which are the same as the options of `imf`).

## Methods

-   *Constructor(options)* - A constructor to be supplied an options object
        with the following optional properties.

    -   `defaultNamespace` - Used when a namespace is not provided
        to the `namespacer` method (and when the returned namespacer function
        is not called with its own array-based or `defaultSeparator`-delimited
        string key). Defaults to empty string (no namespace).

    -   `defaultSeparator` - Separator to be used with
        namespaces. Defaults to `.`.

    -   `basePath` - Base path for locale file resolution.
        Defaults to `locales/`. Used by default `localeFileResolver`.

    -   `avoidRuleLoading` - Default value of `load` argument of same name.
        See `load` for a description.

    -   `languages` - Array of BCP 47 language tags. Will be used to preset
        the `languages` property. Should only be provided if `locales` is
        manually provided as well.

    -   `locales` - Array of initial locale objects (see locale JSON file
        structure above). Will set the `locales` property if present. If
        present, `languages` should also be set.

    -   `fallbackLanguages` - Same as `languages` but sets `fallbackLanguages`
        property and must accompany `fallbackLocales`.

    -   `fallbackLocales` - Same as `locales` but sets `fallbackLocales`
        property and must accompany `fallbackLanguages`.

    -   `localeExtension` - File extension to be added when forming URLs
        of locale files. Defaults to `json`. Used within `localeFileResolver`.

    -   `retriever` - The default for `load`/`loadLocales`. Defaults to
        `simple-get-json`. See `loadLocales`.

    -   `localeFileResolver` - Accepts a BCP 47 language tag as
        an argument, and should return a file path for obtaining
        the corresponding JSON locale file. Defaults to a function
        which uses `basePath` and then adds any `localeExtension` to the supplied
        language tags for the file name within the base path. The result
        is supplied to the `retriever` (which by default is `simple-get-json`).

-   `load({languages, fallbackLanguages, defaultNamespace, retriever, avoidRuleLoading})` -
    Loads a formatting localizing function, formatting namespacers (for convenient
    localization within a subsection of a locale) and locale objects based on the
    supplied languages. Also loads pluralization and parent locale rules of
    `languages` and `fallbackLanguages` by default.

    -   Arguments:

        -   `languages` - Array of BCP 47 language tags in order of preference.
            Can also be a string for a single tag (e.g., "en-US"), or, if not
            supplied, will default to `navigator.language` or `en-US`. Will
            set the `languages` property (used by `IntlMessageFormat`).

        -   `fallbackLanguages` - Allows a language or set of languages in
            the same format as `languages`. Its message will be supplied to
            the `fallback` argument of namespacer functions (or
            used in a return value if `fallback` is not `false`) whenever no
            message is found for `languages`.

        -   `defaultNamespace` - Initial namespace for the namespacer function.
            Defaults to value of the `defaultNamespace` property. Namespaces may
            be expressed as an array of namespace parts or as a string. Will be
            used in conjunction with a separator. See the example above for an
            illustration of the two allowable JSON file format structures. Note
            that namespace parts can be indefinitely nested whether as sub-objects
            or as additional separator-separated strings (or combination thereof).

        -   `retriever` - Used with `loadLocales`. See `loadLocales`.

        -   `avoidRuleLoading` - Whether to load the files needed for proper
            pluralization formatting and resolution of parent locales and
            default locales. Should normally be omitted to rely on the default
            of `false`.

    - Returns a promise which loads locales and resolves to an object with the
        following properties:

        1.  `_` (and as aliases `f` and `l`): A namespacer (formatter) function
            based on `defaultNamespace` argument (or the default `defaultNamespace` or
            the empty string if none supplied). (The aliases are provided as
            underscore may be in use by other libraries.) `f` for "formatter" may
            be more precise, but `l` for "localizer" might help distinguish
            the purpose from the various meanings of "format". See `namespacer`'s
            return value for a description of the arguments (`key`, `values`,
            `formats`, `fallback`) that can be supplied to this function.

        1.  `namespacer`: A generic namespacer (formatter) building function
            (see `namespacer` method)

        1.  `locales`: Retrieved and preexisting locale files as JSON objects.

        1.  `fallbackLocales`: Retrieved and preexisting fallback locale files
            as JSON objects.

-   `loadLocales({languages, avoidSettingLocales, retriever})` - This method
    should normally be left to `load` to invoke (as `load` will also optionally
    load rules for pluralization and parent locale setting). Loads the locale
    file objects for the given `languages`. Will be automatically
    invoked by `load` (and is used internally by `loadFallbackLocales`).
    `avoidSettingLocales` returns the locales without setting them (or
    the `languages` property). The `retriever` defaults to
    [`simple-get-json`](https://www.npmjs.com/package/simple-get-json)
    though it can be overridden with a function that will be supplied an
    array of language file names (obtained by mapping the `languages` run
    through the `localeFileResolver`); it should return a `Promise` which
    resolves to an array of locale objects.

-   `loadFallbackLocales({fallbackLanguages, avoidSettingLocales, retriever})` -
    As with `loadLocales` but loads fallback locales and sets the
    `fallbackLanguages` property. Also invoked by `load`.

-   `namespacer({namespace, separator})` - A generic formatter
    building method; can be supplied an optional `namespace` and optional
    `separator`, defaulting otherwise to the `defaultNamespace` and
    `defaultSeparator` properties, respectively. Used by `load()` for providing
    a default-namespace-based namespacer function. The namespace can either
    be an array of namespace parts or a string with the designated separator
    already applied. Any namespace (along with separator interpolated between
    and after) will be prepended to the key supplied by the user when
    the namespacer function is called. The returned namespaced
    localizer/formatting function can be called with the following
    arguments (supplied in order with all but the first being optional or
    with a single object with properties of the given name):

    1.  `key` - Lookup key for a `IntlMessageFormat`-formatted message in
        the locales file (will be prepended as per the above by any supplied
        namespaces and separators). If no `values` or `formats` objects
        are supplied, the literal value from the locales file will be
        returned without any `IntlMessageFormat` processing. If supplied
        as an array, the last item will be treated as the key whereas the
        prior portions will be treated as a namespace override. Likewise
        if a separator-separated string is supplied. Note that if a
        multi-item array (or separator-delimited string) is supplied,
        the namespace portion will override the default namespace rather
        than being appended to it.

    1.  `values` - Optional values object (same as accepted by
        `IntlMessageFormat.format()`)

    1.  `formats` - Optional formats object (same as accepted by
        the third argument to the `IntlMessageFormat` constructor).

    1.  `fallback` - Optional fallback function or boolean. If a
        function, `fallback` will be called whenever a message cannot
        be found, and will be supplied a single object argument with
        properties, `message`, `languages`, `fallbackLanguages`
        `namespace`, `separator`, `key`, `values`, and `formats` and
        whose return value will be used for the return value of the
        namespacer function (in place of any use of `IntlMessageFormat`).
        Might be used to return a different structure to indicate a
        need for different directionality (e.g., if an Arabic message
        is not found, the fallback could be used to return a value
        which can be used to indicate the English one can be displayed
        left to right). If no message is found, an otherwise non-`false`
        (including omitted) value supplied for `fallback` any message
        found for `fallbackLocales` will be processed instead.
        If no message has been found and no fallback locales set (or if
        `fallback` is `false`), a `TypeError` will be thrown.

## Properties

These should normally not be set directly and there will probably be
little need to retrieve them except possibly `intlMessageFormat`.

-   `languages` - Will automatically be set (as an array of BCP 47
    language tags) upon calls to `load` (or `loadLocales`) or if the
    `languages` option is supplied upon instantiation. Used by internal
    use of `IntlMessageFormat` and is supplied to any `formatter` function
    given to the function returned by `namespacer`. Also used in
    error messages when no message or fallback message can be found.

-   `fallbackLanguages` - Will automatically be set when using
    `load` or `loadFallbackLocales`. Otherwise as with `languages`
    but for `fallbackLanguages`.

-   `locales` - Will be set by default to an (empty) array. If
    `loadLocales` is run (including by the use of `load`), the retrieved
    locale JSON objects will be added to this array. This property
    can also be set as an array of (pre-loaded) locales at instantiation
    by a `locales` argument being given to the constructor.

-   `fallbackLocales` - As with `locales` but for fallback locales.
    Unless the `fallback` argument provided to `namespacer` is set
    to `false`, these fallback locales will be checked whenever
    `namespacer` does not find a message within the `locales` property.

-   `intlMessageFormat` - The underlying `intlMessageFormat` instance.
    Might be used to get `resolvedOptions`.
