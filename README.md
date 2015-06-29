# imf

A convenience wrapper for [intl-messageformat](https://github.com/yahoo/intl-messageformat).

# Installation

`bower install imf`

# Usage

```html
<script src="bower_components/imf/index.js"></script>
<script src="bower_components/intl-messageformat/intl-messageformat-with-locales.min.js"></script>
```

# Example

```js
IMF({
    languages: ['en', 'es', 'pt', 'zh-CN'],
    callback: function () {
        
    }
});
```

# API

## Methods

- *Constructor(options)* - A constructor (which can be used without `new`) to be supplied an options object with the following properties:
  - `languages` - String for a single BCP 47 language tag or array of tags (e.g., "en-US")
  - `namespace` - Initial namespace for the formatter function supplied as the first argument to `callback`. Defaults to value of `defaultNamespace`
  - `defaultNamespace` - Used when a namespace is not provided to `getFormatter`. Defaults to empty string.
  - `defaultSeparator` - Defaults to `.`.
  - `basePath` - Defaults to `locales/`.
  - `localeFileResolver` - Accepts a BCP 47 language tag as an argument, and should return a file path for obtaining the corresponding JSON locale file. Defaults to a function which uses `basePath` and then adds `.json` to the supplied language tags for the file name within the base path.
  - `callback` - Supplied with the following arguments:
    1. A formatter function based on `namespace`
    1. A generic formatter building function (see `getFormatter` method)
    1. Locale files as JSON objects
- `getFormatter(ns, sep)` - A generic formatter building method; can be supplied an optional namespace and optional separator, defaulting otherwise to `defaultNamespace` and `defaultSeparator`, respectively. Will be automatically invoked (and the result supplied to `callback`) if `languages` is supplied upon instantiation.
- `loadLocales(langs, cb)` - Will be automatically invoked if `languages` is supplied upon instantiation. 

## Properties

- `langs` - Will automatically be set (as an array of BCP 47 language tags) upon calls to `loadLocales`.
- `locales` - Will automatically be set to an array of locale JSON objects as loaded by `loadLocales`.


# To-dos

1. Bower publish: Awaiting [intl-messageformat](https://github.com/yahoo/intl-messageformat) Bower unpublishing so can add own copy as dependency.
