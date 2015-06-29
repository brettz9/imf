# imf

A convenience wrapper for [intl-messageformat](https://github.com/yahoo/intl-messageformat).

# Installation

`bower install imf`

# Usage

```html
<script src="bower_components/imf/intl-messageformat-with-locales.min.js"></script>
<script src="bower_components/imf/index.js"></script>
```

# Example

```js
IMF({
    languages: ['zh-CN', 'en-US'],
    callback: function (l, getFormatter /*, enUSLocale, esLocale, ptLocale, zhCNLocale*/) {
        alert(l("Localized value!")); // Looks up "Localized value!" in Chinese file (at "locales/zh-CN.json") and in English (at "locales/en-US.json") if not present in Chinese
        var tk = getFormatter('tablekey');
        alert(tk("Tablekey localized value!")); // Equivalent to l("tablekey.Tablekey localized value!")
    }
});
```

JSON file structure:

```json
{
    "Localized value!": "Chinese translation of \"Localized value!\"",
    "tablekey.Tablekey localized value!": "Chinese translation of \"tablekey.Tablekey localized value!\""
}
```

OR

```json
{
    "Localized value!": "Chinese translation of \"Localized value!\"",
    "tablekey": {
        "Tablekey localized value!": "Chinese translation of \"tablekey.Tablekey localized value!\""
    }
}
```



# API

## Methods

- *Constructor(options)* - A constructor (which can be used without `new`) to be supplied an options object with the following optional properties:
  - `languages` - Array of BCP 47 language tags in order of preference. Can also be a string for a single tag (e.g., "en-US"), or, if not supplied, will default to `navigator.language` or `en-US`. Will be used as the second argument to the `IntlMessageFormat` constructor.
  - `namespace` - Initial namespace for the formatter function supplied as the first argument to `callback`. Defaults to value of `defaultNamespace`. Namespaces may be expressed as an array of namespace parts or as a string. Will be used in conjunction with a separator. See the example above for an illustration of the two allowable JSON file format structures.
  - `defaultNamespace` - Used when a namespace is not provided to `getFormatter`. Defaults to empty string.
  - `defaultSeparator` - Separator to be used with namespaces. Defaults to `.`.
  - `basePath` - Base path for locale file resolution. Defaults to `locales/`.
  - `localeFileResolver` - Accepts a BCP 47 language tag as an argument, and should return a file path for obtaining the corresponding JSON locale file. Defaults to a function which uses `basePath` and then adds `.json` to the supplied language tags for the file name within the base path.
  - `callback` - Supplied with the following arguments upon loading of locales:
    1. A formatter function based on `namespace` (or `defaultNamesapce` or the empty string if none supplied)
    1. A generic formatter building function (see `getFormatter` method)
    1. Locale files as JSON objects
- `getFormatter(ns, sep)` - A generic formatter building method; can be supplied an optional namespace and optional separator, defaulting otherwise to `defaultNamespace` and `defaultSeparator`, respectively. The namespace can either be an array of namespace parts or a string with the separator already applied. The namespace (along with separator interpolated between and after) will be prepended to the key supplied by the user when the formatter function is called. Will be automatically invoked (and the result supplied to `callback`) if `callback` or `languages` is supplied upon instantiation. The returned formatter function can be called with the following arguments:
  1. `key` - Lookup key for a `IntlMessageFormat`-formatted message in the locales file (will be prepended as per the above by any supplied namespaces and separators). If no `values` or `formats` objects are supplied, the literal value from the locales file will be returned without any `IntlMessageFormat` processing.
  1. `values` - Optional values object (same as accepted by `IntlMessageFormat.format()`)
  1. `formats` - Optional formats object (same as accepted by third argument to the `IntlMessageFormat` constructor).
- `loadLocales(langs, cb)` - Loads the locale file objects. Will be automatically invoked if `callback` or `languages` is supplied upon instantiation. The second callback argument is optional and will be invoked with each locale object as an argument after the locales have loaded (with the locales also available as an array of objects on the `locales` property).

## Properties

- `langs` - Will automatically be set (as an array of BCP 47 language tags) upon calls to `loadLocales`.
- `locales` - Will automatically be set to an array of locale JSON objects as loaded by `loadLocales`.

# To-dos

1. Bower publish: Awaiting [intl-messageformat](https://github.com/yahoo/intl-messageformat) Bower unpublishing so can add own copy as dependency. Then change my own usage example and demo to refer to the `intl-messageformat` directory.
1. Add logic to recover if file like `en-US.json` is not present but `en.json` is (might enhance `getJSON` errBack to capture thrown object with file property indicating the file causing the error).
