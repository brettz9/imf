# 0.2.0
- Allow formatter function to be supplied arguments as an object
- Add a `fallback` callback argument to the formatter function which, whenever a message cannot be found for `languages`, will be supplied a single object argument with properties, `message`, `langs`, `namespace`, `separator`, `key`, `values`, and `formats` and whose return value will be used for the return value of the formatter function. Note that `message` will contain the value for the message of the `fallbackLanguage` locale if `fallbackLanguage` (or `fallbackLocale`) had been supplied.

# 0.1.2
- Avoid bundling intl-messageformat dependency

# 0.1.1
- Bug: Avoid double-addition of separator for arrays
