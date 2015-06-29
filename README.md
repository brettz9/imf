# imf

A convenience wrapper for [intl-messageformat](https://github.com/yahoo/intl-messageformat).

# API

- *Constructor(options)* - A constructor (which can be used without `new`) to be supplied an options object with the following properties:

- `languages` - String for a single BCP 47 language tag or array of tags (e.g., "en-US")
- `namespace` - Defaults to value of `defaultNamespace`
- `defaultNamespace` - Defaults to empty string.
- `defaultSeparator` - Defaults to `.`.
- `callback` - Supplied with the following arguments:

1. a formatter function based on `namespace`
1. a generic formatter building function independent (which can be supplied an optional namespace and optional separator, defaulting otherwise to `defaultNamespace` and `defaultSeparator`, respectively)
1. 


- `getFormatter` - 
- `loadLocales` - 

- `langs` - 
- `locales` - 


# To-dos

1. Bower publish: Awaiting [intl-messageformat](https://github.com/yahoo/intl-messageformat) Bower unpublishing so can add own copy as dependency.