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
  - `namespace` - Defaults to value of `defaultNamespace`
  - `defaultNamespace` - Defaults to empty string.
  - `defaultSeparator` - Defaults to `.`.
  - `callback` - Supplied with the following arguments:
    1. A formatter function based on `namespace`
    1. A generic formatter building function (see `getFormatter` method)
    1. Locale files as JSON objects
- `getFormatter(ns, sep)` - A generic formatter building method; can be supplied an optional namespace and optional separator, defaulting otherwise to `defaultNamespace` and `defaultSeparator`, respectively. Will be automatically invoked if `languages` is supplied upon instantiation.
- `loadLocales(langs, cb)` - 

## Properties

- `langs` - 
- `locales` - 


# To-dos

1. Bower publish: Awaiting [intl-messageformat](https://github.com/yahoo/intl-messageformat) Bower unpublishing so can add own copy as dependency.